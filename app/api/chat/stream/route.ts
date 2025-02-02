import { api } from '@/convex/_generated/api'
import { getConvexClient } from '@/lib/convex'
import { submitQuestion } from '@/lib/langgraph'
import {
  ChatRequestBody,
  SSE_DATA_PREFIX,
  SSE_LINE_DELIMITER,
  StreamMessage,
  StreamMessageType,
} from '@/lib/types'
import { auth } from '@clerk/nextjs/server'
import { AIMessage, HumanMessage, ToolMessage } from '@langchain/core/messages'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

function sendSSEMessage(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  data: StreamMessage
) {
  const encoder = new TextEncoder()
  return writer.write(
    encoder.encode(
      `${SSE_DATA_PREFIX}${JSON.stringify(data)}${SSE_LINE_DELIMITER}`
    )
  )
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
        // 이벤트 스트림을 사용하여 클라이언트에게 메시지를 보냅니다.
        await sendSSEMessage(writer, { type: StreamMessageType.Connected })

        // convex에 유저 메시지 전송
        await convex.mutation(api.messages.send, {
          chatId,
          content: newMessage,
        })

        // 메시지를 랭체인 포맷으로 변환
        const langChainMessages = [
          ...messages.map((msg) =>
            msg.role === 'user'
              ? new HumanMessage(msg.content)
              : new AIMessage(msg.content)
          ),
          new HumanMessage(newMessage),
        ]

        try {
          /// 이벤트 스트림 제작
          const eventStream = await submitQuestion(langChainMessages, chatId)

          // Process the events
          for await (const event of eventStream) {
            if (event.event === 'on_chat_model_stream') {
              // 새로운 채팅 메시지를 생성
              const token = event.data.chunk
              if (token) {
                // Access the text property from the AIMessageChunk
                const text = token.content.at(0)?.['text']
                if (text) {
                  await sendSSEMessage(writer, {
                    type: StreamMessageType.Token,
                    token: text,
                  })
                }
              }
            } else if (event.event === 'on_tool_start') {
              // 툴 스타트
              await sendSSEMessage(writer, {
                type: StreamMessageType.ToolStart,
                tool: event.name || 'unknown',
                input: event.data.input,
              })
            } else if (event.event === 'on_tool_end') {
              const toolMessage = new ToolMessage(event.data.output)

              await sendSSEMessage(writer, {
                type: StreamMessageType.ToolEnd,
                tool: toolMessage.lc_kwargs.name || 'unknown',
                output: event.data.output,
              })
            }
          }

          // Send completion message without storing the response
          await sendSSEMessage(writer, { type: StreamMessageType.Done })
        } catch (streamError) {
          console.error('Error in event stream:', streamError)
          await sendSSEMessage(writer, {
            type: StreamMessageType.Error,
            error:
              streamError instanceof Error
                ? streamError.message
                : 'Stream processing failed',
          })
        }
      } catch (error) {
        console.error('Error in stream:', error)
        await sendSSEMessage(writer, {
          type: StreamMessageType.Error,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
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
