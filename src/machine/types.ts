export type CoreMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type Message = CoreMessage & {
  id: string
}
