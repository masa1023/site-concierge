import Anthropic from '@anthropic-ai/sdk'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''

export interface GenerateResponseOptions {
  temperature?: number
  maxTokens?: number
}

export async function generateResponse(
  prompt: string,
  options: GenerateResponseOptions = {}
): Promise<string> {
  const { temperature = 0.7, maxTokens = 1024 } = options

  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set')
  }

  try {
    const client = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: maxTokens,
      temperature,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const textContent = message.content.find(
      (block: any) => block.type === 'text'
    )
    if (textContent && textContent.type === 'text') {
      return textContent.text
    } else {
      throw new Error('Invalid response from Claude API')
    }
  } catch (error) {
    console.error('Claude API error:', error)
    throw error
  }
}
