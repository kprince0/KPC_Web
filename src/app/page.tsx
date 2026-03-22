'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { ChevronDown, CalendarDays, UserPlus } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import YouTubeBackground from '@/components/YouTubeBackground';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  
  const [cardsData, setCardsData] = useState({
    vision_title: "우리의 비전",
    vision_desc: "하나님의 나라를 확장하며 세상을 변화시키는 제자들의 공동체",
    values_title: "핵심 가치",
    values_desc: "예배 중심, 제자 훈련, 지역 사회 섬김, 다음 세대 양육",
    members_title: "함께하는 분들",
    members_desc: "김강일 담임목사와 모든 성도님들이 함께 세워나가는 교회"
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Fetch card content from database if available
    const fetchConfig = async () => {
      const { data } = await supabase.from('site_config').select('content').eq('id', 'about_page').single();
      if (data?.content) {
        setCardsData(prev => ({ ...prev, ...data.content }));
      }
    };
    fetchConfig();

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

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0, 0);

    // Initialize GSAP Animations
    const ctx = gsap.context(() => {
      
      // Hero Elements Fade-in
      gsap.fromTo('.hero-text', 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.5, stagger: 0.2, ease: 'power3.out', delay: 0.5 }
      );

      gsap.fromTo('.hero-arrow',
        { y: -10, opacity: 0 },
        { y: 10, opacity: 1, duration: 1.5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2 }
      );

      // Scroll Animation for Cards
      if (cardsRef.current) {
        gsap.fromTo('.value-card',
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Scroll Animation for Map Section
      if (mapRef.current) {
        gsap.fromTo(mapRef.current,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: mapRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

    }, containerRef);

    return () => {
      lenis.destroy();
      ctx.revert();
    };
  }, [supabase]);

  const scrollToCards = () => {
    if (cardsRef.current) {
      window.scrollTo({ top: cardsRef.current.offsetTop - 100, behavior: 'smooth' });
    }
  };

  return (
    <main ref={containerRef} className="relative bg-neutral-950 text-white overflow-hidden min-h-screen">
      
      {/* 1. Cinematic Hero Section */}
      <section ref={heroRef} className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        
        {/* Background Video (Cinematic Worship/Church Loop) */}
        <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
          <YouTubeBackground 
            videoId="bjgPX38Kivw" 
            startSeconds={3668} 
            endSeconds={3678} 
          />
          {/* Dark Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-neutral-950 backdrop-blur-[2px]"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center text-center mt-20">
          
          <h1 className="hero-text text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-tight drop-shadow-2xl">
             빛과 사랑을 전하는<br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 drop-shadow-[0_0_30px_rgba(99,102,241,0.5)]">
               공동체
             </span>
          </h1>
          
          <p className="hero-text text-lg md:text-xl text-neutral-300 mb-16 max-w-2xl font-medium drop-shadow-md">
            예수 그리스도의 은혜와 진리가 머무는 곳, 잭슨빌 한인 장로교회에 오신 것을 환영합니다.
          </p>
          

        </div>

        {/* Scroll Indicator */}
        <button 
          onClick={scrollToCards}
          className="hero-arrow absolute bottom-12 z-20 p-4 text-white/50 hover:text-white transition-colors"
        >
          <span className="sr-only">아래로 스크롤</span>
          <ChevronDown className="w-8 h-8 md:w-12 md:h-12" />
        </button>

      </section>

      {/* 2. Core Values Section */}
      <section ref={cardsRef} className="relative z-10 w-full max-w-7xl mx-auto px-6 py-32 flex flex-col items-center">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-bold tracking-[0.3em] uppercase text-indigo-400 mb-4 drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]">Core Values</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white">우리가 걸어가는 길</h2>
        </div>

        {/* Value Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {[
            { title: cardsData.vision_title, desc: cardsData.vision_desc, icon: '🌟' },
            { title: cardsData.values_title, desc: cardsData.values_desc, icon: '📖' },
            { title: cardsData.members_title, desc: cardsData.members_desc, icon: '🤝' }
          ].map((item, i) => (
            <div 
              key={i} 
              className="value-card relative group p-10 rounded-[2rem] bg-neutral-900 border border-white/5 backdrop-blur-3xl overflow-hidden transition-all duration-500 hover:-translate-y-3"
            >
              {/* Neon Purple Border Reveal on Hover */}
              <div className="absolute inset-0 rounded-[2rem] border-2 border-transparent group-hover:border-purple-500/50 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-700 pointer-events-none"></div>
              
              {/* Card Content */}
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <span className="text-4xl mb-6 block drop-shadow-lg">{item.icon}</span>
                  <h3 className="text-2xl font-bold text-white mb-4 tracking-tight group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-neutral-400 leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
                {/* Decorative bottom line */}
                <div className="w-12 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mt-8 rounded-full transform origin-left transition-transform duration-500 group-hover:scale-x-150"></div>
              </div>

              {/* Background ambient glow inside card */}
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] group-hover:bg-purple-500/20 transition-colors duration-700"></div>
            </div>
          ))}
        </div>

      </section>

      {/* 3. Location & Google Map Section */}
      <section ref={mapRef} className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 flex flex-col items-center">
        <div className="text-center mb-12">
          <p className="text-sm font-bold tracking-[0.3em] uppercase text-indigo-400 mb-4 drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]">Location</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">오시는 길</h2>
          <p className="text-neutral-300 text-lg md:text-xl font-medium tracking-wide mb-4">
            <span className="text-indigo-400 mr-2">📞</span> 904-355-9793 <br className="md:hidden" />
            <span className="hidden md:inline mx-4 text-white/20">|</span>
            <span className="text-indigo-400 mr-2">✉️</span> kangil.kim@jaxkpc.org
          </p>
          <p className="text-neutral-300 text-lg md:text-xl font-medium tracking-wide">
            856 Margaret St. <br className="md:hidden" />
            <span className="hidden md:inline">, </span>
            Jacksonville, FL 32256
          </p>
        </div>

        <div className="w-full max-w-5xl rounded-[2rem] overflow-hidden border border-white/10 bg-neutral-900 shadow-2xl relative group">
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-indigo-500/50 transition-colors duration-700 pointer-events-none rounded-[2rem] z-10"></div>
          {/* Google Maps Embed */}
          <iframe
            src="https://maps.google.com/maps?q=856%20Margaret%20St,%20Jacksonville,%20FL%2032256&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-[400px] md:h-[500px]"
          ></iframe>
        </div>
      </section>

    </main>
  );
}
