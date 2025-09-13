const express = require('express')
const path = require('path')
const fs = require('fs')
const { chromium } = require('playwright')
const weaviate = require('weaviate-client')

// Load environment variables from .env.local
require('dotenv').config({
  path: path.join(__dirname, '.env.local'),
})

const app = express()
const PORT = process.env.ADMIN_PORT || 3001

// Middleware
app.use(express.json())
app.use(express.static(path.join(__dirname)))

// Serve admin interface
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

// Configuration
const WEAVIATE_HOST = process.env.WEAVIATE_HOST || ''
const WEAVIATE_API_KEY = process.env.WEAVIATE_API_KEY || ''
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || ''

// Utility function for web scraping
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
    const contentPath = path.join(__dirname, 'scraped_content.txt')
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

// Utility function for creating Weaviate client
async function createWeaviateClient() {
  const client = await weaviate.connectToWeaviateCloud(WEAVIATE_HOST, {
    authCredentials: new weaviate.ApiKey(WEAVIATE_API_KEY),
    headers: {
      'X-Google-Api-Key': GOOGLE_API_KEY,
    },
  })
  return client
}

// Utility function for creating collection
async function createCollection(client) {
  const collectionName = 'WebsiteContent'

  // Check if collection already exists and delete if needed
  try {
    if (await client.collections.exists(collectionName)) {
      console.log(`Collection ${collectionName} already exists, deleting it...`)
      await client.collections.delete(collectionName)
    }
  } catch (error) {
    console.log('Collection check failed, proceeding with creation...')
  }

  // Create collection with Google text2vec and generative modules
  try {
    const collection = await client.collections.create({
      name: collectionName,
      properties: [
        {
          name: 'text',
          dataType: weaviate.configure.dataType.TEXT,
          description: 'The content text',
        },
        {
          name: 'chunkIndex',
          dataType: weaviate.configure.dataType.INT,
          description: 'Index of the chunk',
        },
      ],
      vectorizers: [
        weaviate.configure.vectors.text2VecWeaviate({
          name: 'text_vector',
          sourceProperties: ['text'],
          model: 'Snowflake/snowflake-arctic-embed-m-v1.5',
        }),
      ],
    })

    console.log(`Collection created: ${collectionName}`)
    return collection
  } catch (error) {
    console.error('Error creating collection:', error)
    throw error
  }
}

// Utility function for chunking text
function chunkText(text, maxChunkSize = 500) {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  const chunks = []
  let currentChunk = ''

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim()
    if (!trimmedSentence) continue

    const potentialChunk =
      currentChunk + (currentChunk ? '. ' : '') + trimmedSentence

    if (potentialChunk.length <= maxChunkSize) {
      currentChunk = potentialChunk
    } else {
      if (currentChunk) {
        chunks.push(currentChunk + '.')
      }
      currentChunk = trimmedSentence
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk + (currentChunk.endsWith('.') ? '' : '.'))
  }

  return chunks.filter((chunk) => chunk.length > 20) // Filter out very short chunks
}

// Utility function for indexing content
async function indexContent(collection) {
  // Read scraped content
  let content
  try {
    const contentPath = path.join(__dirname, 'scraped_content.txt')
    content = fs.readFileSync(contentPath, 'utf8')
    console.log(`Read content: ${content.length} characters`)
  } catch (error) {
    console.error('Error reading scraped_content.txt:', error.message)
    throw new Error('Please run scraping first to generate the content file.')
  }

  // Chunk the content
  const chunks = chunkText(content)
  console.log(`Created ${chunks.length} chunks`)

  if (chunks.length === 0) {
    throw new Error(
      'No chunks created. The content might be too short or empty.'
    )
  }

  // Prepare data objects
  const dataObjects = chunks.map((chunk, index) => ({
    properties: {
      text: chunk,
      chunkIndex: index,
    },
  }))

  // Insert data in batches
  try {
    const response = await collection.data.insertMany(dataObjects)

    console.log(`Successfully inserted ${response.successful} objects`)

    if (response.errors && Object.keys(response.errors).length > 0) {
      console.error('Insert errors:', response.errors)
    }
  } catch (error) {
    console.error('Error inserting data:', error)
    throw error
  }

  console.log(`Successfully indexed ${chunks.length} content chunks`)
  return chunks.length
}

