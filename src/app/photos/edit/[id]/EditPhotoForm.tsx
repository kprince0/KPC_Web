'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2 } from 'lucide-react';

export default function EditPhotoForm({ photoPost }: { photoPost: any }) {
  const router = useRouter();
  const [title, setTitle] = useState(photoPost.title || '');
  const [content, setContent] = useState(photoPost.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract thumbnail for visual cue
  const previewUrl = photoPost.attachments?.[0]?.url || '';

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const { error } = await supabase
        .from('photo_posts')
        .update({
          title: title.trim(),
          content: content.trim(),
        })
        .eq('id', photoPost.id);

      if (error) throw error;

      router.push('/photos');
      router.refresh();
      
    } catch (error) {
      console.error('Error updating photo:', error);
      alert('사진 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-neutral-900/40 border border-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
      
      {previewUrl && (
        <div className="w-full aspect-video rounded-xl overflow-hidden mb-2 shadow-lg border border-white/10 relative">
           <img src={previewUrl} alt="Preview" className="w-full h-full object-contain bg-black" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
           <p className="absolute bottom-3 left-4 text-xs font-semibold text-white/50 tracking-wider">PREVIEW</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-neutral-300">사진 제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="사진 제목을 입력하세요 (필수)"
          className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-bold"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-neutral-300">사진 설명</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="사진에 대한 설명을 적어주세요 (선택)"
          rows={4}
          className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all resize-y"
        />
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
