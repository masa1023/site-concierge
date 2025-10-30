import { NextRequest, NextResponse } from 'next/server'
import { generateResponse } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const { prompt, temperature = 0.7, maxOutputTokens = 1024 } =
      await request.json()

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    console.log(`Generating response for prompt: "${prompt.substring(0, 50)}..."`)

    const response = await generateResponse(prompt, {
      temperature,
      maxOutputTokens,
    })

    return NextResponse.json({
      success: true,
      prompt,
      response,
    })
  } catch (error: any) {
    console.error('Generation error:', error)
    return NextResponse.json(
      {
        error: 'Generation failed',
        message: error?.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}
