'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import gsap from 'gsap';

const ADMIN_ROLES = ['Pastor', 'Elder', 'MediaTeam', 'Deacon', 'Admin'];

export default function ChatRoom({ currentUserId }: { currentUserId: string }) {
  const { messages, sendMessage, isLoading } = useChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Entrance Animation
  useEffect(() => {
    if (!isLoading && containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
    }
  }, [isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Haptic / Visual feedback on send button (Micro-interaction)
    const btn = document.getElementById('chat-send-btn');
    if (btn) {
      gsap.fromTo(btn, { scale: 0.9 }, { scale: 1, duration: 0.2, ease: 'back.out(2)' });
    }

    const msg = input.trim();
    setInput('');
    await sendMessage(msg);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10 h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col h-[600px] w-full max-w-2xl mx-auto rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden relative">
      
      {/* Header */}
      <div className="px-6 py-4 bg-white/5 border-b border-white/5 backdrop-blur-sm z-10 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium text-white">라이브 교제방 🤔</h2>
          <p className="text-xs text-neutral-400">승인된 성도만 참여 가능한 실시간 채팅창입니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm text-neutral-300">On Air</span>
        </div>
      </div>

      {/* Message List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.map((msg, i) => {
          const isMe = msg.user_id === currentUserId;
          const isAdmin = ADMIN_ROLES.includes(msg.profiles.role);
          
          return (
            <div key={msg.id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1 max-w-[85%]`}>
              
              {!isMe && (
                <div className="flex items-center gap-2 ml-1">
                  <span className="text-sm font-medium text-neutral-200">{msg.profiles.full_name}</span>
                  {isAdmin && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {msg.profiles.role}
                    </span>
                  )}
                </div>
              )}

              <div className={`relative px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed backdrop-blur-md shadow-sm 
                ${isMe 
                  ? 'bg-indigo-600/80 text-white border border-indigo-500/50 rounded-tr-sm' 
                  : 'bg-white/10 text-neutral-100 border border-white/5 rounded-tl-sm'}`}>
                {msg.message}
              </div>

              <span className="text-[10px] text-neutral-500 mt-0.5 px-1">
                {msg.created_at ? format(new Date(msg.created_at), 'HH:mm') : 'Sending...'}
              </span>

            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 bg-neutral-950/40 border-t border-white/5 backdrop-blur-md z-10">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="은혜로운 대화를 나누어 보세요..."
            className="w-full bg-white/5 border border-white/10 rounded-full pl-5 pr-14 py-3 text-sm text-white focus:outline-none focus:border-indigo-400/50 focus:bg-white/10 transition-all placeholder:text-neutral-500"
          />
          <button
            id="chat-send-btn"
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 p-2 bg-indigo-500 text-white rounded-full disabled:opacity-50 disabled:bg-neutral-600 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
