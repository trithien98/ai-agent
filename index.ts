import 'dotenv/config'
import { runAgent } from './src/agent'
import { exampleFunctionDeclarations } from './src/toolRunner'
import type { Tool } from './types'

const userMessage = process.argv[2]

if (!userMessage) {
  console.error('Please provide a message')
  console.log('Example: npm start "What\'s the weather in San Francisco?"')
  console.log('Example: npm start "Calculate 25 * 4 + 10"')
  process.exit(1)
}

// Create tools array with function declarations
const tools: Tool[] = [
  {
    functionDeclarations: exampleFunctionDeclarations,
  },
]

// Run the agent with function calling enabled
console.log('🤖 Running agent with function calling...')
console.log(
  'Tools available:',
  exampleFunctionDeclarations.map((f) => f.name).join(', ')
)
console.log('Tool choice: AUTO, Parallel: false\n')

await runAgent({
  messages: [{ role: 'user', parts: [{ text: userMessage }] }],
  tools,
})

console.log('\n✅ Final response received!')
