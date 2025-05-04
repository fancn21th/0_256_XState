import { assign, setup, fromCallback } from 'xstate'
import type { Message } from './types'

export const chatMachine = setup({
  types: {
    context: {} as {
      errorMessage?: string
      messages: Message[]
      input: string
    },
    events: {} as
      | { type: 'START_CHAT' }
      | { type: 'INPUT_CHANGE'; value: string }
      | { type: 'SUBMIT' }
      | { type: 'STREAM_DELTA'; delta: string }
      | { type: 'STREAM_DONE' }
      | { type: 'STREAM_ERROR'; error: string }
      | { type: 'RESET_CHAT' },
  },
  actions: {
    inputChange: assign({
      input: ({ event }) => event.value,
    }),
    submit: assign({
      messages: ({ context }) => {
        const newMessage = {
          role: 'user',
          content: context.input,
        }
        return [...context.messages, newMessage]
      },
    }),
    resetInput: assign({
      input: '',
    }),
    startAssistantMessage: assign({
      messages: ({ context }) => [
        ...context.messages,
        { role: 'assistant', content: '' },
      ],
    }),
    appendAssistantDelta: assign({
      messages: ({ context, event }) => {
        const lastIndex = context.messages.length - 1
        const lastMessage = context.messages[lastIndex]
        if (!lastMessage || lastMessage.role !== 'assistant')
          return context.messages
        const updated = {
          ...lastMessage,
          content: lastMessage.content + event.delta,
        }
        return [...context.messages.slice(0, lastIndex), updated]
      },
    }),
    setError: assign({
      errorMessage: ({ event }) => event.error,
    }),
    clearError: assign({
      errorMessage: undefined,
    }),
    resetChat: assign({
      input: '',
      messages: () => [],
      errorMessage: undefined,
    }),
  },
  actors: {
    streamGPT: fromCallback(({ sendBack: send }) => {
      const chunks = [
        '你好',
        '，',
        '我是',
        ' ChatGPT。',
        '你想问我什么？',
        '我会尽力回答你。',
      ]
      let i = 0

      const interval = setInterval(() => {
        if (i < chunks.length) {
          send({ type: 'STREAM_DELTA', delta: chunks[i] })
          i++
        } else {
          clearInterval(interval)
          send({ type: 'STREAM_DONE' })
        }
      }, 400)

      return () => clearInterval(interval) // stop 函数
    }),
  },
}).createMachine({
  id: 'chatMachine',
  initial: 'notStarted',
  context: {
    errorMessage: undefined,
    messages: [],
    input: '',
  },
  states: {
    notStarted: {
      description: '聊天还没有开始，这时候一般是欢迎页面',
      on: {
        START_CHAT: 'chatting',
      },
      after: {
        500: { target: 'chatting' },
      },
    },
    chatting: {
      initial: 'typing',
      description: '聊天中',
      states: {
        typing: {
          description: '用户输入消息',
          on: {
            INPUT_CHANGE: {
              actions: 'inputChange',
            },
            SUBMIT: {
              actions: ['submit', 'resetInput'],
              target: 'startStreaming',
            },
          },
        },
        startStreaming: {
          description: '开始流式传输',
          entry: 'startAssistantMessage',
          invoke: {
            src: 'streamGPT',
          },
          on: {
            STREAM_DELTA: {
              actions: 'appendAssistantDelta',
            },
            STREAM_ERROR: {
              target: 'typing',
              actions: 'setError',
            },
            STREAM_DONE: {
              target: 'typing',
            },
          },
        },
        receiveStreaming: {
          description: '接受 GPT SSE 数据',
          on: {
            STREAM_DELTA: {
              actions: 'appendAssistantDelta',
            },
            STREAM_DONE: {
              target: 'typing',
            },
            STREAM_ERROR: {
              target: 'typing',
              actions: 'setError',
            },
          },
        },
      },
    },
  },
  on: {
    RESET_CHAT: {
      target: '.notStarted',
      actions: 'resetChat',
    },
  },
})
