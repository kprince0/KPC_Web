'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FileText, Download } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface BulletinCardProps {
  title: string;
  date: string;
  thumbnailUrl?: string; // Sourced via our pdfjs extraction logic or direct resizing
  fileUrl: string;
}

export default function BulletinCard({ title, date, thumbnailUrl, fileUrl }: BulletinCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    
    // GSAP ScrollTrigger Sequence for Reveal
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top bottom-=50", // Triggers slightly before element comes onto screen
          toggleActions: "play none none reverse"
        }
      }
    );
  }, []);

  // Antigravity Glassmorphism Hover Animations
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
      className="group relative flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-sm"
    >
      {/* 3:4 Aspect Ratio typically found in bulletins */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-neutral-900 flex items-center justify-center">
        {thumbnailUrl ? (
          <img ref={imageRef} src={thumbnailUrl} alt={title} className="w-full h-full object-cover origin-center" />
        ) : (
          <FileText className="w-16 h-16 text-neutral-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      
      <div className="p-5 flex flex-col gap-1 z-10 bg-neutral-950/50">
        <h3 className="font-medium text-lg text-white group-hover:text-indigo-400 transition-colors drop-shadow-md">{title}</h3>
        <p className="text-sm text-neutral-400">{date}</p>
      </div>

      <a 
        href={fileUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="absolute top-4 right-4 bg-black/40 hover:bg-indigo-600 backdrop-blur-md p-2.5 rounded-full border border-white/20 transition-all duration-300 z-20 hover:scale-110 active:scale-95 shadow-lg"
      >
        <Download className="w-4 h-4 text-white" />
      </a>
    </div>
  );
}
