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

  // File system tool example
  read_file: async ({ toolArgs }: { toolArgs: { path: string } }) => {
    const { path } = toolArgs
    try {
      // In a real application, you would read the actual file
      // For demo purposes, we'll return mock data
      return {
        path,
        content: `Mock file content for ${path}`,
        size: 1024,
        lastModified: new Date().toISOString(),
      }
    } catch (error) {
      console.error('File read error:', error)
      return { error: `Failed to read file: ${path}` }
    }
  },

  // Web search tool example
  web_search: async ({ toolArgs }: { toolArgs: { query: string } }) => {
    const { query } = toolArgs
    // Mock search results - in real app, call search API
    return {
      query,
      results: [
        {
          title: `Search result for: ${query}`,
          url: `https://example.com/search?q=${encodeURIComponent(query)}`,
          snippet: `This is a mock search result for the query "${query}". In a real implementation, this would return actual web search results.`,
        },
        {
          title: `Another result for: ${query}`,
          url: `https://example.org/info?q=${encodeURIComponent(query)}`,
          snippet: `Additional information related to "${query}" would appear here.`,
        },
      ],
    }
  },

  // Task planning tool example
  create_plan: async ({
    toolArgs,
  }: {
    toolArgs: { task: string; steps?: string[] }
  }) => {
    const { task, steps } = toolArgs
    const defaultSteps = [
      'Analyze the requirements',
      'Break down the task into smaller components',
      'Execute each component step by step',
      'Validate the results',
      'Provide final summary',
    ]

    return {
      task,
      plan: steps || defaultSteps,
      estimatedTime: '15-30 minutes',
      created: new Date().toISOString(),
    }
  },
}

// Register example tools
registerTool('get_weather', exampleTools.get_weather)
registerTool('calculate', exampleTools.calculate)
registerTool('read_file', exampleTools.read_file)
registerTool('web_search', exampleTools.web_search)
registerTool('create_plan', exampleTools.create_plan)

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
  createFunctionDeclaration('read_file', 'Read the contents of a file', {
    type: 'OBJECT',
    properties: {
      path: {
        type: 'STRING',
        description: 'The file path to read from',
      },
    },
    required: ['path'],
  }),
  createFunctionDeclaration('web_search', 'Search the web for information', {
    type: 'OBJECT',
    properties: {
      query: {
        type: 'STRING',
        description: 'The search query to find information about',
      },
    },
    required: ['query'],
  }),
  createFunctionDeclaration(
    'create_plan',
    'Create a plan for completing a task',
    {
      type: 'OBJECT',
      properties: {
        task: {
          type: 'STRING',
          description: 'The task that needs to be planned',
        },
        steps: {
          type: 'ARRAY',
          description: 'Optional array of custom steps for the plan',
          items: {
            type: 'STRING',
            description: 'A step in the plan',
          },
        },
      },
      required: ['task'],
    }
  ),
]
