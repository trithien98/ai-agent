import ora from 'ora'
import type { AIMessage } from '../types'

export const showLoader = (text: string) => {
  const spinner = ora({
    text,
    color: 'cyan',
  }).start()

  return {
    stop: () => spinner.stop(),
    succeed: (text?: string) => spinner.succeed(text),
    fail: (text?: string) => spinner.fail(text),
    update: (text: string) => (spinner.text = text),
  }
}

export const logMessage = (message: AIMessage) => {
  const roleColors = {
    user: '\x1b[36m', // cyan
    assistant: '\x1b[32m', // green
    model: '\x1b[32m', // green
    function: '\x1b[33m', // yellow
  }

  const reset = '\x1b[0m'
  const role = message.role
  const color = roleColors[role as keyof typeof roleColors] || '\x1b[37m' // default to white

  // Don't log tool messages
  if (role === 'tool') {
    return
  }

  // Handle user messages
  if (role === 'user') {
    console.log(`\n${color}[USER]${reset}`)
    if ('content' in message) {
      console.log(`${message.content}\n`)
    } else if (
      'parts' in message &&
      message.parts[0] &&
      'text' in message.parts[0]
    ) {
      console.log(`${message.parts[0].text}\n`)
    }
    return
  }

  // Handle assistant/model messages
  if (role === 'assistant' || role === 'model') {
    console.log(`\n${color}[${role.toUpperCase()}]${reset}`)

    if ('content' in message && message.content) {
      console.log(`${message.content}\n`)
    } else if (
      'parts' in message &&
      message.parts[0] &&
      'text' in message.parts[0]
    ) {
      console.log(`${message.parts[0].text}\n`)
    }
    return
  }

  // Handle function messages
  if (role === 'function') {
    console.log(`\n${color}[FUNCTION]${reset}`)
    if (
      'parts' in message &&
      message.parts[0] &&
      'functionResponse' in message.parts[0]
    ) {
      const response = message.parts[0].functionResponse
      console.log(`Function: ${response.name}`)
      console.log(`Response: ${JSON.stringify(response.response, null, 2)}\n`)
    }
  }
}
