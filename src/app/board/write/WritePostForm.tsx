'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Paperclip, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function WritePostForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    const uploadResults = [];
    
    for (const file of selectedFiles) {
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
        alert('로그인이 필요한 서비스입니다.');
        router.push('/');
        return;
      }

      // 1. 파일 업로드 진행
      const attachments = await uploadFiles();

      // 2. 작성자 이름 가져오기
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
        
      const authorName = profile?.full_name || '익명';

      // 3. 게시글 등록하기 (자유게시판 기준)
      const { error } = await supabase
        .from('free_board_posts')
        .insert([
          {
            title: title.trim(),
            content: content.trim(),
            author_id: user.id,
            author_name: authorName,
            attachments: attachments // JSONB 컬럼에 저장
          }
        ]);

      if (error) throw error;

      router.push('/board');
      router.refresh();
      
    } catch (error) {
      console.error('Error submitting post:', error);
      alert('게시글 작성에 실패했습니다.');
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
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-neutral-300 group hover:border-white/20 transition-colors">
              {file.type.startsWith('image/') ? <ImageIcon className="w-3 h-3 text-indigo-400" /> : <FileText className="w-3 h-3 text-neutral-400" />}
              <span className="max-w-[150px] truncate">{file.name}</span>
              <button 
                type="button"
                onClick={() => removeFile(index)}
                className="hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-400 hover:bg-indigo-500/20 transition-all"
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
          className="px-8 py-2.5 rounded-full text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            '등록하기'
          )}
        </button>
      </div>
    </form>
  );
}

