'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import AdminAboutEditor from '@/components/AdminAboutEditor';

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

export default function AboutClient({ data, isAdmin }: { data: AboutData, isAdmin: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && textRef.current) {
      const tl = gsap.timeline();
      tl.fromTo(containerRef.current, 
        { opacity: 0 }, 
        { opacity: 1, duration: 1.5, ease: 'power2.out' }
      )
      .fromTo(textRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'power3.out' },
        '-=1'
      );
    }
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden w-full relative">
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen flex flex-col items-center justify-center text-center">
        <div ref={textRef} className="space-y-12 relative z-10">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-tight">
               {data.hero_title.split(' ').map((word, i) => (
                 word === '공동체' || word === '사랑' 
                  ? <span key={i} className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400"> {word} </span> 
                  : <span key={i}> {word} </span>
               ))}
            </h1>
            <p className="text-lg md:text-2xl text-neutral-400 max-w-3xl mx-auto font-light leading-relaxed">
              {data.hero_description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              { title: data.vision_title, desc: data.vision_desc },
              { title: data.values_title, desc: data.values_desc },
              { title: data.members_title, desc: data.members_desc }
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 group">
                <h3 className="text-lg font-bold text-indigo-400 mb-3 group-hover:text-indigo-300 transition-colors">{item.title}</h3>
                <p className="text-neutral-400 leading-relaxed text-sm md:text-base">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 py-12 px-8 border border-white/10 rounded-[3rem] bg-gradient-to-b from-white/5 to-transparent relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-full bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
             <p className="text-xs font-medium text-indigo-300 tracking-widest uppercase mb-4">Church Introduction</p>
             <h2 className="text-2xl md:text-3xl font-bold mb-4">하나님의 사랑이 가득한 교회입니다.</h2>
             <p className="text-neutral-500 max-w-xl mx-auto">우리는 함께 예배하고, 함께 성장하며, 함께 세상을 섬기는 아름다운 공동체를 꿈꿉니다.</p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      </main>

      {isAdmin && <AdminAboutEditor initialData={data} />}
    </div>
  );
}
