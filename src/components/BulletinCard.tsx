'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FileText, Download } from 'lucide-react';
import DeleteButton from './DeleteButton';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger);

interface BulletinCardProps {
  id?: string;
  title: string;
  date: string;
  thumbnailUrl?: string;
  fileUrl: string;
  isAdmin?: boolean;
}

export default function BulletinCard({ id, title, date, thumbnailUrl, fileUrl, isAdmin = false }: BulletinCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top bottom-=50",
          toggleActions: "play none none reverse"
        }
      }
    );
  }, []);

  const handleMouseEnter = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, { 
        y: -10, 
        scale: 1.02, 
        duration: 0.5, 
        ease: 'power2.out', 
        boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.25)' 
      });
    }
    if (imageRef.current) gsap.to(imageRef.current, { scale: 1.05, duration: 0.6, ease: 'power2.out' });
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, { 
        y: 0, 
        scale: 1, 
        duration: 0.5, 
        ease: 'power2.out', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
      });
    }
    if (imageRef.current) gsap.to(imageRef.current, { scale: 1, duration: 0.6, ease: 'power2.out' });
  };

  return (
    <div 
      ref={cardRef} 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-sm h-full"
    >
      <Link href={id ? `/bulletins/${id}` : '#'} className="flex flex-col h-full">
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-neutral-900 flex items-center justify-center">
          {thumbnailUrl ? (
            <img ref={imageRef} src={thumbnailUrl} alt={title} className="w-full h-full object-cover origin-center transition-transform duration-700" />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                <FileText className="w-10 h-10 text-indigo-400" />
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Admin Delete Action */}
          {isAdmin && id && (
            <div 
              className="absolute top-4 left-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <DeleteButton postId={id} tableName="bulletins" redirectPath="/bulletins" />
            </div>
          )}
        </div>
        
        <div className="p-5 flex flex-col gap-1 z-10 bg-neutral-950/50 flex-grow">
          <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">{title}</h3>
          <p className="text-xs text-neutral-500 mt-2 font-mono uppercase tracking-wider">{date}</p>
        </div>
      </Link>

      <a 
        href={fileUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        onClick={(e) => e.stopPropagation()}
        className="absolute top-4 right-4 bg-indigo-600 hover:bg-indigo-500 backdrop-blur-md p-2.5 rounded-full border border-white/20 transition-all duration-300 z-20 hover:scale-110 active:scale-95 shadow-xl shadow-indigo-600/20"
      >
        <Download className="w-4 h-4 text-white" />
      </a>
    </div>
  );
}


