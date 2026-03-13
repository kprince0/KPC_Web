'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Video, X, Loader2, Link as LinkIcon, Calendar, User, BookOpen } from 'lucide-react';

export default function AdminSermonUpload() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [preacher, setPreacher] = useState('김강일');
  const [scripture, setScripture] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [sermonDate, setSermonDate] = useState(new Date().toISOString().split('T')[0]);
  const [isUploading, setIsUploading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : url;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !youtubeUrl.trim() || !sermonDate) return;

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const youtubeId = extractYoutubeId(youtubeUrl);
      const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;

      const { error } = await supabase
        .from('sermons')
        .insert([
          {
            title: title.trim(),
            preacher,
            scripture: scripture.trim(),
            youtube_id: youtubeId,
            thumbnail_url: thumbnailUrl,
            sermon_date: sermonDate,
            author_id: user.id
          }
        ]);

      if (error) throw error;

      alert('설교 영상이 등록되었습니다.');
      setIsOpen(false);
      resetForm();
      window.location.reload();
    } catch (error: any) {
      console.error('Sermon upload failed:', error);
      alert('등록 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setPreacher('김강일');
    setScripture('');
    setYoutubeUrl('');
    setSermonDate(new Date().toISOString().split('T')[0]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
      >
        <Video className="w-5 h-5" />
        설교 등록
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-neutral-800/30">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <Video className="w-6 h-6 text-indigo-400" />
            새 설교 등록
          </h3>
          <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-all">
            <X className="w-6 h-6 text-neutral-400 hover:text-white" />
          </button>
        </div>
        
        <form onSubmit={handleUpload} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest pl-1">설교 날짜</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="date"
                  value={sermonDate}
                  onChange={(e) => setSermonDate(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest pl-1">설교자</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={preacher}
                  onChange={(e) => setPreacher(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest pl-1">설교 제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 믿음으로 승리하는 삶"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest pl-1">본문 말씀</label>
            <div className="relative">
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={scripture}
                onChange={(e) => setScripture(e.target.value)}
                placeholder="예: 창세기 1:1-5"
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest pl-1">YouTube URL 또는 ID</label>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                required
              />
            </div>
            <p className="text-[10px] text-neutral-500 pl-1 mt-1">유튜브 주소를 붙여넣으시면 자동으로 썸네일과 영상을 연결합니다.</p>
          </div>

          <button
            type="submit"
            disabled={isUploading || !title.trim() || !youtubeUrl.trim()}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-600/40 mt-4"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                등록 중...
              </>
            ) : (
              '설교 등록하기'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
