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
        
        <h1 className="hero-element text-4xl md:text-6xl font-light tracking-tight mb-8 mt-2">
          사랑과 은혜가 충만한 교회<br className="hidden md:block" />
          <span className="font-semibold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">잭슨빌 한인 장로교회</span>
        </h1>
        
        <div className="hero-element text-base md:text-lg text-neutral-400 mb-12 max-w-4xl leading-loose text-left space-y-6">
          <p className="font-bold text-xl text-neutral-200 border-l-4 border-indigo-500 pl-4 mb-4">
            잭슨빌 한인장로교회는<br />교회 소개
          </p>
          <p>
            잭슨빌 한인 장로교회는 예수 그리스도의 복음 전파와 지역사회 주민과 교인들의 필요를 돕고 세계 평화와 정의를 위해 힘쓰고 있습니다.
          </p>
          <p>
            잭슨빌 한인장로교회는 1978년에 잭슨빌지역에 세워진 최초의 한인교회로써 한인사회의 영적 인도와 지역사회의 중심적 역할을 하고있으며 예수그리스도의 사랑과 복음을 나누고 있습니다. 우리는 성도들을 교회로 인도하고 "신령과 진정"의 예배를 통하여 신앙을 양육하며, 우리 자신의 신앙육성과 예수그리스도의 제자됨을 확인하는 믿음생활하고 있습니다. 또한, 영적 양육과 2세 교육을 강조하는 변혁의 시대에 능동적으로 리드하는 교회입니다. 잭슨빌 한인 장로교회는 다양한 사회 구성원이 서로돕는 공동체를 이루는데 기여하고있습니다.
          </p>
          <p>
            잭슨빌 한인장로교회는 하나님을 찾는 모든 사람들에게 개방되어있으며 한인 이민자들이 새 세상에 적응하는데 절실히 필요한 영적, 사회적 도움을 제공하고 있습니다. 주일에는, 한국어와 영어 별도로, 경배 찬양과 성가대 찬양을 포함하여, 감동적인 예배를 드리며 수요 저녁예배와 토요일 새벽기도회를 통해 하나님께 영광을 돌리고 있습니다. 그 외에도 영어목회, 대학생/청년 사역, 지병으로 영적 도움이 필요하신 사람들에게 사랑의 심방, 그리고 지역사회 선교와 해외선교에 동참하고 있습니다.
          </p>
        </div>
        
        <div className="hero-element flex flex-col sm:flex-row gap-5 w-full justify-center">
          <Link
            href="/sermons"
            className="group relative px-8 py-4 bg-white text-black rounded-full font-semibold transition-all hover:scale-105 overflow-hidden text-center"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              설교 &amp; 채팅방 입장
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
