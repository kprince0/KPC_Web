'use client';

import SermonPlayer from '@/components/SermonPlayer';
import BulletinCard from '@/components/BulletinCard';
import ChatRoom from '@/components/ChatRoom';
import PhotoBoard from '@/components/PhotoBoard';
import AIApprovalModal from '@/components/AIApprovalModal';
import ColumnsList from '@/components/ColumnsList';
import NoticesList from '@/components/NoticesList';
import { useState } from 'react';

export default function TestDashboard() {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8 space-y-24">
      <div className="max-w-7xl mx-auto space-y-4">
        <h1 className="text-4xl font-bold text-indigo-400 mt-20">Component Test Dashboard</h1>
        <p className="text-neutral-400">Phase 1-4 에서 제작된 컴포넌트들을 한눈에 확인하는 페이지입니다.</p>
        <hr className="border-white/10" />
      </div>

      {/* --- Phase 2: Sermon / Bulletin --- */}
      <section className="max-w-7xl mx-auto space-y-8">
        <h2 className="text-2xl font-semibold border-b border-white/20 pb-2">1. Sermon Player (Youtube Inline)</h2>
        <div className="w-full max-w-2xl">
           <SermonPlayer 
             youtubeId="dQw4w9WgXcQ" 
             title="주일 예배 샘플 영상" 
             thumbnailUrl="https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg" 
           />
        </div>

        <h2 className="text-2xl font-semibold border-b border-white/20 pb-2 mt-16">2. Bulletin Card (Antigravity & ScrollTrigger)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
           {/* Mocking thumbnail for testing without a real PDF backend running */}
           <BulletinCard 
             title="2026년 3월 1주차 주보" 
             date="2026-03-01" 
             fileUrl="#" 
             thumbnailUrl="https://images.unsplash.com/photo-1544413660-299165566b1d?w=400&h=533&fit=crop"
           />
           <BulletinCard 
             title="2026년 2월 4주차 주보" 
             date="2026-02-22" 
             fileUrl="#" 
             thumbnailUrl="https://images.unsplash.com/photo-1455390582262-044cdead2708?w=400&h=533&fit=crop"
           />
        </div>
      </section>

      {/* --- Phase 3: Photos & Chat --- */}
      <section className="max-w-7xl mx-auto space-y-8">
        <h2 className="text-2xl font-semibold border-b border-white/20 pb-2">3. Photo Board (Masonry Grid & Lightbox)</h2>
        <PhotoBoard photos={[
          { id: '1', url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop', alt: '예배 사진 1' },
          { id: '2', url: 'https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?w=600&auto=format&fit=crop', alt: '예배 사진 2' },
          { id: '3', url: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&auto=format&fit=crop', alt: '봉사 사진' },
          { id: '4', url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&auto=format&fit=crop', alt: '성가대' }
        ]} />

        <h2 className="text-2xl font-semibold border-b border-white/20 pb-2 mt-16">4. Live Chat Room (Glassmorphism & Realtime Placeholder)</h2>
        {/* Because the SDK requires initialized .env values, we mount it. If env fails, it spins loading forever. */}
        <div className="bg-neutral-900 border border-white/5 rounded-3xl p-8 flex items-center justify-center">
            <ChatRoom currentUserId="test-me" />
        </div>
      </section>
      
      {/* --- Phase 4: AI Workflow & Boards --- */}
      <section className="mx-auto space-y-8">
        <div className="max-w-7xl mx-auto">
           <h2 className="text-2xl font-semibold border-b border-white/20 pb-2">5. AI Approval Modal (GSAP Scanner)</h2>
           <button 
             onClick={() => setIsAiModalOpen(true)}
             className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors my-4"
           >
             AI 주보 분석기 띄우기 (Mock Demo)
           </button>
           <AIApprovalModal 
             isOpen={isAiModalOpen} 
             onClose={() => setIsAiModalOpen(false)} 
             imageUrl="https://images.unsplash.com/photo-1544413660-299165566b1d?w=400&h=533&fit=crop"
             onSave={(res) => console.log('Saved data:', res)}
           />
        </div>

        <div className="w-full bg-neutral-900/50 py-12 mt-16 border-y border-white/10">
           <div className="max-w-7xl mx-auto">
             <h2 className="text-2xl font-semibold mb-8 text-center text-neutral-400">6. Columns (Magazine Style)</h2>
           </div>
           <ColumnsList columns={[
              { id: 'c1', title: '그리스도의 사랑으로 짓는 집', content: '사랑하는 성도 여러분, 한 주간 평안하셨습니까? 우리는 모두 예수 그리스도라는 반석 위에 지어져 가는 성전입니다. 이번 주에는 서롤르 어떻게 사랑해야 할지에 대해 나누고자 합니다...', publish_date: '2026-03-08', author_name: '담임목사 김하늘' },
              { id: 'c2', title: '봄을 맞이하는 믿음의 자세', content: '겨울이 지나고 새 싹이 돋아나는 계절입니다. 우리의 영혼에도 굳어있던 것들이 녹아내리고 새로운 은혜의 싹이 돋아나길 소망합니다...', publish_date: '2026-02-28', author_name: '부목사 이바다' }
           ]} />
        </div>

        <div className="w-full bg-black py-12">
           <div className="max-w-7xl mx-auto">
             <h2 className="text-2xl font-semibold mb-8 text-center text-neutral-400">7. Notices (Timeline Style)</h2>
             <NoticesList notices={[
                { id: 'n1', title: '이번 주 주요 행사', notice_date: '2026-03-10', content: { title: '이번 주 주요 행사', items: ['금요 철야 예배 후 여전도회 임원 회의', '토요일 오전 10시 교회 대청소', '주일 오후 새가족 환영 만찬'] } },
                { id: 'n2', title: '교회학교 학부모 모임 안내', notice_date: '2026-03-01', content: { title: '', items: ['일번 주일 2부 예배 후 중고등부 실에서 진학 설명회가 있습니다.', '관심 있는 부모님들의 많은 참여 바랍니다.'] } },
                { id: 'n3', title: '추수감사절 강단 장식 봉사자 모집', notice_date: '2026-02-15', content: { title: '', items: ['꽃꽂이와 데코레이션에 은사가 있는 분들을 모십니다.', '문의: 박미영 권사'] } }
             ]} />
           </div>
        </div>
      </section>

      <div className="text-center py-20 text-neutral-500">
        <p>End of Components Library</p>
      </div>
    </div>
  );
}
