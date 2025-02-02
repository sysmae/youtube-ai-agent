import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50/50 flex items-center justify-center">
      {/* 배경 패턴 */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:6rem_4rem]" />

      <section className="w-full px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8 flex flex-col items-center space-y-10 text-center">
        {/* 히어로 콘텐츠 */}
        <header className="space-y-6">
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            AI 에이전트 어시스턴트
          </h1>
          <p className="max-w-[600px] text-lg text-gray-600 md:text-xl/relaxed xl:text-2xl/relaxed">
            대화를 넘어 실제로 일을 처리할 수 있는 새로운 AI 채팅 동반자를
            만나보세요!
            <br />
            <span className="text-gray-400 text-sm">
              IBM의 WxTools 및 여러분이 좋아하는 LLM으로 구동됩니다.
            </span>
          </p>
        </header>

        {/* CTA 버튼 
          로그인 된 상태에서는 시작하기 버튼을 보여주고,
        */}
        <SignedIn>
          <Link href="/dashboard">
            <button className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white bg-gradient-to-r from-gray-900 to-gray-800 rounded-full hover:from-gray-800 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              시작하기
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-900/20 to-gray-800/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </Link>
        </SignedIn>

        {/* 로그인 되지 않은 상태에서는 가입하기 버튼을 보여줍니다. */}

        <SignedOut>
          <SignInButton
            mode="modal"
            fallbackRedirectUrl={'/dashboard'}
            forceRedirectUrl={'/dashboard'}
          >
            <button className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white bg-gradient-to-r from-gray-900 to-gray-800 rounded-full hover:from-gray-800 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              가입하기
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-900/20 to-gray-800/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </SignInButton>
        </SignedOut>

        {/* 기능 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 pt-8 max-w-3xl mx-auto">
          {[
            { title: '빠름', description: '실시간 스트리밍 응답' },
            {
              title: '현대적',
              description: 'Next.js 15, Tailwind CSS, Convex, Clerk',
            },
            {
              title: '스마트',
              description: '여러분이 좋아하는 LLM으로 구동됩니다',
            },
          ].map(({ title, description }) => (
            <div key={title} className="text-center">
              <div className="text-2xl font-semibold text-gray-900">
                {title}
              </div>
              <div className="text-sm text-gray-600 mt-1">{description}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
