export type AIMessage =
  | { role: 'model'; parts: [{ text: string }] }
  | { role: 'user'; parts: [{ text: string }] }
  | {
      role: 'function'
      parts: [{ functionResponse: { name: string; response: any } }]
    }
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string }
  | { role: 'tool'; content: string; tool_call_id: string }

export interface ToolFn<A = any, T = any> {
  (input: { userMessage: string; toolArgs: A }): Promise<T>
}
