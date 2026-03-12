'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Edit3, Check, X, Loader2 } from 'lucide-react';

interface AboutData {
  hero_title: string;
  hero_description: string;
  vision_title: string;
  vision_desc: string;
  values_title: string;
  values_desc: string;
  members_title: string;
  members_desc: string;
}

export default function AdminAboutEditor({ initialData }: { initialData: AboutData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<AboutData>(initialData);
  const [isSaving, setIsSaving] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // site_config 테이블에 저장 (없으면 상위 레벨에서 생성 로직 제안)
      const { error } = await supabase
        .from('site_config')
        .upsert({ id: 'about_page', content: data });

      if (error) throw error;
      alert('소개 내용이 수정되었습니다.');
      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      console.error('Save failed:', error);
      alert('저장에 실패했습니다. (site_config 테이블이 없는 경우 SQL 실행이 필요합니다)');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <button 
        onClick={() => setIsEditing(true)}
        className="fixed bottom-8 right-8 z-[70] bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 group"
      >
        <Edit3 className="w-6 h-6" />
        <span className="absolute right-full mr-4 bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-md border border-white/10">내용 수정하기</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 overflow-y-auto">
      <div className="bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-neutral-900 z-10">
          <h3 className="text-xl font-bold">소개 페이지 편집</h3>
          <div className="flex gap-2">
            <button onClick={() => setIsEditing(false)} className="p-2 text-neutral-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Hero Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-widest">히어로 섹션</h4>
            <div className="space-y-2">
              <label className="text-xs text-neutral-500">대제목</label>
              <input 
                value={data.hero_title}
                onChange={(e) => setData({...data, hero_title: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500/50 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-neutral-500">설명문</label>
              <textarea 
                value={data.hero_description}
                onChange={(e) => setData({...data, hero_description: e.target.value})}
                className="w-full h-32 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500/50 outline-none transition-all resize-none"
              />
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Cards Section */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-widest">하단 카드 정보</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-neutral-500">비전 제목</label>
                <input value={data.vision_title} onChange={(e) => setData({...data, vision_title: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none" />
                <textarea value={data.vision_desc} onChange={(e) => setData({...data, vision_desc: e.target.value})} className="w-full h-20 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-neutral-500">가치 제목</label>
                <input value={data.values_title} onChange={(e) => setData({...data, values_title: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none" />
                <textarea value={data.values_desc} onChange={(e) => setData({...data, values_desc: e.target.value})} className="w-full h-20 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none resize-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-neutral-500">멤버 제목</label>
              <input value={data.members_title} onChange={(e) => setData({...data, members_title: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none" />
              <textarea value={data.members_desc} onChange={(e) => setData({...data, members_desc: e.target.value})} className="w-full h-20 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none resize-none" />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 bg-neutral-900 flex gap-4">
          <button 
            onClick={() => setIsEditing(false)}
            className="flex-1 py-4 text-neutral-400 hover:text-white transition-colors text-sm font-bold"
          >
            취소
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            변경사항 저장하기
          </button>
        </div>
      </div>
    </div>
  );
}
