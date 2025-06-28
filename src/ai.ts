import {
  GoogleGenerativeAI,
  FunctionCallingMode,
  SchemaType,
} from '@google/generative-ai'
import type { Tool } from '../types'

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is required')
}

export const genAI = new GoogleGenerativeAI(apiKey)

// Create model with function calling configuration
export const createModel = (tools?: Tool[]) => {
  const modelConfig: any = {
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.2,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
  }

  // Add tools configuration if provided
  if (tools && tools.length > 0) {
    // Convert our Tool format to Gemini's expected format
    const geminiTools = tools.map((tool) => ({
      functionDeclarations: tool.functionDeclarations.map((fd) => ({
        name: fd.name,
        description: fd.description,
        parameters: {
          type: SchemaType.OBJECT,
          properties: Object.fromEntries(
            Object.entries(fd.parameters.properties).map(([key, prop]) => [
              key,
              {
                type:
                  prop.type === 'STRING'
                    ? SchemaType.STRING
                    : prop.type === 'NUMBER'
                    ? SchemaType.NUMBER
                    : prop.type === 'INTEGER'
                    ? SchemaType.INTEGER
                    : prop.type === 'BOOLEAN'
                    ? SchemaType.BOOLEAN
                    : prop.type === 'ARRAY'
                    ? SchemaType.ARRAY
                    : SchemaType.OBJECT,
                description: prop.description,
                ...(prop.enum && { enum: prop.enum }),
                ...(prop.items && { items: prop.items }),
              },
            ])
          ),
          required: fd.parameters.required || [],
        },
      })),
    }))

    modelConfig.tools = geminiTools

    // Set tool configuration with AUTO mode
    modelConfig.toolConfig = {
      functionCallingConfig: {
        mode: FunctionCallingMode.AUTO,
      },
    }
  }

  return genAI.getGenerativeModel(modelConfig)
}

// Default model without tools
export const model = createModel()
