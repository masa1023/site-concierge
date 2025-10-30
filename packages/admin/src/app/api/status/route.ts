import { NextResponse } from 'next/server'
import { getScrapedContentStats } from '@/lib/scraper'

export async function GET() {
  const stats = getScrapedContentStats()

  return NextResponse.json({
    hasScrapedContent: stats.hasContent,
    contentLength: stats.contentLength,
    timestamp: stats.timestamp,
  })
}
