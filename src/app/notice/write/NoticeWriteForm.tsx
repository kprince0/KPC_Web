'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2, Send, ArrowLeft, Plus, Trash2, X } from 'lucide-react';

export default function NoticeWriteForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [noticeDate, setNoticeDate] = useState(new Date().toISOString().split('T')[0]);
  const [sections, setSections] = useState([{ title: '', items: [''] }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const addSection = () => {
    setSections([...sections, { title: '', items: [''] }]);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const updateSectionTitle = (index: number, val: string) => {
    const newSections = [...sections];
    newSections[index].title = val;
    setSections(newSections);
  };

  const addItem = (sectionIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].items.push('');
    setSections(newSections);
  };

  const updateItem = (sectionIndex: number, itemIndex: number, val: string) => {
    const newSections = [...sections];
    newSections[sectionIndex].items[itemIndex] = val;
    setSections(newSections);
  };

  const removeItem = (sectionIndex: number, itemIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].items = newSections[sectionIndex].items.filter((_, i) => i !== itemIndex);
    setSections(newSections);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const { error } = await supabase
        .from('notices')
        .insert([
          {
            title: title.trim(),
            content: { sections }, // Storing as JSONB
            notice_date: noticeDate,
            author_id: user.id
          }
        ]);

      if (error) throw error;

      alert('공지사항이 등록되었습니다.');
      router.push('/'); // Or the actual notice list page if it exists
      router.refresh();
    } catch (error) {
      console.error('Notice submission failed:', error);
      alert('게시글 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header Fields */}
      <div className="bg-neutral-900/40 border border-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-neutral-400">공지 날짜</label>
            <input
              type="date"
              value={noticeDate}
              onChange={(e) => setNoticeDate(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-neutral-400">공지 제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 2026년 3월 2주차 교회 소식"
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
              required
            />
          </div>
        </div>
      </div>

      {/* Sections Builder */}
      <div className="space-y-6">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="bg-neutral-900/40 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-xl relative group/section">
            <button 
              type="button"
              onClick={() => removeSection(sIdx)}
              className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-red-400 transition-colors opacity-0 group-hover/section:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={section.title}
                onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
                placeholder="섹션 제목 (예: 예배 안내, 알림)"
                className="bg-transparent text-xl font-bold text-indigo-400 placeholder:text-neutral-700 outline-none border-b border-white/5 pb-2 focus:border-indigo-500/30 transition-all"
              />
              
              <div className="space-y-3">
                {section.items.map((item, iIdx) => (
                  <div key={iIdx} className="flex gap-3 group/item">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40 mt-3.5 flex-shrink-0" />
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateItem(sIdx, iIdx, e.target.value)}
                      placeholder="공지 내용을 입력하세요"
                      className="flex-grow bg-transparent text-neutral-200 placeholder:text-neutral-700 outline-none border-b border-transparent focus:border-white/5 pb-1 transition-all"
                    />
                    <button 
                      type="button"
                      onClick={() => removeItem(sIdx, iIdx)}
                      className="p-1 px-2 text-neutral-600 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addItem(sIdx)}
                  className="flex items-center gap-2 text-xs text-neutral-500 hover:text-indigo-400 transition-colors mt-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  항목 추가
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addSection}
          className="w-full py-4 border-2 border-dashed border-white/5 rounded-2xl text-neutral-500 hover:border-indigo-500/30 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          섹션 추가하기
        </button>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center pt-8 border-t border-white/10">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          뒤로가기
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          공지 등록하기
        </button>
      </div>
    </form>
  );
}
