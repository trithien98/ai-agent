import type { AIMessage, Tool } from '../types'
import { runLLM, runLLMWithFunctionInfo } from './llm'
import { addMessages, getMessages } from './memory'
import { logMessage, showLoader } from './ui'

export const runAgent = async ({
  messages,
  tools = [],
}: {
  messages: AIMessage[]
  tools?: Tool[]
}) => {
  const lastMessage = messages[messages.length - 1]
  let userText: string

  // Handle different message formats
  if ('content' in lastMessage) {
    userText = lastMessage.content
  } else if (
    'parts' in lastMessage &&
    lastMessage.parts[0] &&
    'text' in lastMessage.parts[0]
  ) {
    userText = lastMessage.parts[0].text
  } else {
    throw new Error('Invalid message format - no text content found')
  }

  await addMessages([
    {
      role: 'user',
      parts: [{ text: userText }],
    },
  ])

  const loader = await showLoader('Thinking...')
  const history = await getMessages()
  const response = await runLLM({ messages: history, tools })

  await addMessages([
    {
      role: 'model',
      parts: [{ text: response }],
    },
  ])
  await logMessage({
    role: 'model',
    parts: [{ text: response }],
  })
  await loader.stop()
  return getMessages()
}

export const runAgentLoop = async ({
  messages,
  tools = [],
  maxIterations = 10,
}: {
  messages: AIMessage[]
  tools?: Tool[]
  maxIterations?: number
}) => {
  const lastMessage = messages[messages.length - 1]
  let userText: string

  // Handle different message formats
  if ('content' in lastMessage) {
    userText = lastMessage.content
  } else if (
    'parts' in lastMessage &&
    lastMessage.parts[0] &&
    'text' in lastMessage.parts[0]
  ) {
    userText = lastMessage.parts[0].text
  } else {
    throw new Error('Invalid message format - no text content found')
  }

  await addMessages([
    {
      role: 'user',
      parts: [{ text: userText }],
    },
  ])

  let iteration = 0
  let continueLoop = true
  const loader = await showLoader('Processing...')

  try {
    while (continueLoop && iteration < maxIterations) {
      iteration++

      const history = await getMessages()
      const { response, hadFunctionCalls } = await runLLMWithFunctionInfo({
        messages: history,
        tools,
      })

      // Check if the response indicates the task is complete
      // or if it's asking for more information
      const isComplete = checkIfTaskComplete(response)

      await addMessages([
        {
          role: 'model',
          parts: [{ text: response }],
        },
      ])

      await logMessage({
        role: 'model',
        parts: [{ text: response }],
      })

      // If task appears complete, no function calls were made, or no tools available, end the loop
      if (isComplete || !hadFunctionCalls || tools.length === 0) {
        continueLoop = false
      }

      // Add a small delay between iterations to prevent overwhelming the API
      if (continueLoop && iteration < maxIterations) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }

    if (iteration >= maxIterations) {
      const timeoutMessage =
        'Maximum iterations reached. The agent may need more specific instructions or the task might be too complex.'
      await addMessages([
        {
          role: 'model',
          parts: [{ text: timeoutMessage }],
        },
      ])
      await logMessage({
        role: 'model',
        parts: [{ text: timeoutMessage }],
      })
    }
  } finally {
    await loader.stop()
  }

  return getMessages()
}

// Helper function to determine if the task is complete
const checkIfTaskComplete = (response: string): boolean => {
  const completionIndicators = [
    'task completed',
    'finished',
    'done',
    'completed successfully',
    'final result',
    'here is the result',
    'here are the results',
    'analysis complete',
    'calculation complete',
    'search complete',
  ]

  const questionIndicators = [
    'what would you like',
    'how can I help',
    'is there anything else',
    'do you need',
    'would you like me to',
  ]

  const lowercaseResponse = response.toLowerCase()

  // Check for completion indicators
  const hasCompletionIndicator = completionIndicators.some((indicator) =>
    lowercaseResponse.includes(indicator)
  )

  // Check for question indicators (suggesting the agent is waiting for input)
  const hasQuestionIndicator = questionIndicators.some((indicator) =>
    lowercaseResponse.includes(indicator)
  )

  // If it's asking questions or has completion indicators, consider it complete
  return (
    hasCompletionIndicator ||
    hasQuestionIndicator ||
    lowercaseResponse.includes('?')
  )
}
