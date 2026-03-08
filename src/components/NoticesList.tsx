'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, BellRing } from 'lucide-react';
import { format } from 'date-fns';

gsap.registerPlugin(ScrollTrigger);

interface NoticeItem {
  id: string;
  title: string;
  content: { title: string, items: string[] }; // Parsed JSONB
  notice_date: string;
}

export default function NoticesList({ notices }: { notices: NoticeItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Timeline sequence animation
    const nodes = gsap.utils.toArray('.timeline-node');
    
    nodes.forEach((node: any, i) => {
      // Alternate left/right slide in for desktop timeline
      const xOffset = i % 2 === 0 ? -50 : 50;
      
      gsap.fromTo(node,
        { opacity: 0, x: xOffset, y: 20 },
        {
          opacity: 1, x: 0, y: 0,
          duration: 0.8, ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: node,
            start: 'top bottom-=50',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });
  }, [notices]);

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto py-12 px-6 relative">
      
      <div className="flex items-center gap-3 mb-16 pl-4 md:pl-0 md:justify-center">
        <BellRing className="w-8 h-8 text-amber-400" />
        <h1 className="text-3xl font-bold tracking-tight text-white">교회 소식</h1>
      </div>

      {/* Center Line for Timeline (hidden on small screens) */}
      <div className="hidden md:block absolute top-[120px] bottom-0 left-1/2 -ml-px w-px bg-gradient-to-b from-indigo-500 via-white/10 to-transparent" />

      <div className="space-y-12 relative">
        {notices.map((notice, idx) => {
          const isEven = idx % 2 === 0;

          return (
            <div key={notice.id} className="timeline-node relative flex items-center justify-between md:justify-normal group">
              
              {/* Mobile Timeline dot */}
              <div className="md:hidden absolute -left-[19px] top-6 w-3 h-3 rounded-full bg-indigo-500 border-[3px] border-neutral-950 z-10" />
              {/* Mobile Timeline line */}
              <div className="md:hidden absolute -left-4 top-0 bottom-[-48px] w-px bg-white/10" />

              <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between">
                
                {/* Left Side Content */}
                <div className={`w-full md:w-[45%] ${!isEven ? 'md:order-3' : 'md:order-1'}`}>
                  <div className={`p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:border-indigo-500/30 ${!isEven ? 'md:bg-indigo-950/20' : ''}`}>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-semibold tracking-wider text-indigo-300 uppercase">
                        {format(new Date(notice.notice_date), 'MMM dd, yyyy')}
                      </span>
                    </div>

                    <h2 className="text-xl font-medium text-white mb-4 group-hover:text-indigo-400 transition-colors">
                      {notice.title || notice.content.title}
                    </h2>

                    <ul className="space-y-2">
                      {notice.content.items.map((item, i) => (
                        <li key={i} className="flex gap-3 text-sm text-neutral-300 leading-relaxed">
                          <span className="text-indigo-500">•</span>
                          <span className="flex-1">{item}</span>
                        </li>
                      ))}
                    </ul>

                  </div>
                </div>

                {/* Center Timeline Node (Desktop) */}
                <div className="hidden md:flex order-2 w-[10%] justify-center relative z-10">
                  <div className="w-4 h-4 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)] border-4 border-neutral-950 transition-transform duration-300 group-hover:scale-150" />
                </div>
                
                {/* Empty Space for the other side */}
                <div className="hidden md:block w-[45%] order-3" />
                
              </div>
            </div>
          );
        })}
      </div>
      
    </div>
  );
}
