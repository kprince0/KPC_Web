'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { format } from 'date-fns';

gsap.registerPlugin(ScrollTrigger);

interface ColumnItem {
  id: string;
  title: string;
  content: string; // The full text parsed by AI
  publish_date: string;
  author_name: string; // Joined from profiles
}

export default function ColumnsList({ columns }: { columns: ColumnItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Magazine style fade up sequence
    const articles = gsap.utils.toArray('.magazine-article');
    
    articles.forEach((article: any) => {
      gsap.fromTo(article,
        { opacity: 0, y: 40, filter: 'blur(10px)' },
        {
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 1, ease: 'power3.out',
          scrollTrigger: {
            trigger: article,
            start: 'top bottom-=100',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });
  }, [columns]);

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto py-12 px-6">
      
      <div className="text-center mb-16 magazine-article">
        <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-white mb-4">목회자 칼럼</h1>
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent w-full max-w-sm mx-auto" />
      </div>

      <div className="space-y-20">
        {columns.map((col, idx) => (
          <article 
            key={col.id} 
            className="magazine-article group flex flex-col items-center text-center relative"
          >
            {/* Minimalist Date & Author Badge */}
            <div className="flex items-center gap-3 text-xs tracking-widest text-neutral-400 uppercase mb-6">
              <span>{format(new Date(col.publish_date), 'yyyy.MM.dd')}</span>
              <span className="w-1 h-1 rounded-full bg-indigo-500/50" />
              <span>{col.author_name}</span>
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-medium text-white mb-8 group-hover:text-indigo-400 transition-colors duration-500 cursor-pointer">
              {col.title}
            </h2>

            {/* Truncated Content for List View */}
            <p className="text-lg text-neutral-300 leading-relaxed max-w-2xl text-justify md:text-center line-clamp-4">
              {col.content}
            </p>

            {/* Read More Button (Elegant) */}
            <button className="mt-8 px-6 py-2 border border-white/20 rounded-full text-sm hover:bg-white hover:text-black transition-all duration-300 antialiased">
              전체 읽기
            </button>

            {/* Divider for next except last */}
            {idx !== columns.length - 1 && (
              <div className="absolute -bottom-10 w-24 h-px bg-white/10" />
            )}
          </article>
        ))}
      </div>
      
    </div>
  );
}
