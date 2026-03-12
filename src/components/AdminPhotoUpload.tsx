'use client';

import { useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

export default function AdminPhotoUpload() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) return;

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      // 1. 파일 업로드
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `photos/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('church-assets')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('church-assets')
        .getPublicUrl(fileName);

      // 2. DB 등록 (photo_posts)
      // Note: phase3-schema.sql에는 photo_posts와 photo_attachments가 분리되어 있으나, 
      // 간단한 연동을 위해 photo_posts에 url 컬럼이 있다고 가정하거나 attachments 형식을 따릅니다.
      // 여기서는 photo_posts에 insert하고 publicUrl을 content나 별도 attachments 컬럼에 넣습니다.
      const { error: dbError } = await supabase
        .from('photo_posts')
        .insert([
          {
            title: title.trim(),
            author_id: user.id,
            // attachments 형식을 통일하여 사용합니다.
            attachments: [{ name: selectedFile.name, url: publicUrl, type: selectedFile.type }]
          }
        ]);

      if (dbError) throw dbError;

      alert('사진이 등록되었습니다.');
      setIsOpen(false);
      setTitle('');
      setSelectedFile(null);
      window.location.reload();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20"
      >
        <Upload className="w-4 h-4" />
        사진 올리기
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-bold">사진 업로드</h3>
          <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="사진 제목을 입력하세요"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">파일 선택</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group relative cursor-pointer aspect-video rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center hover:border-indigo-500/50 hover:bg-white/5 transition-all overflow-hidden"
            >
              {selectedFile ? (
                <>
                  <img 
                    src={URL.createObjectURL(selectedFile)} 
                    alt="Preview" 
                    className="absolute inset-0 w-full h-full object-cover group-hover:opacity-50 transition-opacity"
                  />
                  <div className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center">
                    <ImageIcon className="w-8 h-8 text-white mb-2" />
                    <span className="text-xs text-white font-medium">변경하려면 클릭</span>
                  </div>
                </>
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-neutral-500 group-hover:text-indigo-400 mb-2 transition-colors" />
                  <span className="text-sm text-neutral-500 group-hover:text-neutral-300 transition-colors">클릭하여 사진 선택</span>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={isUploading || !selectedFile || !title.trim()}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                업로드 중...
              </>
            ) : (
              '등록 완료'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
