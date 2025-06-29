import 'dotenv/config'
import { runAgent, runAgentLoop } from './src/agent'
import { exampleFunctionDeclarations } from './src/toolRunner'
import type { Tool } from './types'

const userMessage = process.argv[2]
const useLoop = process.argv.includes('--loop')

if (!userMessage) {
  console.error('Please provide a message')
  console.log('Example: npm start "What\'s the weather in San Francisco?"')
  console.log('Example: npm start "Calculate 25 * 4 + 10"')
  console.log(
    'Example: npm start "Plan a weekend trip to San Francisco" --loop'
  )
  process.exit(1)
}

// Create tools array with function declarations
const tools: Tool[] = [
  {
    functionDeclarations: exampleFunctionDeclarations,
  },
]

// Run the agent with function calling enabled
if (useLoop) {
  console.log('🔄 Running agent loop with function calling...')
  console.log('Max iterations: 10')
} else {
  console.log('🤖 Running agent with function calling...')
}

console.log(
  'Tools available:',
  exampleFunctionDeclarations.map((f) => f.name).join(', ')
)
console.log('Tool choice: AUTO, Parallel: false\n')

if (useLoop) {
  await runAgentLoop({
    messages: [{ role: 'user', parts: [{ text: userMessage }] }],
    tools,
    maxIterations: 10,
  })
} else {
  await runAgent({
    messages: [{ role: 'user', parts: [{ text: userMessage }] }],
    tools,
  })
}

console.log('\n✅ Final response received!')
