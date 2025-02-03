import {
  SSE_DONE_MESSAGE,
  StreamMessageType,
  SSE_DATA_PREFIX,
  StreamMessage,
} from './types'

/**
 * 서버-전송 이벤트(SSE) 스트림을 위한 파서를 생성합니다.
 * SSE는 서버에서 클라이언트로 실시간 업데이트를 허용합니다.
 */
export const createSSEParser = () => {
  let buffer = '' // 버퍼를 초기화합니다.

  const parse = (chunk: string): StreamMessage[] => {
    // 버퍼와 새로운 청크를 결합하고 줄 단위로 나눕니다.
    const lines = (buffer + chunk).split('\n')
    // 마지막에 불완전할 수 있는 줄을 저장합니다.
    buffer = lines.pop() || ''

    return lines
      .map((line) => {
        const trimmed = line.trim() // 줄의 앞뒤 공백을 제거합니다.
        if (!trimmed || !trimmed.startsWith(SSE_DATA_PREFIX)) return null // 줄이 비어있거나 SSE 데이터 프리픽스로 시작하지 않으면 null을 반환합니다.

        const data = trimmed.substring(SSE_DATA_PREFIX.length) // SSE 데이터 프리픽스를 제거한 데이터를 가져옵니다.
        if (data === SSE_DONE_MESSAGE) return { type: StreamMessageType.Done } // 데이터가 완료 메시지와 일치하면 Done 타입 메시지를 반환합니다.

        try {
          const parsed = JSON.parse(data) as StreamMessage // 데이터를 JSON으로 파싱합니다.
          return Object.values(StreamMessageType).includes(parsed.type)
            ? parsed // 파싱된 데이터의 타입이 유효하면 반환합니다.
            : null // 유효하지 않으면 null을 반환합니다.
        } catch {
          return {
            type: StreamMessageType.Error, // 파싱에 실패하면 오류 메시지를 반환합니다.
            error: 'Failed to parse SSE message',
          }
        }
      })
      .filter((msg): msg is StreamMessage => msg !== null) // null이 아닌 메시지만 필터링합니다.
  }

  return { parse } // 파서 함수를 반환합니다.
}
