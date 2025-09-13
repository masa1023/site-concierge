const { chromium } = require('playwright')
const fs = require('fs')

async function scrapeWebsite(url) {
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
          mainContent = element.innerText
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
    fs.writeFileSync('scraped_content.txt', content, 'utf8')
    console.log('Content saved to scraped_content.txt')

    return content
  } catch (error) {
    console.error('Error scraping website:', error)
    throw error
  } finally {
    await browser.close()
  }
}

// Usage example
async function main() {
  const url = process.argv[2]

  if (!url) {
    console.error('Please provide a URL as an argument')
    console.error('Usage: node scraper.js <URL>')
    process.exit(1)
  }

  try {
    await scrapeWebsite(url)
  } catch (error) {
    console.error('Failed to scrape website:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { scrapeWebsite }
