import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

export async function scrapeWebsite(url: string): Promise<string> {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    console.log(`Navigating to: ${url}`)
    await page.goto(url, { waitUntil: 'domcontentloaded' })

    // Wait a bit for dynamic content to load
    await page.waitForTimeout(2000)

    // Extract main content text
    const content = await page.evaluate(() => {
      // Remove script and style elements
      const scripts = document.querySelectorAll('script, style, noscript')
      scripts.forEach((el) => el.remove())

      // Try to find main content areas
      const selectors = [
        'main',
        '[role="main"]',
        '.content',
        '.main-content',
        'article',
        '.post',
        '.page-content',
        'body',
      ]

      let mainContent = ''

      for (const selector of selectors) {
        const element = document.querySelector(selector)
        if (element) {
          mainContent = (element as HTMLElement).innerText
          break
        }
      }

      // Clean up the text
      return mainContent
        .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
        .replace(/\n\s*\n/g, '\n') // Remove empty lines
        .trim()
    })

    console.log(`Extracted content length: ${content.length} characters`)

    // Save to file
    const contentPath = path.join(process.cwd(), 'scraped_content.txt')
    fs.writeFileSync(contentPath, content, 'utf8')
    console.log('Content saved to scraped_content.txt')

    return content
  } catch (error) {
    console.error('Error scraping website:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export function getScrapedContentPath(): string {
  return path.join(process.cwd(), 'scraped_content.txt')
}

export function readScrapedContent(): string {
  const contentPath = getScrapedContentPath()
  if (!fs.existsSync(contentPath)) {
    throw new Error('Scraped content file not found. Please run scraping first.')
  }
  return fs.readFileSync(contentPath, 'utf8')
}

export function hasScrapedContent(): boolean {
  return fs.existsSync(getScrapedContentPath())
}

export function getScrapedContentStats(): {
  hasContent: boolean
  contentLength: number
  timestamp: Date | null
} {
  const contentPath = getScrapedContentPath()
  const hasContent = fs.existsSync(contentPath)

  let contentLength = 0
  let timestamp = null

  if (hasContent) {
    try {
      const content = fs.readFileSync(contentPath, 'utf8')
      contentLength = content.length
      timestamp = fs.statSync(contentPath).mtime
    } catch (error) {
      console.error('Error reading content file:', error)
    }
  }

  return { hasContent, contentLength, timestamp }
}
