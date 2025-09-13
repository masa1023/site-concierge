const express = require('express')
const path = require('path')
const { spawn } = require('child_process')
const fs = require('fs')

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const app = express()
const PORT = process.env.ADMIN_PORT || 3001

// Middleware
app.use(express.json())
app.use(express.static(path.join(__dirname)))

// Serve admin interface
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

// Utility function to execute Node.js scripts
function executeScript(scriptPath, args = [], callback) {
  const logs = []
  const child = spawn('node', [scriptPath, ...args], {
    cwd: path.join(__dirname, '..'), // Execute from project root
    stdio: ['pipe', 'pipe', 'pipe'],
  })

  child.stdout.on('data', (data) => {
    const message = data.toString()
    logs.push(message)
    console.log('STDOUT:', message)
  })

  child.stderr.on('data', (data) => {
    const message = data.toString()
    logs.push(message)
    console.error('STDERR:', message)
  })

  child.on('close', (code) => {
    callback(code, logs.join('\n'))
  })

  child.on('error', (error) => {
    callback(-1, `Process error: ${error.message}`)
  })
}

// API endpoint for scraping
app.post('/api/scrape', (req, res) => {
  const { url } = req.body

  if (!url) {
    return res.status(400).json({ error: 'URL is required' })
  }

  console.log(`Starting scraping for URL: ${url}`)

  executeScript('./scripts/scraper.js', [url], (code, logs) => {
    if (code === 0) {
      // Check if scraped_content.txt exists and get its size
      try {
        const contentPath = path.join(__dirname, '..', 'scraped_content.txt')
        const content = fs.readFileSync(contentPath, 'utf8')

        res.json({
          success: true,
          contentLength: content.length,
          logs: logs,
          message: 'Content scraped successfully',
        })
      } catch (error) {
        res.status(500).json({
          error: 'Scraping completed but could not read content file',
          logs: logs,
        })
      }
    } else {
      res.status(500).json({
        error: 'Scraping failed',
        logs: logs,
        exitCode: code,
      })
    }
  })
})

// API endpoint for indexing
app.post('/api/index', (req, res) => {
  console.log('Starting indexing process...')

  executeScript('./scripts/indexer.js', [], (code, logs) => {
    if (code === 0) {
      // Try to extract chunk count from logs
      const chunkMatch = logs.match(/Created (\d+) chunks/)
      const chunksCount = chunkMatch ? parseInt(chunkMatch[1]) : 'unknown'

      res.json({
        success: true,
        chunksCount: chunksCount,
        logs: logs,
        message: 'Content indexed successfully',
      })
    } else {
      res.status(500).json({
        error: 'Indexing failed',
        logs: logs,
        exitCode: code,
      })
    }
  })
})

// API endpoint to check if scraped content exists
app.get('/api/status', (req, res) => {
  const contentPath = path.join(__dirname, '..', 'scraped_content.txt')
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
  console.log(`🤖 FlowAgent Admin Server running at http://localhost:${PORT}`)
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
