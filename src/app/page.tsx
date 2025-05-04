'use client'

import { chatMachine } from '@/machine/chatMachine'
import { useMachine } from '@xstate/react'

export default function Home() {
  const [state, send] = useMachine(chatMachine)

  return (
    <>
      <pre className="fixed top-0 right-0 bg-white border text-black">
        {JSON.stringify(state, null, 2)}
      </pre>

      <div className="flex flex-col items-center justify-center h-screen">
        {state.matches('notStarted') && <h1>欢迎来到聊天机器人</h1>}
        {state.matches('chatting') && (
          <div>
            <ul>
              {state.context.messages.map((message, index) => (
                <li key={index} className="flex flex-col">
                  <div className="text-blue-500">{message.role}</div>
                  <div>{message.content}</div>
                </li>
              ))}
            </ul>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send({ type: 'SUBMIT' })
              }}
              className="flex flex-col gap-4"
            >
              <input
                type="text"
                className="border"
                value={state.context.input}
                onChange={(e) => {
                  send({ type: 'INPUT_CHANGE', value: e.target.value })
                }}
              />
            </form>
          </div>
        )}
      </div>
    </>
  )
}
