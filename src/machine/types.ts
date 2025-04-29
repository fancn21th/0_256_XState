export type CoreMessage = {
  role: 'system' | 'user' | 'tool'
  content: string
}

export type Message = CoreMessage & {
  id: string
}
