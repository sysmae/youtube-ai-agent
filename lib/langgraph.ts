import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
  trimMessages,
} from '@langchain/core/messages'
import { ChatAnthropic } from '@langchain/anthropic'
import {
  END,
  MessagesAnnotation,
  START,
  StateGraph,
} from '@langchain/langgraph'
import { MemorySaver } from '@langchain/langgraph'
import { ToolNode } from '@langchain/langgraph/prebuilt'
import wxflows from '@wxflows/sdk/langchain'
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts'
import SYSTEM_MESSAGE from '@/constants/systemMessage'

// 대화 기록을 관리하기 위해 메시지를 자릅니다.
const trimmer = trimMessages({
  maxTokens: 10,
  strategy: 'last',
  tokenCounter: (msgs) => msgs.length,

  includeSystem: true,
  allowPartial: false,
  startOn: 'human',
})

// wxflows에 연결합니다.
const toolClient = new wxflows({
  endpoint: process.env.WXFLOWS_ENDPOINT || '',
  apikey: process.env.WXFLOWS_APIKEY,
})

// 도구를 가져옵니다.
const tools = await toolClient.lcTools
console.log('Available tools:', tools) // 도구를 확인하기 위해 이 줄을 추가합니다.
const toolNode = new ToolNode(tools)

// 더 나은 도구 지침으로 LLM 제공자에 연결합니다.
const initialiseModel = () => {
  const model = new ChatAnthropic({
    modelName: 'claude-3-5-sonnet-20241022',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    temperature: 0.7,
    maxTokens: 4096,
    streaming: true,
    clientOptions: {
      defaultHeaders: {
        'anthropic-beta': 'prompt-caching-2024-07-31',
      },
    },
    callbacks: [
      {
        handleLLMStart: async () => {
          // console.log("🤖 Starting LLM call");
        },
        handleLLMEnd: async (output) => {
          console.log('🤖 End LLM call', output)
          const usage = output.llmOutput?.usage
          if (usage) {
            console.log('📊 Token Usage:', {
              input_tokens: usage.input_tokens,
              output_tokens: usage.output_tokens,
              total_tokens: usage.input_tokens + usage.output_tokens,
              cache_creation_input_tokens:
                usage.cache_creation_input_tokens || 0,
              cache_read_input_tokens: usage.cache_read_input_tokens || 0,
            })
          }
        },
        // handleLLMNewToken: async (token: string) => {
        //   // console.log("🔤 New token:", token);
        // },
      },
    ],
  }).bindTools(tools)

  return model
}

// 계속할지 여부를 결정하는 함수를 정의합니다.
function shouldContinue(state: typeof MessagesAnnotation.State) {
  const messages = state.messages
  const lastMessage = messages[messages.length - 1] as AIMessage

  // LLM이 도구 호출을 하면 "tools" 노드로 라우팅합니다.
  if (lastMessage.tool_calls?.length) {
    return 'tools'
  }

  // 마지막 메시지가 도구 메시지인 경우 에이전트로 다시 라우팅합니다.
  if (lastMessage.content && lastMessage._getType() === 'tool') {
    return 'agent'
  }

  // 그렇지 않으면 중지합니다 (사용자에게 응답).
  return END
}

// 새로운 그래프를 정의합니다.
const createWorkflow = () => {
  const model = initialiseModel()

  return new StateGraph(MessagesAnnotation)
    .addNode('agent', async (state) => {
      // 시스템 메시지 내용을 생성합니다.
      const systemContent = SYSTEM_MESSAGE

      // 시스템 메시지와 메시지 플레이스홀더로 프롬프트 템플릿을 생성합니다.
      const promptTemplate = ChatPromptTemplate.fromMessages([
        new SystemMessage(systemContent, {
          cache_control: { type: 'ephemeral' }, // 캐시 브레이크포인트 설정
        }),
        new MessagesPlaceholder('messages'), //
      ])

      // 대화 기록을 관리하기 위해 메시지를 자릅니다.
      const trimmedMessages = await trimmer.invoke(state.messages)

      // 현재 메시지로 프롬프트를 형식화합니다.
      const prompt = await promptTemplate.invoke({ messages: trimmedMessages })

      // 모델에서 응답을 가져옵니다.
      const response = await model.invoke(prompt)

      return { messages: [response] }
    })
    .addNode('tools', toolNode)
    .addEdge(START, 'agent')
    .addConditionalEdges('agent', shouldContinue)
    .addEdge('tools', 'agent')
}

// 캐싱 헤더를 추가하는 함수를 정의합니다.
function addCachingHeaders(messages: BaseMessage[]): BaseMessage[] {
  // 턴별 대화에 대한 캐싱 헤더 규칙
  // 1. 첫 번째 SYSTEM 메시지를 캐시합니다.
  // 2. 마지막 메시지를 캐시합니다.
  // 3. 두 번째로 마지막 HUMAN 메시지를 캐시합니다.

  if (!messages.length) return messages

  // 원본을 변경하지 않기 위해 메시지의 복사본을 만듭니다.
  const cachedMessages = [...messages]

  // 캐시 제어를 추가하는 도우미 함수
  const addCache = (message: BaseMessage) => {
    message.content = [
      {
        type: 'text',
        text: message.content as string,
        cache_control: { type: 'ephemeral' },
      },
    ]
  }

  // 마지막 메시지를 캐시합니다.
  // console.log("🤑🤑🤑 Caching last message");
  addCache(cachedMessages.at(-1)!)

  // 두 번째로 마지막 인간 메시지를 찾아 캐시합니다.
  let humanCount = 0
  for (let i = cachedMessages.length - 1; i >= 0; i--) {
    if (cachedMessages[i] instanceof HumanMessage) {
      humanCount++
      if (humanCount === 2) {
        // console.log("🤑🤑🤑 Caching second-to-last human message");
        addCache(cachedMessages[i])
        break
      }
    }
  }

  return cachedMessages
}

// 질문을 제출하는 함수를 정의합니다.
export async function submitQuestion(messages: BaseMessage[], chatId: string) {
  // 메시지에 캐싱 헤더를 추가합니다.
  const cachedMessages = addCachingHeaders(messages)
  // console.log("🔒🔒🔒 Messages:", cachedMessages);

  // chatId와 onToken 콜백으로 워크플로를 생성합니다.
  const workflow = createWorkflow()

  // 대화 상태를 저장하기 위해 체크포인트를 생성합니다.
  const checkpointer = new MemorySaver()
  const app = workflow.compile({ checkpointer })

  const stream = await app.streamEvents(
    { messages: cachedMessages },
    {
      version: 'v2',
      configurable: { thread_id: chatId },
      streamMode: 'messages',
      runId: chatId,
    }
  )
  return stream
}
