import { NextRequest, NextResponse } from 'next/server'
import { generateResponse } from '@/lib/gemini'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS })
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, temperature = 0.7, maxOutputTokens = 1024 } =
      await request.json()

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a non-empty string' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    console.log(`Generating response for prompt: "${prompt.substring(0, 50)}..."`)

    const response = await generateResponse(prompt, {
      temperature,
      maxOutputTokens,
    })

    return NextResponse.json(
      {
        success: true,
        prompt,
        response,
      },
      { headers: CORS_HEADERS }
    )
  } catch (error: any) {
    console.error('Generation error:', error)
    return NextResponse.json(
      {
        error: 'Generation failed',
        message: error?.message || 'Unknown error',
      },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}
