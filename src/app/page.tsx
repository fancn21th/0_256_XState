'use client'

import { useMachine } from '@xstate/react'
import { chatMachine } from '@/machine/chatMachine'
import { useEffect } from 'react'

export default function Home() {
  const [state, send] = useMachine(chatMachine, {
    services: {
      sendMessage: async () => {
        // 模拟发送成功
      },
      receiveStream: async () => {
        // 这里模拟流式接收，比如等待一段时间后发TEXT_PART_RECEIVED
      },
    },
  })

  useEffect(() => {
    setTimeout(() => {
      send({
        type: 'START_CHAT',
      })
    }, 100)
  }, [])

  return (
    <>
      <div className="">
        {state.matches('notStarted') && <div>Loading Chat...</div>}
        {state.matches('chatting.typing') && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send({
                type: 'SUBMIT',
              })
            }}
          >
            <input
              className="border border-gray-300 rounded px-3 py-2 w-[500px]"
              value={state.context.input}
              onChange={(e) => {
                send({
                  type: 'INPUT_CHANGE',
                  value: e.target.value,
                })
              }}
            ></input>
          </form>
        )}
      </div>
      <div className="fixed right-0 top-0 w-1/3 h-screen bg-gray-100 p-4">
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </div>
    </>
  )
}
