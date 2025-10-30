import { NextRequest, NextResponse } from 'next/server'
import { searchWeaviate } from '@/lib/weaviate'

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
    const { query, limit = 3, distance = 0.7 } = await request.json()

    if (!query || typeof query !== 'string' || query.trim() === '') {
      return NextResponse.json(
        { error: 'Query is required and must be a non-empty string' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    console.log(`Searching Weaviate for: "${query}"`)

    const results = await searchWeaviate(query, limit, distance)

    return NextResponse.json(
      {
        success: true,
        query,
        results,
        count: results.length,
      },
      { headers: CORS_HEADERS }
    )
  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json(
      {
        error: 'Search failed',
        message: error?.message || 'Unknown error',
      },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}
