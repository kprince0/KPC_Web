import { useEffect, useState, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  image_url?: string;
  created_at: string;
  is_edited: boolean;
  is_deleted: boolean;
  profiles: {
    full_name: string;
    role: string;
    is_chat_blocked?: boolean;
  };
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  // 1. Initial Fetch
  const fetchMessages = useCallback(async () => {
    console.log('--- Fetching Chat Messages (Last 100) ---');
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        id, user_id, message, image_url, created_at, is_edited, is_deleted,
        profiles (full_name, role, is_chat_blocked)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching chat messages:', error);
    } else if (data) {
      console.log(`Fetched ${data.length} messages successfully.`);
      // Ensure data is typed correctly and has fallback for profiles
      const formattedData: ChatMessage[] = data.map(item => ({
        ...item,
        profiles: item.profiles || { full_name: '알 수 없음', role: 'Guest', is_chat_blocked: false }
      })) as unknown as ChatMessage[];
      
      setMessages(formattedData.reverse());
    }
    setIsLoading(false);
  }, [supabase]);

  // 2. Realtime Subscription
  useEffect(() => {
    fetchMessages();

    console.log('--- Chat Realtime Subscription Start ---');
    const channel = supabase
      .channel('public:chat_messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_messages' },
        async (payload) => {
          console.log('Received Realtime Event:', payload.eventType, payload);

          if (payload.eventType === 'INSERT') {
            try {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('full_name, role, is_chat_blocked')
                .eq('id', payload.new.user_id)
                .single();

              if (profileError) console.warn('Profile fetch error:', profileError);

              const newMessage: ChatMessage = {
                ...(payload.new as ChatMessage),
                profiles: profileData || { full_name: 'Unknown', role: 'Guest', is_chat_blocked: false }
              };
              setMessages((prev) => [...prev, newMessage]);
            } catch (err) {
              console.error('Error handling new message:', err);
              setMessages((prev) => [...prev, { 
                ...(payload.new as ChatMessage), 
                profiles: { full_name: 'Someone', role: 'Member', is_chat_blocked: false }
              }]);
            }
          } 
          else if (payload.eventType === 'UPDATE') {
            setMessages((prev) => 
              prev.map(msg => msg.id === payload.new.id ? { ...msg, ...payload.new } : msg)
            );
          } 
          else if (payload.eventType === 'DELETE') {
            setMessages((prev) => prev.filter(msg => msg.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime Channel Status:', status);
      });

    return () => {
      console.log('--- Chat Realtime Subscription Cleaned ---');
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchMessages]);

  // 3. Operations
  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `chat/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('chat_images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('chat_images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const sendMessage = async (message: string, imageUrl?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('chat_messages').insert([{ user_id: user.id, message, image_url: imageUrl }]);
  };

  const updateMessage = async (id: string, message: string) => {
    await supabase.from('chat_messages').update({ message, is_edited: true }).eq('id', id);
  };

  const deleteMessage = async (id: string) => {
    await supabase.from('chat_messages').update({ is_deleted: true, message: '삭제된 메시지입니다.' }).eq('id', id);
  };

  const manageUserChat = async (userId: string, blocked: boolean) => {
    await supabase.from('profiles').update({ is_chat_blocked: blocked }).eq('id', userId);
  };

  return { messages, sendMessage, uploadImage, updateMessage, deleteMessage, manageUserChat, isLoading };
}
