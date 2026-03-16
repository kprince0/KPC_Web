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

  // 1. Initial Fetch on Mount & Auth State Change
  useEffect(() => {
    let mounted = true;
    
    const fetchMessages = async () => {
      console.log('--- Fetching Chat Messages (Last 100) ---');
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id, user_id, message, image_url, created_at, is_edited, is_deleted,
          profiles (full_name, role, is_chat_blocked)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching chat messages:', error);
      } else if (data && mounted) {
        console.log(`Fetched ${data.length} messages successfully.`);
        const formattedData: ChatMessage[] = data.map(item => {
          const prof = item.profiles as any;
          return {
            ...item,
            profiles: {
              full_name: prof?.full_name || '알 수 없음',
              role: prof?.role || 'Guest',
              is_chat_blocked: prof?.is_chat_blocked || false
            }
          };
        }) as unknown as ChatMessage[];
        
        setMessages(formattedData.reverse());
      }
      if (mounted) setIsLoading(false);
    };

    // Listen for auth state changes. When the session is ready (or user logs in), fetch messages.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Chat Auth State Changed:', event, session?.user?.id);
      if (session?.user && mounted) {
        fetchMessages();
      } else if (!session && mounted) {
        // If logged out, clear messages and stop loading
        setMessages([]);
        setIsLoading(false);
      }
    });

    // Subscriptions run immediately upon attachment if a session exists in some clients, 
    // but to be perfectly safe, we also trigger an initial check.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && mounted) {
        fetchMessages();
      } else if (!session && mounted) {
        setIsLoading(false);
      }
    });

    return () => { 
      mounted = false; 
      subscription.unsubscribe();
    };
  }, [supabase]);

  // 2. Realtime Subscription (Run exactly once on mount)
  useEffect(() => {
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
                profiles: {
                  full_name: profileData?.full_name || '알 수 없음',
                  role: profileData?.role || 'Guest',
                  is_chat_blocked: profileData?.is_chat_blocked || false
                }
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
  }, [supabase]);

  // 3. Operations
  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload image');
    }
    
    const data = await response.json();
    return `/api/drive/${data.fileId}`;
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
