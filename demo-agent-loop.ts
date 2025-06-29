import { runAgentLoop } from './src/agent'
import { exampleFunctionDeclarations } from './src/toolRunner'

// Demo function to test the agent loop
async function demoAgentLoop() {
  console.log('🤖 Starting Agent Loop Demo...\n')

  // Example 1: Simple calculation that might require multiple steps
  console.log('📊 Example 1: Complex calculation task')
  const mathMessages = [
    {
      role: 'user' as const,
      content:
        'I need you to calculate the area of a circle with radius 5, then find the square root of that result, and finally multiply by 2. Show me each step.',
    },
  ]

  try {
    const _mathResult = await runAgentLoop({
      messages: mathMessages,
      tools: [{ functionDeclarations: exampleFunctionDeclarations }],
      maxIterations: 5,
    })
    console.log('✅ Math task completed!\n')
  } catch (error) {
    console.error('❌ Math task failed:', error)
  }

  // Example 2: Planning and research task
  console.log('📋 Example 2: Planning task with research')
  const planningMessages = [
    {
      role: 'user' as const,
      content:
        'Help me create a plan for learning TypeScript. First search for current information about TypeScript, then create a structured learning plan.',
    },
  ]

  try {
    const _planningResult = await runAgentLoop({
      messages: planningMessages,
      tools: [{ functionDeclarations: exampleFunctionDeclarations }],
      maxIterations: 8,
    })
    console.log('✅ Planning task completed!\n')
  } catch (error) {
    console.error('❌ Planning task failed:', error)
  }

  // Example 3: Information gathering task
  console.log('🔍 Example 3: Information gathering task')
  const infoMessages = [
    {
      role: 'user' as const,
      content:
        'Get the weather for San Francisco, then search for information about outdoor activities there, and create a plan for a weekend visit.',
    },
  ]

  try {
    const _infoResult = await runAgentLoop({
      messages: infoMessages,
      tools: [{ functionDeclarations: exampleFunctionDeclarations }],
      maxIterations: 10,
    })
    console.log('✅ Information gathering completed!\n')
  } catch (error) {
    console.error('❌ Information gathering failed:', error)
  }

  console.log('🎉 Agent Loop Demo completed!')
}

// Run the demo if this file is executed directly
if (require.main === module) {
  demoAgentLoop().catch(console.error)
}

export { demoAgentLoop }
