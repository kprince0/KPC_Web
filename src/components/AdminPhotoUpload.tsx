'use client';

import { useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Upload, X, Loader2, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';

interface PhotoItem {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  description: string;
}

export default function AdminPhotoUpload() {
  const [isOpen, setIsOpen] = useState(false);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (photos.length + files.length > 20) {
      alert('사진은 최대 20장까지만 한꺼번에 올릴 수 있습니다.');
      return;
    }

    const newPhotos = files.map(file => ({
      id: Math.random().toString(36).substring(2),
      file,
      previewUrl: URL.createObjectURL(file),
      title: '',
      description: ''
    }));

    setPhotos(prev => [...prev, ...newPhotos]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => {
      const filtered = prev.filter(p => p.id !== id);
      const removed = prev.find(p => p.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return filtered;
    });
  };

  const updatePhotoInfo = (id: string, field: 'title' | 'description', value: string) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleUpload = async () => {
    if (photos.length === 0) return;

    // Validation
    const invalid = photos.some(p => !p.title.trim());
    if (invalid) {
      alert('모든 사진의 제목을 입력해 주세요.');
      return;
    }

    setIsUploading(true);
    setUploadProgress({ current: 0, total: photos.length });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        setUploadProgress(prev => ({ ...prev, current: i + 1 }));

        // 1. Storage 업로드
        const fileExt = photo.file.name.split('.').pop();
        const fileName = `photos/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('church-assets')
          .upload(fileName, photo.file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('church-assets')
          .getPublicUrl(fileName);

        // 2. DB 등록 (photo_posts)
        const { error: dbError } = await supabase
          .from('photo_posts')
          .insert([
            {
              title: photo.title.trim(),
              content: photo.description.trim(),
              author_id: user.id,
              attachments: [{ name: photo.file.name, url: publicUrl, type: photo.file.type }]
            }
          ]);

        if (dbError) throw dbError;
      }

      alert('모든 사진이 성공적으로 등록되었습니다.');
      setIsOpen(false);
      setPhotos([]);
      window.location.reload();
    } catch (error) {
      console.error('Batch upload failed:', error);
      alert('업로드 중 오류가 발생했습니다.');
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
        사진 대량 올리기
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md">
      <div className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-neutral-900/50 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-bold text-white">사진 대량 업로드</h3>
            <p className="text-sm text-neutral-400 mt-1">최대 20장까지 한꺼번에 올릴 수 있습니다. ({photos.length}/20)</p>
          </div>
          <button 
            onClick={() => {
              if (photos.length > 0 && !confirm('작성 중인 내용이 사라집니다. 닫으시겠습니까?')) return;
              setIsOpen(false);
            }} 
            className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {photos.length === 0 ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center aspect-video md:aspect-[21/9] rounded-2xl border-2 border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-white/5 transition-all group cursor-pointer"
            >
              <div className="p-4 rounded-full bg-white/5 group-hover:bg-indigo-500/10 mb-4 transition-colors">
                <Plus className="w-10 h-10 text-neutral-500 group-hover:text-indigo-400" />
              </div>
              <p className="text-neutral-400 font-medium">클릭하여 사진들을 선택하세요 (최대 20장)</p>
              <p className="text-neutral-600 text-sm mt-2">JPG, PNG 파일 지원</p>
            </div>
          ) : (
            <div className="space-y-4">
              {photos.map((photo, index) => (
                <div key={photo.id} className="group relative bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-6 animate-in slide-in-from-bottom-4 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="relative w-full md:w-48 aspect-video rounded-xl overflow-hidden border border-white/10">
                    <img src={photo.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500 text-white rounded-lg backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[10px] font-bold text-white/70 backdrop-blur-md">
                      #{index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <input
                        type="text"
                        value={photo.title}
                        onChange={(e) => updatePhotoInfo(photo.id, 'title', e.target.value)}
                        placeholder="사진 제목을 입력하세요 (필수)"
                        className="w-full bg-transparent text-lg font-bold text-white placeholder:text-neutral-600 focus:outline-none border-b border-white/5 focus:border-indigo-500 transition-colors py-1"
                      />
                    </div>
                    <div>
                      <textarea
                        value={photo.description}
                        onChange={(e) => updatePhotoInfo(photo.id, 'description', e.target.value)}
                        placeholder="사진에 대한 설명을 적어주세요 (선택)"
                        rows={2}
                        className="w-full bg-transparent text-sm text-neutral-400 placeholder:text-neutral-600 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {photos.length < 20 && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 rounded-2xl border-2 border-dashed border-white/5 hover:border-white/10 hover:bg-white/5 flex items-center justify-center gap-2 text-neutral-500 hover:text-neutral-400 transition-all font-medium"
                >
                  <Plus className="w-5 h-5" />
                  사진 더 보태기
                </button>
              )}
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="p-6 border-t border-white/10 bg-neutral-900/50 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    <span>처리 중...</span>
                    <span>{uploadProgress.current} / {uploadProgress.total}</span>
                  </div>
                  <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-300 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                      style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 md:flex-none px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all text-sm"
              >
                취소
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading || photos.length === 0}
                className="flex-[2] md:flex-none px-10 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 text-sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    올리는 중...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    {photos.length}장의 사진 등록하기
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
