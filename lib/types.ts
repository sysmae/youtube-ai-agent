import { Id } from '@/convex/_generated/dataModel'

// SSE 상수 정의
export const SSE_DATA_PREFIX = 'data: ' as const // SSE 데이터 프리픽스
export const SSE_DONE_MESSAGE = '[DONE]' as const // SSE 완료 메시지
export const SSE_LINE_DELIMITER = '\n\n' as const // SSE 라인 구분자

// 메시지 역할 타입 정의
export type MessageRole = 'user' | 'assistant'

// 메시지 인터페이스 정의
export interface Message {
  role: MessageRole // 메시지의 역할 (사용자 또는 어시스턴트)
  content: string // 메시지 내용
}

// 스트림 메시지 타입 열거형 정의
export enum StreamMessageType {
  Token = 'token', // 토큰 메시지
  Error = 'error', // 오류 메시지
  Connected = 'connected', // 연결됨 메시지
  Done = 'done', // 완료 메시지
  ToolStart = 'tool_start', // 도구 시작 메시지
  ToolEnd = 'tool_end', // 도구 종료 메시지
}

// 기본 스트림 메시지 인터페이스 정의
export interface BaseStreamMessage {
  type: StreamMessageType // 스트림 메시지 타입
}

// 토큰 메시지 인터페이스 정의
export interface TokenMessage extends BaseStreamMessage {
  type: StreamMessageType.Token // 토큰 메시지 타입
  token: string // 토큰 값
}

// 오류 메시지 인터페이스 정의
export interface ErrorMessage extends BaseStreamMessage {
  type: StreamMessageType.Error // 오류 메시지 타입
  error: string // 오류 내용
}

// 연결됨 메시지 인터페이스 정의
export interface ConnectedMessage extends BaseStreamMessage {
  type: StreamMessageType.Connected // 연결됨 메시지 타입
}

// 완료 메시지 인터페이스 정의
export interface DoneMessage extends BaseStreamMessage {
  type: StreamMessageType.Done // 완료 메시지 타입
}

// 도구 시작 메시지 인터페이스 정의
export interface ToolStartMessage extends BaseStreamMessage {
  type: StreamMessageType.ToolStart // 도구 시작 메시지 타입
  tool: string // 도구 이름
  input: unknown // 도구 입력 값
}

// 도구 종료 메시지 인터페이스 정의
export interface ToolEndMessage extends BaseStreamMessage {
  type: StreamMessageType.ToolEnd // 도구 종료 메시지 타입
  tool: string // 도구 이름
  output: unknown // 도구 출력 값
}

// 스트림 메시지 타입 정의
export type StreamMessage =
  | TokenMessage // 토큰 메시지
  | ErrorMessage // 오류 메시지
  | ConnectedMessage // 연결됨 메시지
  | DoneMessage // 완료 메시지
  | ToolStartMessage // 도구 시작 메시지
  | ToolEndMessage // 도구 종료 메시지

// 채팅 요청 본문 인터페이스 정의
export interface ChatRequestBody {
  messages: Message[] // 메시지 배열
  newMessage: string // 새로운 메시지 내용
  chatId: Id<'chats'> // 채팅 ID
}
