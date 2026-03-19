'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Paperclip, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';

interface EditPostFormProps {
  post: {
    id: string;
    title: string;
    content: string;
    attachments: any[];
  }
}

export default function EditPostForm({ post }: EditPostFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState(post.title || '');
  const [content, setContent] = useState(post.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Existing files from DB
  const [existingFiles, setExistingFiles] = useState<any[]>(post.attachments || []);
  
  // New files dropped in
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const addedFiles = Array.from(e.target.files);
      setNewFiles(prev => [...prev, ...addedFiles]);
    }
  };

  const removeExistingFile = (index: number) => {
    setExistingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadNewFiles = async () => {
    const uploadResults = [];
    
    for (const file of newFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { data, error } = await supabase.storage
        .from('church-assets')
        .upload(filePath, file);

      if (error) {
        console.error('Upload Error:', error);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('church-assets')
        .getPublicUrl(filePath);

      uploadResults.push({
        name: file.name,
        url: publicUrl,
        type: file.type,
        size: file.size
      });
    }
    
    return uploadResults;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('로그인이 필요합니다.');
        router.push('/');
        return;
      }

      // 1. 새로운 파일들 업로드
      const uploadedNewFiles = await uploadNewFiles();

      // 2. 기존 파일 + 새 파일 병합
      const finalAttachments = [...existingFiles, ...uploadedNewFiles];

      // 3. 게시글 수정 업데이트
      const { error } = await supabase
        .from('free_board_posts')
        .update({
          title: title.trim(),
          content: content.trim(),
          attachments: finalAttachments,
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id);

      if (error) throw error;

      router.push(`/board/${post.id}`);
      router.refresh();
      
    } catch (error) {
      console.error('Error updating post:', error);
      alert('게시글 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-neutral-900/40 border border-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="text-sm font-medium text-neutral-300">제목</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-neutral-600"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="content" className="text-sm font-medium text-neutral-300">내용</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요..."
          className="w-full min-h-[300px] bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-neutral-600 resize-y"
          required
        />
      </div>

      {/* 첨부파일 섹션 */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
          <Paperclip className="w-4 h-4" />
          첨부파일 (이미지, PDF 등)
        </label>
        
        <div className="flex flex-wrap gap-2">
          {/* 기존 첨부파일 */}
          {existingFiles.map((file, index) => (
            <div key={`exist-${index}`} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/5 border border-indigo-500/20 rounded-full text-xs text-neutral-300 group hover:border-indigo-500/40 transition-colors">
              {file.type?.startsWith('image/') ? <ImageIcon className="w-3 h-3 text-indigo-400" /> : <FileText className="w-3 h-3 text-neutral-400" />}
              <span className="max-w-[150px] truncate">{file.name}</span>
              <button 
                type="button"
                onClick={() => removeExistingFile(index)}
                className="hover:text-red-400 transition-colors"
                title="삭제"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* 새로 추가된 파일 */}
          {newFiles.map((file, index) => (
            <div key={`new-${index}`} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-full text-xs text-neutral-300 group hover:border-emerald-500/40 transition-colors">
              <span className="max-w-[150px] truncate">{file.name}</span>
              <button 
                type="button"
                onClick={() => removeNewFile(index)}
                className="hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-neutral-400 hover:bg-white/10 hover:text-white transition-all"
          >
            + 파일 추가
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf"
          />
        </div>
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
          className="px-8 py-2.5 rounded-full text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            '수정 완료'
          )}
        </button>
      </div>
    </form>
  );
}
