'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2 } from 'lucide-react';

export default function EditSermonForm({ sermon }: { sermon: any }) {
  const router = useRouter();
  const [title, setTitle] = useState(sermon.title || '');
  const [preacher, setPreacher] = useState(sermon.preacher || '김강일');
  const [sermonDate, setSermonDate] = useState(sermon.sermon_date || '');
  const [scripture, setScripture] = useState(sermon.scripture || '');
  const [youtubeId, setYoutubeId] = useState(sermon.youtube_id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !youtubeId.trim()) return;

    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const { error } = await supabase
        .from('sermons')
        .update({
          title: title.trim(),
          preacher: preacher.trim(),
          sermon_date: sermonDate,
          scripture: scripture.trim(),
          youtube_id: youtubeId.trim(),
          thumbnail_url: `https://img.youtube.com/vi/${youtubeId.trim()}/maxresdefault.jpg`
        })
        .eq('id', sermon.id);

      if (error) throw error;

      router.push('/sermons');
      router.refresh();
      
    } catch (error) {
      console.error('Error updating sermon:', error);
      alert('설교 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-neutral-900/40 border border-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
      
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-neutral-300">설교 제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-neutral-300">설교자</label>
          <input
            type="text"
            value={preacher}
            onChange={(e) => setPreacher(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-neutral-300">설교 날짜</label>
          <input
            type="date"
            value={sermonDate}
            onChange={(e) => setSermonDate(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50"
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-neutral-300">본문 (성경 구절)</label>
        <input
          type="text"
          value={scripture}
          onChange={(e) => setScripture(e.target.value)}
          placeholder="예: 요한복음 3:16"
          className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-neutral-300">YouTube Video ID</label>
        <input
          type="text"
          value={youtubeId}
          onChange={(e) => setYoutubeId(e.target.value)}
          className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 font-mono"
          required
        />
        <p className="text-xs text-neutral-500 mt-1">예: https://youtube.com/watch?v=<b>dQw4w9WgXcQ</b> 에서 굵은 부분만 입력</p>
      </div>

      <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-white/10">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-full text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-2.5 rounded-full text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : '수정 완료'}
        </button>
      </div>
    </form>
  );
}
