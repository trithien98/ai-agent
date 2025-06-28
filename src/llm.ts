import type { AIMessage, Tool, FunctionCall } from '../types'
import { createModel } from './ai'
import { executeFunctionCall } from './toolRunner'

export const runLLM = async ({
  messages,
  tools,
}: {
  messages: AIMessage[]
  tools: Tool[]
}) => {
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
      } else if (msg.role === 'function') {
        // Handle function response messages
        return {
          role: 'function' as const,
          parts: msg.parts,
        }
      }
      // Skip unsupported message types (tool, etc.)
      return null
    })
    .filter((msg) => msg !== null)

  // Get the last user message
  const lastMessage = history[history.length - 1]
  const chatHistory = history.slice(0, -1)

  // Ensure last message is a user message with text
  if (!lastMessage || lastMessage.role !== 'user') {
    throw new Error('Last message must be a user message with text')
  }

  // Create model with tools - AUTO mode with parallel=false
  const model = createModel(tools.length > 0 ? tools : undefined)
  const chat = model.startChat({ history: chatHistory as any })

  try {
    const result = await chat.sendMessage(lastMessage.parts[0].text)
    const response = result.response

    // Check if the model wants to call a function
    const functionCalls = response.functionCalls()

    if (functionCalls && functionCalls.length > 0) {
      // Handle function calls (process them sequentially to ensure parallel=false)

      for (const functionCall of functionCalls) {
        try {
          const result = await executeFunctionCall(
            functionCall as FunctionCall,
            lastMessage.parts[0].text
          )

          // Send function result back using the chat session
          const functionResponse = [
            {
              functionResponse: {
                name: functionCall.name,
                response: result,
              },
            },
          ]

          const followUpResult = await chat.sendMessage(functionResponse)
          return followUpResult.response.text()
        } catch (error) {
          console.error(
            `Function execution failed for ${functionCall.name}:`,
            error
          )

          const errorResponse = [
            {
              functionResponse: {
                name: functionCall.name,
                response: {
                  error: 'Function execution failed',
                  details: error,
                },
              },
            },
          ]

          const followUpResult = await chat.sendMessage(errorResponse)
          return followUpResult.response.text()
        }
      }
    }

    // No function calls, return the text response
    return response.text()
  } catch (error) {
    console.error('LLM execution error:', error)
    throw error
  }
}
