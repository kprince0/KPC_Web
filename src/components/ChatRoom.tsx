'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat, ChatMessage } from '@/hooks/useChat';
import { Send, Loader2, MoreVertical, Trash2, Edit2, ShieldAlert, UserPlus, UserMinus, X, Image as ImageIcon, Plus } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import gsap from 'gsap';

const ADMIN_ROLES = ['Pastor', 'Elder', 'MediaTeam', 'Deacon', 'Admin'];

export default function ChatRoom({ currentUserId, userRole }: { currentUserId: string, userRole: string }) {
  const { messages, sendMessage, uploadImage, updateMessage, deleteMessage, manageUserChat, isLoading } = useChat();
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState('');
  const [showMemberAction, setShowMemberAction] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = ADMIN_ROLES.includes(userRole);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedFile) return;

    setIsUploading(true);
    let imageUrl = '';
    
    try {
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }
      
      const msg = input.trim();
      setInput('');
      clearFile();
      await sendMessage(msg, imageUrl);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('메시지 전송에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const startEdit = (msg: ChatMessage) => {
    setEditingId(msg.id);
    setEditInput(msg.message);
    setShowMemberAction(null);
  };

  const handleUpdate = async () => {
    if (!editingId || !editInput.trim()) return;
    await updateMessage(editingId, editInput.trim());
    setEditingId(null);
    setEditInput('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10 h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col h-[700px] w-full max-w-2xl mx-auto rounded-[2rem] bg-neutral-900 border border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden relative">
      
      {/* Header */}
      <div className="px-6 py-5 bg-neutral-900/50 border-b border-white/5 backdrop-blur-md z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <span className="text-xl">⛪</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">💒 실시간 소통방(v2)</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Live Now</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 text-neutral-400 border border-white/10">성도 🔒</span>
        </div>
      </div>

      {/* Message List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#1a1a1a]">
        {messages.map((msg, i) => {
          const isMe = msg.user_id === currentUserId;
          const msgAdmin = ADMIN_ROLES.includes(msg.profiles.role);
          const showDateDivider = i === 0 || !isSameDay(new Date(msg.created_at), new Date(messages[i-1].created_at));
          const isConsecutive = i > 0 && messages[i-1].user_id === msg.user_id && isSameDay(new Date(msg.created_at), new Date(messages[i-1].created_at));

          return (
            <div key={msg.id} className="space-y-4">
              {showDateDivider && (
                <div className="flex justify-center my-8">
                  <span className="px-4 py-1.5 rounded-full bg-white/5 text-[10px] font-bold text-neutral-500 uppercase tracking-widest border border-white/5">
                    {format(new Date(msg.created_at), 'yyyy년 MM월 dd일')}
                  </span>
                </div>
              )}

              <div className={`flex group ${isMe ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
                {/* Avatar area */}
                {!isMe && !isConsecutive ? (
                  <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-white/10 flex items-center justify-center text-sm font-bold text-neutral-400 shrink-0">
                    {msg.profiles.full_name[0]}
                  </div>
                ) : (
                  <div className="w-9 shrink-0" />
                )}

                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  {/* Name area */}
                  {!isMe && !isConsecutive && (
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-xs font-bold text-neutral-300">{msg.profiles.full_name}</span>
                      {msgAdmin && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 font-bold uppercase">
                          {msg.profiles.role}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="relative group/bubble flex items-end gap-2 text-[#e5e5e5]">
                    {/* Timestamp for Me */}
                    {isMe && !msg.is_deleted && (
                      <span className="text-[9px] text-neutral-600 mb-1 font-medium italic">
                        {format(new Date(msg.created_at), 'HH:mm')}
                      </span>
                    )}

                    {/* Bubble */}
                    <div className={`
                      group relative overflow-hidden transition-all
                      ${msg.is_deleted 
                        ? 'px-4 py-3 rounded-2xl bg-neutral-800/30 text-neutral-600 border border-white/5 italic' 
                        : isMe 
                          ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border border-indigo-500/50 rounded-2xl rounded-tr-sm' 
                          : 'bg-neutral-800 text-neutral-100 border border-white/10 rounded-2xl rounded-tl-sm hover:bg-neutral-750'}
                    `}>
                      {/* Message Content */}
                      <div className={msg.image_url ? '' : 'px-4 py-3'}>
                        {msg.image_url && (
                          <div className="mb-2 max-w-sm rounded-lg overflow-hidden border border-white/5">
                            <img src={msg.image_url} alt="Chat attachment" className="w-full h-auto object-cover max-h-96" />
                          </div>
                        )}
                        
                        {editingId === msg.id ? (
                          <div className="flex flex-col gap-2 min-w-[200px] p-2">
                            <textarea
                              value={editInput}
                              onChange={(e) => setEditInput(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-indigo-500"
                              autoFocus
                            />
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingId(null)} className="text-[10px] text-neutral-400 hover:text-white">취소</button>
                              <button onClick={handleUpdate} className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold">완료</button>
                            </div>
                          </div>
                        ) : (
                          <div className={msg.image_url ? 'px-4 pb-3' : ''}>
                            {msg.message}
                            {msg.is_edited && !msg.is_deleted && <span className="text-[9px] opacity-40 ml-2">(수정됨)</span>}
                          </div>
                        )}
                      </div>

                      {/* Actions Tooltip (Hover) */}
                      {!msg.is_deleted && !editingId && (
                        <div className={`
                          absolute top-0 ${isMe ? 'right-full mr-2' : 'left-full ml-2'} 
                          opacity-0 group-hover/bubble:opacity-100 transition-opacity flex items-center gap-1.5 p-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl
                        `}>
                          {(isMe || isAdmin) && (
                            <button onClick={() => deleteMessage(msg.id)} className="p-1.5 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 rounded-lg transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {isMe && (
                            <button onClick={() => startEdit(msg)} className="p-1.5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-lg transition-colors">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {isAdmin && !isMe && (
                             <button 
                               onClick={() => setShowMemberAction(msg.user_id)} 
                               className="p-1.5 hover:bg-indigo-500/20 text-neutral-400 hover:text-indigo-400 rounded-lg transition-colors"
                             >
                               <ShieldAlert className="w-3.5 h-3.5" />
                             </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Timestamp for Others */}
                    {!isMe && !msg.is_deleted && (
                      <span className="text-[9px] text-neutral-600 mb-1 font-medium italic">
                        {format(new Date(msg.created_at), 'HH:mm')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Admin Member Action Overlay */}
              {showMemberAction === msg.user_id && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
                  <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 w-full max-w-xs shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-white">사용자 관리</h4>
                      <button onClick={() => setShowMemberAction(null)}><X className="w-4 h-4 text-neutral-500" /></button>
                    </div>
                    <div className="space-y-3">
                       <p className="text-xs text-neutral-400 italic mb-4">"{msg.profiles.full_name}" 성도님에 대한 조치</p>
                       <button 
                         onClick={async () => {
                           await manageUserChat(msg.user_id, !msg.profiles.is_chat_blocked);
                           setShowMemberAction(null);
                           alert(msg.profiles.is_chat_blocked ? '차단 해제되었습니다.' : '강제 퇴장 처리되었습니다.');
                         }}
                         className={`w-full py-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all
                           ${msg.profiles.is_chat_blocked 
                             ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' 
                             : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'}`}
                       >
                         {msg.profiles.is_chat_blocked ? <UserPlus className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
                         {msg.profiles.is_chat_blocked ? '채팅 참여 허용' : '채팅방 강퇴하기'}
                       </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-neutral-950/60 border-t border-white/5 backdrop-blur-xl z-20">
        {/* Preview Area */}
        {previewUrl && (
          <div className="mb-4 relative inline-block animate-in slide-in-from-bottom-2 duration-300">
            <img src={previewUrl} className="w-20 h-20 object-cover rounded-xl border border-white/20" alt="Preview" />
            <button 
              onClick={clearFile}
              className="absolute -top-2 -right-2 p-1 bg-black/80 text-white rounded-full border border-white/20 hover:bg-red-500 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-indigo-500 text-white hover:bg-indigo-400 rounded-2xl border border-indigo-400/50 transition-all hover:scale-110 active:scale-95 group/upload shadow-[0_0_20px_rgba(99,102,241,0.4)]"
            title="사진 보내기"
          >
            <ImageIcon className="w-6 h-6" />
          </button>

          <div className="flex-1 relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isUploading ? "전송 중..." : "은혜로운 대화를 나누어 보세요..."}
              disabled={isUploading}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-5 pr-12 py-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all placeholder:text-neutral-600 shadow-inner disabled:opacity-50"
            />
            <button
              id="chat-send-btn"
              type="submit"
              disabled={(!input.trim() && !selectedFile) || isUploading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl disabled:opacity-20 disabled:scale-95 disabled:grayscale transition-all shadow-lg shadow-indigo-600/20 active:scale-90"
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </form>
        <p className="mt-3 text-[10px] text-center text-neutral-600 uppercase tracking-[0.2em] font-bold">
          God is Love • Respect Others
        </p>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
