import { getConvexClient } from '@/lib/convex'
import { ChatRequestBody, SSE_DATA_PREFIX, SSE_LINE_DELIMITER, StreamMessage, StreamMessageType } from '@/lib/types'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'


export const runtime = "edge";

function sendSSEMessage(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  data: StreamMessage
) {
  const encoder = new TextEncoder();
  return writer.write(
    encoder.encode(
      `${SSE_DATA_PREFIX}${JSON.stringify(data)}${SSE_LINE_DELIMITER}`
    )
  );
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { messages, newMessage, chatId } =
      (await req.json()) as ChatRequestBody
    const convex = getConvexClient()

    // return await startStream(messages, newMessage, chatId, convex)

    // TransformStream을 생성하고, highWaterMark를 1024로 설정합니다.
    const stream = new TransformStream({}, { highWaterMark: 1024 })

    // 스트림의 writable 부분에서 writer를 가져옵니다.
    const writer = stream.writable.getWriter()

    const response = new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream', // 이벤트 스트림의 콘텐츠 타입 설정
        // "Cache-Control": "no-cache", // 캐시를 사용하지 않도록 설정 (주석 처리됨)
        Connection: 'keep-alive', // 연결을 유지하도록 설정
        'X-Accel-Buffering': 'no', // Nginx의 버퍼링을 비활성화
      },
    })

    ;(async () => {
      try {
        // 여기에 스트림 처리 로직 추가

        const sendSSEMessage(writer, {type: StreamMessageType.Connected})
      } catch (error) {
        console.error('Error in stream:', error)
        // await sendSSEMessage(writer, {
        //   type: StreamMessageType.Error,
        //   error: error instanceof Error ? error.message : 'Unknown error',
        // })
      } finally {
        try {
          await writer.close()
        } catch (closeError) {
          console.error('Error closing writer:', closeError)
        }
      }
    })()

    return response
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' } as const,
      { status: 500 }
    )
  }
}
