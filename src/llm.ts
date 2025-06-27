import type { AIMessage } from '../types'
import { model } from './ai'

export const runLLM = async ({ messages }: { messages: AIMessage[] }) => {
  // Convert messages to Gemini format and filter out unsupported types
  const history = messages
    .map((msg) => {
      if (msg.role === 'user') {
        // Handle both OpenAI format (content) and Gemini format (parts)
        const text = 'content' in msg ? msg.content : msg.parts[0].text
        return { role: 'user' as const, parts: [{ text }] }
      } else if (msg.role === 'assistant' || msg.role === 'model') {
        // Handle both OpenAI format (content) and Gemini format (parts)
        const text = 'content' in msg ? msg.content : msg.parts[0].text
        return { role: 'model' as const, parts: [{ text }] }
      }
      // Skip unsupported message types (tool, function, etc.)
      return null
    })
    .filter(
      (msg): msg is { role: 'user' | 'model'; parts: [{ text: string }] } =>
        msg !== null
    )

  // Get the last user message
  const lastMessage = history[history.length - 1]
  const chatHistory = history.slice(0, -1)

  // Ensure last message is a user message with text
  if (!lastMessage || lastMessage.role !== 'user') {
    throw new Error('Last message must be a user message with text')
  }

  const chat = model.startChat({ history: chatHistory })
  const result = await chat.sendMessage(lastMessage.parts[0].text)

  return result.response.text()
}
