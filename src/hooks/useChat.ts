'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles: {
    full_name: string;
    role: string;
  };
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. Initial Fetch
  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        id, user_id, message, created_at,
        profiles (full_name, role)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      // Reverse to show oldest at top, newest at bottom
      setMessages(data.reverse() as unknown as ChatMessage[]);
    }
    setIsLoading(false);
  }, [supabase]);

  // 2. Realtime Subscription
  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel('public:chat_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        async (payload) => {
          // Fetch the associated profile for the new message
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', payload.new.user_id)
            .single();

          const newMessage: ChatMessage = {
            ...(payload.new as ChatMessage),
            profiles: profileData || { full_name: 'Unknown', role: 'Guest' }
          };

          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchMessages]);

  // 3. Send Message
  const sendMessage = async (message: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('chat_messages').insert([
      { user_id: user.id, message }
    ]);
  };

  return { messages, sendMessage, isLoading };
}
