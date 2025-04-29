import { createMachine, assign } from 'xstate'
import type { Message } from './types'

export const chatMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QGMAWBDALgWXWglgHZgB0hA9pgMqboBOmkAxFQCoCCASqwPoDCACXasA2gAYAuolAAHcrHyZ85QtJAAPRAHYATCQCsAFkMA2AMxaAHIbEBOfQEYT+gDQgAnogC0Os7ZJa+mImgSaWlrY6jiYAvjFuaFi4BMQkiZhKhFAkmO4yRFBMAJIAcgAKAKq8guwlAOIAouJSSCByCkoqapoIXg5iYiQOljpiOpG2ZibjwW6eCLaGJCGWY2aOhrbWDrZxCRg4eKhEpOmZ2bn5WSwVAELYRaKSau2KyqqtPTpaSya2YqYxmIglYHHNvCESID1loTHCxA59NM9iB0sljqkzgUSLAwIQIAVsHBYOgYEwICpSEQAG7kADWpwO6JOaQO5xxeIJWSJsBJMAQNPIyCw72azRe8jeXU+iH0SOW02MDjMOgisK04IQ1mW1iiZjMTnGI0sKLRRxZWKyHPxhOJpLATDAdDo5DoJBkABssAAzV0AW1ZSXNmLZ2NxNu5dv5guFnUIYuerVece6iBslgCZnCzkMOj1hg1HkQiLMJARjmG+giAOVJviqKZwcZWHZdDAyDA+GpBRobfQfvJlJIgoZgcOKWbGWxbY7XZ7mD7foFhFpsdFknFSclKZlCFVDgC-2sYn1U0Cmp0fzLSMClgN-yzOlNjYnY9b7c73ayvbA-cdztdd0vUwX06ADM1X0tbIZ0-edF2XVcRRUBMWlkbd3lTPdvhISItFsZwRgsIIs01GwTACPNVmiJF9TiesKAgOA1AgjEwAlDoMN3Pp8KGEYxgmKYZhMTUvBsPRfC0QIATELRgUsfRnyDV8KGoWgGEgdipQ+UAej6Qx9EzLR+kiEwHFMYYRINJYtAsXQ-lsSTLCsMxFPHVi3wKTSdx07wzIzYZRnGcZBP+YSi16REDKRAsdjzYJTHw1zmRDFtsUuTytw46UfIQfotBIeSzEMfViv6Qx+ksETIWhPDLDMn5DHCJKmw8q1wy5KAeT5NjMq0zDTHIyT9XGZUzLzYqqozeKjLwkwEWCfQn3rFiLVDK0YLnb8F1-P0vM4nLFvIoIcyMmx9JI8KdGMa8QisaxbAev5YjooA */
    id: 'chatMachine',
    initial: 'notStarted',
    context: {
      // Define any context variables here
      errorMessage: undefined as string | undefined,
      messages: [] as Message[],
      input: '',
    },
    schemas: {
      // Define any schemas here
      events: {} as
        | { type: 'START_CHAT' }
        | { type: 'INPUT_CHANGE'; value: string }
        | { type: 'SUBMIT' }
        | { type: 'TEXT_PART_RECEIVED'; part: string },
      services: {} as {
        sendMessage: {
          data: void
        }
        receiveStream: {
          data: void
        }
      },
    },
    states: {
      notStarted: {
        on: {
          START_CHAT: 'chatting',
        },
      },
      chatting: {
        states: {
          typing: {
            on: {
              INPUT_CHANGE: {
                actions: 'assignInputToContext',
              },
              SUBMIT: {
                target: 'sendingMessage',
                actions: 'appendUserMessage',
              },
            },
          },
          sendingMessage: {
            invoke: {
              src: 'sendMessage',
              onDone: [
                {
                  target: 'receivingStream',
                },
              ],
              onError: [
                {
                  target: 'typing',
                },
              ],
            },
          },
          receivingStream: {
            invoke: {
              src: 'receiveStream',
              onDone: {
                target: 'typing',
                reenter: true,
              },
              onError: [
                {
                  target: 'typing',
                },
              ],
            },
          },
        },
        initial: 'typing',
      },
    },
  },
  {
    guards: {},
    actions: {
      assignErrorToContext: assign((context, event) => {
        return {
          errorMessage: (event.data as Error).message,
        }
      }),
      assignInputToContext: assign((context, event) => {
        return {
          input: context.event.value,
        }
      }),
      appendUserMessage: assign(({ context }) => {
        return {
          messages: [
            ...context.messages,
            { role: 'user', content: context.input },
          ],
          input: '', // 发送后清空输入
        }
      }),
      appendMessagePart: assign((context, event) => ({
        messages: context.messages.map((m, index, arr) =>
          index === arr.length - 1
            ? { ...m, content: m.content + event.part }
            : m
        ),
      })),
    },
  }
)
