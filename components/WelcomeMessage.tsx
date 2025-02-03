export default function WelcomeMessage() {
  return (
    <div className="flex flex-col items-center justify-center h-full mt-10">
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-inset ring-gray-200 px-6 py-5 max-w-lg w-full">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          AI 에이전트 채팅에 오신 것을 환영합니다! 👋
        </h2>
        <p className="text-gray-600 mb-4 leading-relaxed">
          제가 도와드릴 수 있는 것들:
        </p>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>YouTube 비디오 자막 찾기 및 분석</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>Google Books 검색</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>JSONata를 사용한 데이터 처리</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>모든 고객 및 주문 데이터 검색</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>댓글 API에서 모든 댓글 검색</span>
          </li>
        </ul>
        <p className="text-gray-600 mt-4 leading-relaxed">
          무엇이든 물어보세요! 도와드리겠습니다.
        </p>
      </div>
    </div>
  )
}