// API endpoint for scraping
app.post('/api/scrape', async (req, res) => {
  const { url } = req.body

  if (!url) {
    return res.status(400).json({ error: 'URL is required' })
  }

  console.log(`Starting scraping for URL: ${url}`)

  try {
    const content = await scrapeWebsite(url)

    res.json({
      success: true,
      contentLength: content.length,
      message: 'Content scraped successfully',
    })
  } catch (error) {
    console.error('Scraping error:', error)
    res.status(500).json({
      error: 'Scraping failed',
      message: error.message,
    })
  }
})

// API endpoint for indexing
app.post('/api/index', async (req, res) => {
  console.log('Starting indexing process...')

  // Validate environment variables
  const requiredVars = [
    { name: 'WEAVIATE_HOST', value: WEAVIATE_HOST },
    { name: 'WEAVIATE_API_KEY', value: WEAVIATE_API_KEY },
    { name: 'GOOGLE_API_KEY', value: GOOGLE_API_KEY },
  ]

  const missingVars = requiredVars.filter((v) => !v.value)

  if (missingVars.length > 0) {
    return res.status(400).json({
      error: 'Missing required environment variables',
      missingVars: missingVars.map((v) => v.name),
      message: 'Please set all required environment variables before indexing.',
    })
  }

  try {
    // Connect to Weaviate
    console.log('Connecting to Weaviate...')
    const client = await createWeaviateClient()

    // Create collection
    console.log('Creating collection...')
    const collection = await createCollection(client)

    // Index content
    console.log('Indexing content...')
    const chunksCount = await indexContent(collection)

    // Close the client connection
    await client.close()

    res.json({
      success: true,
      chunksCount: chunksCount,
      message: 'Content indexed successfully',
    })
  } catch (error) {
    console.error('Indexing error:', error)
    res.status(500).json({
      error: 'Indexing failed',
      message: error.message,
    })
  }
})

// API endpoint to check if scraped content exists
app.get('/api/status', (req, res) => {
  const contentPath = path.join(__dirname, 'scraped_content.txt')
  const hasContent = fs.existsSync(contentPath)

  let contentLength = 0
  if (hasContent) {
    try {
      const content = fs.readFileSync(contentPath, 'utf8')
      contentLength = content.length
    } catch (error) {
      console.error('Error reading content file:', error)
    }
  }

  res.json({
    hasScrapedContent: hasContent,
    contentLength: contentLength,
    timestamp: hasContent ? fs.statSync(contentPath).mtime : null,
  })
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: {
      WEAVIATE_HOST: process.env.WEAVIATE_HOST ? '✓ Set' : '✗ Missing',
      WEAVIATE_API_KEY: process.env.WEAVIATE_API_KEY ? '✓ Set' : '✗ Missing',
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ? '✓ Set' : '✗ Missing',
    },
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error)
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
  })
})

// Start server
app.listen(PORT, () => {
  console.log(
    `🤖 Site Concierge Admin Server running at http://localhost:${PORT}`
  )
  console.log(`📊 Admin interface: http://localhost:${PORT}`)
  console.log(`🔧 Health check: http://localhost:${PORT}/api/health`)

  // Check environment variables
  const envVars = ['WEAVIATE_HOST', 'WEAVIATE_API_KEY', 'GOOGLE_API_KEY']
  const missingVars = envVars.filter((v) => !process.env[v])

  if (missingVars.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missingVars.join(', ')}`)
    console.warn('   Indexing functionality may not work properly.')
  } else {
    console.log('✅ All required environment variables are set')
  }
})

module.exports = app
