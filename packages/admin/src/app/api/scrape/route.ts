import { NextRequest, NextResponse } from 'next/server'
import { scrapeWebsite } from '@/lib/scraper'

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
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    console.log(`Starting scraping for URL: ${url}`)

    const content = await scrapeWebsite(url)

    return NextResponse.json(
      {
        success: true,
        contentLength: content.length,
        message: 'Content scraped successfully',
      },
      { headers: CORS_HEADERS }
    )
  } catch (error: any) {
    console.error('Scraping error:', error)
    return NextResponse.json(
      {
        error: 'Scraping failed',
        message: error?.message || 'Unknown error',
      },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}
