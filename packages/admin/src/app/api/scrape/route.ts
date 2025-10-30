import { NextRequest, NextResponse } from 'next/server'
import { scrapeWebsite } from '@/lib/scraper'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    console.log(`Starting scraping for URL: ${url}`)

    const content = await scrapeWebsite(url)

    return NextResponse.json({
      success: true,
      contentLength: content.length,
      message: 'Content scraped successfully',
    })
  } catch (error: any) {
    console.error('Scraping error:', error)
    return NextResponse.json(
      {
        error: 'Scraping failed',
        message: error?.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}
