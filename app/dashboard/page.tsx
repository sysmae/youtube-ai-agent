import { BotIcon } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="relative max-w-2xl w-full">
        {/* 장식 요소 */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-gray-100 to-gray-50/50 rounded-3xl"></div>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#f5f5f5_1px,transparent_1px),linear-gradient(to_bottom,#f5f5f5_1px,transparent_1px)] bg-[size:4rem_4rem] rounded-3xl"></div>

        <div className="relative space-y-6 p-8 text-center">
          <div className="bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-gray-200/50 rounded-2xl p-6 space-y-4">
            <div className="bg-gradient-to-b from-gray-50 to-white rounded-xl p-4 inline-flex">
              <BotIcon className="w-12 h-12 text-gray-600" />
            </div>
            <h2 className="text-2xl font-semibold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
              AI 에이전트 채팅에 오신 것을 환영합니다
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              새로운 대화를 시작하거나 사이드바에서 기존 채팅을 선택하세요. AI
              어시스턴트가 모든 작업을 도와드릴 준비가 되어 있습니다.
            </p>
            <div className="pt-2 flex justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                실시간 응답
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                스마트 어시스턴스
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                강력한 도구
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
