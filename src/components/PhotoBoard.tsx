'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface Photo {
  id: string;
  url: string; // The webContentLink or API Route Proxy URL
  alt: string;
}

export default function PhotoBoard({ photos }: { photos: Photo[] }) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Lightbox GSAP Animations
  useEffect(() => {
    if (selectedIdx !== null && lightboxRef.current) {
      gsap.fromTo(lightboxRef.current,
        { opacity: 0, backdropFilter: 'blur(0px)' },
        { opacity: 1, backdropFilter: 'blur(16px)', duration: 0.4, ease: 'power2.out' }
      );
      if (imageRef.current) {
        gsap.fromTo(imageRef.current,
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.5)', delay: 0.1 }
        );
      }
    }
  }, [selectedIdx]);

  const closeLightbox = () => {
    if (!lightboxRef.current) return;
    gsap.to(lightboxRef.current, {
      opacity: 0,
      backdropFilter: 'blur(0px)',
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => setSelectedIdx(null)
    });
    if (imageRef.current) {
      gsap.to(imageRef.current, { scale: 0.95, opacity: 0, duration: 0.2 });
    }
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIdx === null) return;
    setSelectedIdx((selectedIdx + 1) % photos.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIdx === null) return;
    setSelectedIdx((selectedIdx - 1 + photos.length) % photos.length);
  };

  // Entry GSAP ScrollTrigger could be added for the Masonry Grid items as well
  return (
    <>
      {/* CSS-based Masonry Layout */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4 p-4">
        {photos.map((photo, i) => (
          <div 
            key={photo.id}
            className="group relative rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.3)] break-inside-avoid"
            onClick={() => setSelectedIdx(i)}
          >
            {/* Using standard img or next/image if allowed domains configured */}
            <img 
              src={photo.url} 
              alt={photo.alt} 
              className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            {/* Antigravity Glassmorphism Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <span className="text-white text-sm font-medium tracking-wide translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                자세히 보기
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* GSAP Lightbox Overlay */}
      {selectedIdx !== null && (
        <div 
          ref={lightboxRef}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80"
          onClick={closeLightbox}
        >
          <button 
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors z-[110]"
            onClick={closeLightbox}
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div className="relative w-full max-w-6xl h-full max-h-[85vh] flex items-center justify-center p-4">
            
            {/* Left Nav */}
            <button 
              className="absolute left-6 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all z-[110] hover:scale-110 active:scale-95 text-white"
              onClick={prevPhoto}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            {/* Core Image */}
            <img 
              ref={imageRef}
              src={photos[selectedIdx].url} 
              alt={photos[selectedIdx].alt}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Right Nav */}
            <button 
              className="absolute right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all z-[110] hover:scale-110 active:scale-95 text-white"
              onClick={nextPhoto}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
            
          </div>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm">
            {selectedIdx + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
}
