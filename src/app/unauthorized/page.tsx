import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 selection:bg-red-500/30">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">접근 권한이 없습니다</h1>
          <p className="text-neutral-400 text-sm leading-relaxed">
            이 페이지는 가입이 승인된 성도님, 혹은 관리자만 접근할 수 있습니다.<br/>
            (현재 UI 테스트 모드에서는 DB 연결이 없어 Guest로 인식되어 차단되었습니다.)
          </p>
        </div>

        <div className="pt-8">
          <Link 
            href="/test" 
            className="inline-block w-full py-3 px-4 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition-colors"
          >
            테스트 대시보드로 돌아가기
          </Link>
          <Link 
            href="/" 
            className="inline-block w-full py-3 px-4 mt-3 bg-white/5 text-white font-medium rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
          >
            홈으로 가기
          </Link>
        </div>
      </div>
    </div>
  );
}
