'use client';

import { useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Upload, X, Loader2, Plus, Trash2, FolderOpen } from 'lucide-react';

interface PhotoItem {
  id: string;
  file: File;
  previewUrl: string;
  caption: string;
}

/** Canvas를 이용해 이미지를 압축합니다. 최종 파일을 최대 3MB, 최대 2400px 이하로 줄입니다. */
async function compressImage(file: File, maxSizeMB = 3, maxDimension = 2400): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      // 품질을 낮춰가며 목표 크기 이하로 압축
      let quality = 0.85;
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error('압축 실패')); return; }
            if (blob.size <= maxSizeMB * 1024 * 1024 || quality <= 0.3) {
              resolve(blob);
            } else {
              quality -= 0.1;
              tryCompress();
            }
          },
          'image/jpeg',
          quality
        );
      };
      tryCompress();
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function AdminPhotoUpload() {
  const [isOpen, setIsOpen] = useState(false);
  const [albumTitle, setAlbumTitle] = useState('');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, status: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (photos.length + files.length > 50) {
      alert('사진은 최대 50장까지 한꺼번에 올릴 수 있습니다.');
      return;
    }

    const newPhotos = files.map(file => ({
      id: Math.random().toString(36).substring(2),
      file,
      previewUrl: URL.createObjectURL(file),
      caption: '',
    }));

    setPhotos(prev => [...prev, ...newPhotos]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => {
      const removed = prev.find(p => p.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter(p => p.id !== id);
    });
  };

  const updateCaption = (id: string, value: string) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, caption: value } : p));
  };

  const handleClose = () => {
    if (photos.length > 0 && !confirm('작성 중인 내용이 사라집니다. 닫으시겠습니까?')) return;
    setIsOpen(false);
    setPhotos([]);
    setAlbumTitle('');
  };

  const handleUpload = async () => {
    if (photos.length === 0) return;

    setIsUploading(true);
    setUploadProgress({ current: 0, total: photos.length, status: '준비 중...' });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const attachments: { name: string; url: string; driveFileId: string; type: string; caption?: string }[] = [];

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        setUploadProgress({ current: i + 1, total: photos.length, status: `압축 중... (${i + 1}/${photos.length})` });

        // 1. 클라이언트 측 압축 (3MB / 2400px 이하)
        let uploadBlob: Blob;
        try {
          uploadBlob = await compressImage(photo.file);
        } catch {
          uploadBlob = photo.file; // 압축 실패 시 원본 사용
        }

        setUploadProgress(prev => ({ ...prev, status: `업로드 중... (${i + 1}/${photos.length})` }));

        // 2. Google Drive 업로드
        const formData = new FormData();
        formData.append('file', uploadBlob, photo.file.name);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          let errMsg = `HTTP ${uploadRes.status}`;
          try {
            const errData = await uploadRes.json();
            errMsg = errData.error || errMsg;
          } catch {
            if (uploadRes.status === 413) errMsg = '파일이 너무 큽니다.';
            else errMsg = uploadRes.statusText || errMsg;
          }
          throw new Error(`${photo.file.name}: ${errMsg}`);
        }

        const uploadData = await uploadRes.json();
        attachments.push({
          name: photo.file.name,
          url: `/api/drive/${uploadData.fileId}`,
          driveFileId: uploadData.fileId,
          type: 'image/jpeg',
          caption: photo.caption.trim() || undefined,
        });
      }

      // 3. 하나의 앨범으로 DB에 등록
      setUploadProgress(prev => ({ ...prev, status: 'DB 저장 중...' }));
      const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
      const finalTitle = albumTitle.trim() || today;

      const { error: dbError } = await supabase
        .from('photo_posts')
        .insert([{
          title: finalTitle,
          content: '',
          author_id: user.id,
          attachments,
        }]);

      if (dbError) throw dbError;

      alert(`"${finalTitle}" 앨범이 등록되었습니다. (${attachments.length}장)`);
      setIsOpen(false);
      setPhotos([]);
      setAlbumTitle('');
      window.location.reload();
    } catch (error: any) {
      console.error('Batch upload failed:', error);
      alert('업로드 중 오류가 발생했습니다:\n' + (error.message || ''));
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
        사진 앨범 올리기
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md">
      <div className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-neutral-900/50 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-bold text-white">사진 앨범 올리기</h3>
            <p className="text-sm text-neutral-400 mt-1">
              선택한 사진들이 하나의 앨범으로 등록됩니다. (최대 50장, 현재 {photos.length}장)
            </p>
          </div>
          <button onClick={handleClose} className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Album Title */}
        <div className="px-6 pt-5 pb-0">
          <div className="flex items-center gap-3 bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus-within:border-indigo-500/60 transition-colors">
            <FolderOpen className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <input
              type="text"
              value={albumTitle}
              onChange={e => setAlbumTitle(e.target.value)}
              placeholder="앨범 제목 (선택 — 비워두면 오늘 날짜로 저장됩니다)"
              className="flex-1 bg-transparent text-white placeholder:text-neutral-600 focus:outline-none text-base font-semibold"
            />
          </div>
        </div>

        {/* Photo Grid */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {photos.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center aspect-video md:aspect-[21/9] rounded-2xl border-2 border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-white/5 transition-all group cursor-pointer"
            >
              <div className="p-4 rounded-full bg-white/5 group-hover:bg-indigo-500/10 mb-4 transition-colors">
                <Plus className="w-10 h-10 text-neutral-500 group-hover:text-indigo-400" />
              </div>
              <p className="text-neutral-400 font-medium">클릭하여 사진들을 선택하세요 (최대 50장)</p>
              <p className="text-neutral-600 text-sm mt-2">JPG, PNG, WEBP 파일 지원 · 자동 압축 적용됨</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="group relative rounded-xl overflow-hidden bg-black/40 border border-white/5 animate-in fade-in duration-200"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="aspect-square">
                    <img src={photo.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  {/* Caption overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <input
                      type="text"
                      value={photo.caption}
                      onChange={e => updateCaption(photo.id, e.target.value)}
                      onClick={e => e.stopPropagation()}
                      placeholder="사진 설명 (선택)"
                      className="w-full bg-transparent text-white text-xs placeholder:text-white/40 focus:outline-none border-b border-white/20 focus:border-indigo-400 transition-colors pb-0.5"
                    />
                  </div>
                  {/* Delete */}
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500 text-white rounded-lg backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {/* Index */}
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 rounded text-[10px] font-bold text-white/60 backdrop-blur-md">
                    #{index + 1}
                  </div>
                </div>
              ))}

              {photos.length < 50 && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-indigo-500/40 hover:bg-white/5 flex flex-col items-center justify-center gap-2 text-neutral-600 hover:text-indigo-400 cursor-pointer transition-all"
                >
                  <Plus className="w-8 h-8" />
                  <span className="text-xs font-medium">사진 추가</span>
                </div>
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

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-neutral-900/50 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              {isUploading && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    <span>{uploadProgress.status}</span>
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
                onClick={handleClose}
                className="flex-1 md:flex-none px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all text-sm"
              >
                취소
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading || photos.length === 0}
                className="flex-[2] md:flex-none px-10 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 text-sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    올리는 중...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    {photos.length}장 앨범으로 등록
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
