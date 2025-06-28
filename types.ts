export type AIMessage =
  | { role: 'model'; parts: [{ text: string }] }
  | { role: 'user'; parts: [{ text: string }] }
  | {
      role: 'function'
      parts: [{ functionResponse: { name: string; response: any } }]
    }
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string }
  | { role: 'tool'; content: string; tool_call_id: string }

export interface ToolFn<A = any, T = any> {
  (input: { userMessage: string; toolArgs: A }): Promise<T>
}

// Gemini Function Declaration types (using proper Gemini API types)
export interface FunctionDeclaration {
  name: string
  description: string
  parameters: {
    type: 'OBJECT'
    properties: Record<string, ParameterSchema>
    required?: string[]
  }
}

export interface ParameterSchema {
  type: 'STRING' | 'NUMBER' | 'INTEGER' | 'BOOLEAN' | 'ARRAY' | 'OBJECT'
  description: string
  enum?: string[]
  items?: ParameterSchema
}

export interface FunctionCall {
  name: string
  args: Record<string, any>
}

export interface Tool {
  functionDeclarations: FunctionDeclaration[]
}

export interface ToolConfig {
  function_calling_config: {
    mode: 'AUTO' | 'ANY' | 'NONE'
    allowed_function_names?: string[]
  }
}
