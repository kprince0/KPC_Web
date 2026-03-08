'use client';

import { useState, useRef, useEffect } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import gsap from 'gsap';
import { Play, X } from 'lucide-react';

interface SermonPlayerProps {
  youtubeId: string;
  thumbnailUrl: string;
  title: string;
}

export default function SermonPlayer({ youtubeId, thumbnailUrl, title }: SermonPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  // Parse Youtube Video End
  const onEnd: YouTubeProps['onEnd'] = (event) => {
    closePlayer();
  };

  const openPlayer = () => {
    setIsPlaying(true);
  };

  const closePlayer = () => {
    if (!modalRef.current) return setIsPlaying(false);
    
    // Antigravity Modal Close Animation
    gsap.to(modalRef.current, {
      opacity: 0,
      scale: 0.95,
      y: 20,
      duration: 0.4,
      ease: 'power3.in',
      onComplete: () => setIsPlaying(false)
    });
  };

  useEffect(() => {
    if (isPlaying && modalRef.current) {
      // Antigravity Modal Open Animation
      gsap.fromTo(modalRef.current, 
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );
    }
  }, [isPlaying]);

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      rel: 0,
      modestbranding: 1
    },
  };

  return (
    <div ref={containerRef} className="relative group w-full aspect-video rounded-2xl overflow-hidden cursor-pointer" onClick={!isPlaying ? openPlayer : undefined}>
      {/* Thumbnail View */}
      <img 
        src={thumbnailUrl} 
        alt={title} 
        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 transform transition-transform duration-500 group-hover:scale-110 shadow-lg">
          <Play className="w-8 h-8 text-white ml-1" />
        </div>
      </div>

      {/* Inline Modal Video View */}
      {isPlaying && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
             onClick={(e) => {
               if (e.target === e.currentTarget) closePlayer();
             }}>
          <div ref={modalRef} className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl shadow-2xl overflow-hidden border border-white/10 flex flex-col items-center justify-center">
            
            <button 
              onClick={closePlayer} 
              className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            <div ref={videoRef} className="w-full h-full">
              <YouTube 
                videoId={youtubeId} 
                opts={opts} 
                onEnd={onEnd} 
                className="w-full h-full absolute top-0 left-0" 
                iframeClassName="w-full h-full"
              />
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
