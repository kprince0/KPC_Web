'use client';

import { useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Upload, X, Loader2, FileText, Calendar, Image as ImageIcon } from 'lucide-react';
import { extractFirstPageAsImage } from '@/lib/pdfThumbnail';

export default function AdminBulletinUpload() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [bulletinDate, setBulletinDate] = useState(new Date().toISOString().split('T')[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customThumbnail, setCustomThumbnail] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        alert('주보는 PDF 파일만 업로드 가능합니다.');
        return;
      }
      setSelectedFile(file);
      if (!title) {
        setTitle(`${bulletinDate} 주보`);
      }
    }
  };

  const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        alert('썸네일은 이미지 파일만 가능합니다.');
        return;
      }
      setCustomThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim() || !bulletinDate) return;

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      let thumbnailBlob: Blob;
      let isActuallyImage = false;

      // 1. 썸네일 준비 (수동 업로드 우선, 없으면 자동 추출)
      if (customThumbnail) {
        thumbnailBlob = customThumbnail;
        isActuallyImage = true;
      } else {
        const thumbnailBase64 = await extractFirstPageAsImage(selectedFile);
        const res = await fetch(thumbnailBase64);
        thumbnailBlob = await res.blob();
      }

      // 2. 파일 업로드 (PDF) - Google Drive 연동
      const pdfFormData = new FormData();
      pdfFormData.append('file', selectedFile);

      const pdfUploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: pdfFormData,
      });

      if (!pdfUploadRes.ok) {
        const errData = await pdfUploadRes.json();
        throw new Error(errData.error || 'PDF Google Drive 업로드 실패');
      }

      const pdfData = await pdfUploadRes.json();
      const publicUrl = `/api/drive/${pdfData.fileId}`;

      // 3. 썸네일 업로드 - Google Drive 연동
      const thumbExt = isActuallyImage ? customThumbnail?.name.split('.').pop() : 'jpg';
      const thumbFileName = `thumb-${Date.now()}.${thumbExt}`;
      
      const thumbFormData = new FormData();
      thumbFormData.append('file', thumbnailBlob, thumbFileName);

      const thumbUploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: thumbFormData,
      });

      let thumbnailUrl: string | null = null;
      if (!thumbUploadRes.ok) {
        console.warn('Thumbnail upload failed, but proceeding with PDF');
      } else {
        const thumbData = await thumbUploadRes.json();
        thumbnailUrl = `/api/drive/${thumbData.fileId}`;
      }

      // 4. DB 등록
      const { error: dbError } = await supabase
        .from('bulletins')
        .insert([
          {
            title: title.trim(),
            file_url: publicUrl,
            thumbnail_url: thumbnailUrl,
            bulletin_date: bulletinDate,
            author_id: user.id
          }
        ]);

      if (dbError) throw new Error(`데이터베이스 등록 실패: ${dbError.message}`);

      alert('주보가 등록되었습니다.');
      setIsOpen(false);
      resetForm();
      window.location.reload();
    } catch (error: any) {
      console.error('Bulletin upload failed:', error);
      alert(error.message || '업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setSelectedFile(null);
    setCustomThumbnail(null);
    setThumbPreview(null);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20"
      >
        <Upload className="w-4 h-4" />
        주보 업로드
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-neutral-800/30">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <FileText className="w-6 h-6 text-indigo-400" />
            새 주보 등록
          </h3>
          <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-all">
            <X className="w-6 h-6 text-neutral-400 hover:text-white" />
          </button>
        </div>
        
        <div className="p-8 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest pl-1">주보 날짜</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="date"
                  value={bulletinDate}
                  onChange={(e) => setBulletinDate(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest pl-1">제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="2026-03-12 주보"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* PDF Upload */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest pl-1 flex items-center justify-between">
                <span>주보 PDF 파일</span>
                <span className="text-[10px] text-indigo-400">필수</span>
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`group cursor-pointer rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 aspect-square ${
                  selectedFile 
                    ? 'border-indigo-500/50 bg-indigo-500/5' 
                    : 'border-white/10 hover:border-indigo-500/30 hover:bg-white/5'
                }`}
              >
                {selectedFile ? (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-4 border border-indigo-500/30">
                      <FileText className="w-7 h-7 text-indigo-400" />
                    </div>
                    <span className="text-sm text-white font-semibold mb-1 truncate max-w-[140px]">{selectedFile.name}</span>
                    <span className="text-[10px] text-neutral-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-neutral-600 group-hover:text-indigo-400 mb-4 transition-all group-hover:scale-110" />
                    <span className="text-sm text-neutral-500 group-hover:text-neutral-300 transition-colors font-semibold">PDF 선택</span>
                  </>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
            </div>

            {/* Thumbnail Upload (Optional) */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest pl-1 flex items-center justify-between">
                <span>표지 이미지</span>
                <span className="text-[10px] text-neutral-500">선택 (권장)</span>
              </label>
              <div 
                onClick={() => thumbInputRef.current?.click()}
                className={`group cursor-pointer rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 aspect-square ${
                  customThumbnail 
                    ? 'border-emerald-500/50 bg-emerald-500/5' 
                    : 'border-white/10 hover:border-emerald-500/30 hover:bg-white/5'
                }`}
              >
                {thumbPreview ? (
                  <div className="relative w-full h-full rounded-lg overflow-hidden border border-white/10">
                    <img src={thumbPreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs text-white font-bold bg-emerald-500/80 px-3 py-1.5 rounded-full">변경</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-10 h-10 text-neutral-600 group-hover:text-emerald-400 mb-4 transition-all group-hover:scale-110" />
                    <span className="text-sm text-neutral-500 group-hover:text-neutral-300 transition-colors font-semibold">이미지 선택</span>
                    <p className="text-[10px] text-neutral-600 mt-2 text-center leading-relaxed px-4">선택하지 않으면 PDF의 첫 페이지를 사용합니다.</p>
                  </>
                )}
              </div>
              <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbChange} />
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={isUploading || !selectedFile || !title.trim()}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-600/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                처리 중입니다...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                주보 등록하기
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
