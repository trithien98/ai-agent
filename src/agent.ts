import type { AIMessage, Tool } from '../types'
import { runLLM } from './llm'
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
