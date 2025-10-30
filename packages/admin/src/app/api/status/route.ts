import { NextResponse } from 'next/server'
import { getScrapedContentStats } from '@/lib/scraper'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS })
}

export async function GET() {
  const stats = getScrapedContentStats()

  return NextResponse.json(
    {
      hasScrapedContent: stats.hasContent,
      contentLength: stats.contentLength,
      timestamp: stats.timestamp,
    },
    { headers: CORS_HEADERS }
  )
}
