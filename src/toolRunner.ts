import type { FunctionCall, FunctionDeclaration, ToolFn } from '../types'

// Registry to store tool functions
const toolRegistry = new Map<string, ToolFn>()

// Register a tool function
export const registerTool = (name: string, fn: ToolFn) => {
  toolRegistry.set(name, fn)
}

// Execute a function call
export const executeFunctionCall = async (
  functionCall: FunctionCall,
  userMessage: string
): Promise<any> => {
  const toolFn = toolRegistry.get(functionCall.name)

  if (!toolFn) {
    throw new Error(`Tool function "${functionCall.name}" not found`)
  }

  try {
    const result = await toolFn({
      userMessage,
      toolArgs: functionCall.args,
    })
    return result
  } catch (error) {
    console.error(`Error executing tool "${functionCall.name}":`, error)
    throw error
  }
}

// Helper to create function declarations
export const createFunctionDeclaration = (
  name: string,
  description: string,
  parameters: FunctionDeclaration['parameters']
): FunctionDeclaration => {
  return {
    name,
    description,
    parameters,
  }
}

// Example tool functions for demonstration
export const exampleTools = {
  // Weather tool example
  get_weather: async ({ toolArgs }: { toolArgs: { location: string } }) => {
    const { location } = toolArgs
    // Mock weather data - in real app, call weather API
    return {
      location,
      temperature: 72,
      condition: 'sunny',
      humidity: 45,
    }
  },

  // Calculator tool example
  calculate: async ({ toolArgs }: { toolArgs: { expression: string } }) => {
    const { expression } = toolArgs
    try {
      // Simple calculation for demo - allow Math operations
      const allowedMath = {
        Math,
        sqrt: Math.sqrt,
        pow: Math.pow,
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        abs: Math.abs,
        floor: Math.floor,
        ceil: Math.ceil,
        round: Math.round,
        max: Math.max,
        min: Math.min,
      }

      // Create a safe function with allowed operations
      const result = Function(`
        "use strict";
        const { Math, sqrt, pow, sin, cos, tan, abs, floor, ceil, round, max, min } = arguments[0];
        return (${expression});
      `)(allowedMath)

      return { expression, result }
    } catch (error) {
      console.error('Calculation error:', error)
      return { error: 'Invalid expression' }
    }
  },
}

// Register example tools
registerTool('get_weather', exampleTools.get_weather)
registerTool('calculate', exampleTools.calculate)

// Example function declarations
export const exampleFunctionDeclarations: FunctionDeclaration[] = [
  createFunctionDeclaration(
    'get_weather',
    'Get the current weather for a given location',
    {
      type: 'OBJECT',
      properties: {
        location: {
          type: 'STRING',
          description: 'The city and state, e.g. San Francisco, CA',
        },
      },
      required: ['location'],
    }
  ),
  createFunctionDeclaration('calculate', 'Perform a mathematical calculation', {
    type: 'OBJECT',
    properties: {
      expression: {
        type: 'STRING',
        description:
          'Mathematical expression to evaluate, e.g. "2 + 2" or "Math.sqrt(16)"',
      },
    },
    required: ['expression'],
  }),
]
