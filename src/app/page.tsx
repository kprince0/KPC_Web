'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import Lenis from 'lenis';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Initialize Lenis for Smooth Antigravity Scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Initialize GSAP Animations
    const ctx = gsap.context(() => {
      // Entrances for text elements
      gsap.from('.hero-element', {
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.2
      });

      // Ambient Floating for Background Shapes
      gsap.to('.floating-shape-1', {
        y: -30,
        x: 20,
        rotation: 15,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
      gsap.to('.floating-shape-2', {
        y: 30,
        x: -20,
        rotation: -15,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1 // offset animation
      });
    }, heroRef);

    return () => {
      lenis.destroy();
      ctx.revert();
    };
  }, []);

  return (
    <main ref={heroRef} className="relative min-h-screen bg-neutral-950 text-white overflow-hidden flex flex-col items-center justify-center">
      
      {/* Dynamic Glassmorphism Background Shapes */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="floating-shape-1 absolute top-1/4 left-[15%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="floating-shape-2 absolute bottom-1/4 right-[15%] w-[35rem] h-[35rem] bg-violet-600/20 rounded-full blur-[140px]" />
      </div>

      {/* Hero Content Section */}
      <div className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center text-center">
        
        <div className="hero-element inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-medium tracking-wide text-neutral-300">
            특별하고 안전한 온라인 성전
          </span>
        </div>
        
        <h1 className="hero-element text-5xl md:text-7xl font-light tracking-tight mb-8 mt-2">
          은혜와 진리가 <br className="hidden md:block" />
          <span className="font-semibold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">함께하는 공간</span>
        </h1>
        
        <p className="hero-element text-lg md:text-xl text-neutral-400 mb-12 max-w-2xl leading-relaxed">
          인가된 성도 및 관리자만 이용할 수 있는 평안한 커뮤니티입니다. 
          안티그래비티 스타일의 차분하고 부드러운 스크롤, 유려한 디자인을 경험해보세요.
        </p>
        
        <div className="hero-element flex flex-col sm:flex-row gap-5 w-full justify-center">
          <Link
            href="/board"
            className="group relative px-8 py-4 bg-white text-black rounded-full font-semibold transition-all hover:scale-105 overflow-hidden text-center"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              게시판 &amp; 채팅방 입장
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <Link
            href="/about"
            className="px-8 py-4 bg-white/5 border border-white/10 text-neutral-200 rounded-full font-medium backdrop-blur-md hover:bg-white/10 hover:text-white transition-colors text-center"
          >
            새가족 안내
          </Link>
        </div>

      </div>
    </main>
  );
}
