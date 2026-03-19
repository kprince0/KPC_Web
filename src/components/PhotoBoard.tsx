'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { X, ChevronLeft, ChevronRight, PenSquare } from 'lucide-react';
import Link from 'next/link';
import DeleteButton from './DeleteButton';

interface Photo {
  id: string;
  url: string;
  alt: string;
  description?: string;
  postId?: string; // DB 레코드 삭제를 위해 필요
}

export default function PhotoBoard({ photos, isAdmin = false }: { photos: Photo[], isAdmin?: boolean }) {
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

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4 p-4">
        {photos.map((photo, i) => (
          <div 
            key={photo.id}
            className="group relative rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.3)] break-inside-avoid shadow-lg"
          >
            <img 
              src={photo.url} 
              alt={photo.alt} 
              className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              onClick={() => setSelectedIdx(i)}
            />
            
            {/* Admin Action: Edit & Delete */}
            {isAdmin && photo.postId && (
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center gap-2">
                <Link 
                  href={`/photos/edit/${photo.postId}`}
                  className="p-2 bg-indigo-500/80 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-lg flex items-center justify-center"
                  title="사진/설명 수정"
                  onClick={(e) => e.stopPropagation()}
                >
                  <PenSquare className="w-4 h-4" />
                </Link>
                <div onClick={(e) => e.stopPropagation()}>
                  <DeleteButton 
                    postId={photo.postId} 
                    tableName="photo_posts" 
                    redirectPath="/photos" 
                  />
                </div>
              </div>
            )}

            {/* Title Overlay */}
            <div 
              className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"
              onClick={() => setSelectedIdx(i)}
            >
              <p className="text-white text-sm font-semibold truncate">{photo.alt}</p>
              <span className="text-neutral-400 text-[10px] tracking-widest uppercase mt-1 block">Click to Enlarge</span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
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
            <button 
              className="absolute left-6 p-4 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all z-[110] hover:scale-110 active:scale-95 text-white shadow-xl"
              onClick={prevPhoto}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <img 
              ref={imageRef}
              src={photos[selectedIdx].url} 
              alt={photos[selectedIdx].alt}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-white/5"
              onClick={(e) => e.stopPropagation()}
            />

            <button 
              className="absolute right-6 p-4 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all z-[110] hover:scale-110 active:scale-95 text-white shadow-xl"
              onClick={nextPhoto}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 bg-neutral-900/60 border border-white/10 backdrop-blur-md rounded-2xl text-white max-w-lg w-[calc(100%-2rem)] md:w-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded tracking-wider">{selectedIdx + 1} / {photos.length}</span>
              <h4 className="text-lg font-bold truncate">{photos[selectedIdx].alt}</h4>
            </div>
            {photos[selectedIdx].description && (
              <p className="text-sm text-neutral-300 leading-relaxed line-clamp-3 md:line-clamp-none">
                {photos[selectedIdx].description}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

