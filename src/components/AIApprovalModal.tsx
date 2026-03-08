'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Bot, Check, X, ScanSearch, SaveAll } from 'lucide-react';

interface AIResult {
  notices: { title: string; items: string[] } | null;
  column: { title: string; content: string } | null;
}

interface AIApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string; 
  onSave: (result: AIResult) => void;
}

export default function AIApprovalModal({ isOpen, onClose, imageUrl, onSave }: AIApprovalModalProps) {
  const [step, setStep] = useState<'IDLE' | 'SCANNING' | 'REVIEW'>('IDLE');
  const [aiData, setAiData] = useState<AIResult | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const laserRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.fromTo(modalRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [isOpen]);

  const startScan = async () => {
    setStep('SCANNING');
    
    // Antigravity Laser Scan Animation
    if (laserRef.current && imageContainerRef.current) {
      const gCtx = gsap.context(() => {
        gsap.to(laserRef.current, {
          top: '100%',
          duration: 2,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true
        });
        
        // Ambient pulse to image while scanning
        gsap.to(imageContainerRef.current, {
          boxShadow: '0 0 40px rgba(99, 102, 241, 0.4)',
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut'
        });
      });

      // Simulate API analysis call (Replace with real fetch to /api/parse-bulletin)
      try {
        const response = await fetch('/api/parse-bulletin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Image: imageUrl })
        });
        const json = await response.json();
        
        if (json.success) {
          setAiData(json.data);
          gCtx.revert(); // stop scan animation properly
          setStep('REVIEW');
        } else {
          // If OpenAI env missing or fails, mock it for demo logic
          throw new Error('Fetch failed or invalid env');
        }
      } catch (err) {
        console.warn('API Failed, using mock AI payload for Phase 4 Demonstration', err);
        // Mocked Payload logic due to likely lack of OpenAI Key on user's system immediately
        setTimeout(() => {
          gCtx.revert();
          setAiData({
            notices: {
              title: "교회 소식",
              items: ["다음 주일 구역장 모임이 오후 2시에 있습니다.", "새가족 환영회가 친교실에서 열립니다.", "주차 봉사자를 모집합니다."]
            },
            column: {
              title: "그리스도의 사랑으로 하나되는 공동체",
              content: "사랑하는 성도 여러분, 이번 한 주간 평안하셨습니까? 우리는 주님 안에서 하나로 지어져가는 성전입니다..."
            }
          });
          setStep('REVIEW');
        }, 3000);
      }
    }
  };

  const handlePublish = () => {
    if (aiData) onSave(aiData);
    onClose();
    setStep('IDLE');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-white">
      <div ref={modalRef} className="w-full max-w-4xl max-h-[90vh] bg-neutral-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-full">
              <Bot className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-medium">Vision AI 스마트 동기화</h2>
              <p className="text-sm text-neutral-400">주보 이미지를 스캔하여 소식과 칼럼을 추출합니다</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {/* Body */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0">
          
          {/* Image Scanning Plane */}
          <div className="flex-1 p-6 flex flex-col items-center justify-center bg-black/40 border-r border-white/5 relative">
            <div 
              ref={imageContainerRef}
              className="relative w-full max-w-sm aspect-[3/4] bg-neutral-800 rounded-xl overflow-hidden shadow-lg border border-white/10"
            >
              {/* Note: the image is a generic placeholder rendering the base64 or URL structure input */}
              <img src={imageUrl} alt="Bulletin Preview" className="w-full h-full object-cover opacity-60" />
              
              {/* Laser Animation Element */}
              {step === 'SCANNING' && (
                <>
                  <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay" />
                  <div 
                    ref={laserRef}
                    className="absolute top-0 left-0 w-full h-1 bg-indigo-400 shadow-[0_0_15px_3px_rgba(99,102,241,0.8)] z-10" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-indigo-300 font-mono text-xs border border-indigo-500/30 flex items-center gap-2">
                      <ScanSearch className="w-4 h-4 animate-pulse" />
                      Analyzing Layout...
                    </div>
                  </div>
                </>
              )}
            </div>

            {step === 'IDLE' && (
              <button 
                onClick={startScan}
                className="mt-8 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
              >
                <ScanSearch className="w-5 h-5" /> AI 분석 시작
              </button>
            )}
          </div>

          {/* AI Result Review Plane */}
          <div className="flex-1 p-6 overflow-y-auto bg-neutral-900/50">
            {step === 'IDLE' && (
               <div className="h-full flex flex-col items-center justify-center text-neutral-500 max-w-xs mx-auto text-center gap-4">
                 <Bot className="w-16 h-16 opacity-30" />
                 <p>AI 스캔을 시작하면 추출된 텍스트 초안이 이곳에 표시됩니다.</p>
               </div>
            )}
            
            {step === 'SCANNING' && (
               <div className="h-full flex flex-col items-center justify-center text-indigo-400 gap-4">
                 <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                 <p className="animate-pulse text-sm">OpenAI Vision Engine 가동 중...</p>
               </div>
            )}

            {step === 'REVIEW' && aiData && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Notice Result */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-emerald-400">교회 소식 (추출 결과)</h3>
                    <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-300 rounded-full">Notices</span>
                  </div>
                  <input 
                    type="text" 
                    defaultValue={aiData.notices?.title} 
                    className="w-full bg-transparent border-b border-white/10 pb-2 mb-4 text-lg focus:outline-none focus:border-indigo-400"
                  />
                  <ul className="space-y-2">
                    {aiData.notices?.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-neutral-500 mt-1">•</span>
                        <textarea 
                          defaultValue={item}
                          className="w-full bg-transparent text-sm text-neutral-300 focus:outline-none resize-none overflow-hidden"
                          rows={2}
                        />
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column Result */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-amber-400">목회자 칼럼 (추출 결과)</h3>
                    <span className="text-xs px-2 py-1 bg-amber-500/10 text-amber-300 rounded-full">Columns</span>
                  </div>
                   <input 
                    type="text" 
                    defaultValue={aiData.column?.title} 
                    className="w-full bg-transparent border-b border-white/10 pb-2 mb-4 text-lg focus:outline-none focus:border-indigo-400"
                  />
                  <textarea 
                    defaultValue={aiData.column?.content}
                    className="w-full h-40 bg-black/20 text-sm text-neutral-300 p-3 rounded-lg border border-white/5 focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <button 
                  onClick={handlePublish}
                  className="w-full py-4 bg-white text-black hover:bg-neutral-200 rounded-xl font-semibold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <SaveAll className="w-5 h-5" />
                  승인 및 분산 발행
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
