// Load environment variables from .env.local
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') })

const weaviate = require('weaviate-client')
const fs = require('fs')

// Configuration
const WEAVIATE_HOST = process.env.WEAVIATE_HOST || ''
const WEAVIATE_API_KEY = process.env.WEAVIATE_API_KEY || ''
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || ''

// Validate required environment variables
function validateEnvironmentVariables() {
  const requiredVars = [
    { name: 'WEAVIATE_HOST', value: WEAVIATE_HOST },
    { name: 'WEAVIATE_API_KEY', value: WEAVIATE_API_KEY },
    { name: 'GOOGLE_API_KEY', value: GOOGLE_API_KEY },
  ]

  const missingVars = requiredVars.filter((v) => !v.value)

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:')
    missingVars.forEach((v) => console.error(`  - ${v.name}`))
    console.error(
      '\nPlease set these environment variables before running the script.'
    )
    console.error('Example:')
    console.error('  export WEAVIATE_HOST="your-instance.weaviate.network"')
    console.error('  export WEAVIATE_API_KEY="your-api-key"')
    console.error('  export GOOGLE_API_KEY="your-google-api-key"')
    process.exit(1)
  }
}

async function createWeaviateClient() {
  const client = await weaviate.connectToWeaviateCloud(WEAVIATE_HOST, {
    authCredentials: new weaviate.ApiKey(WEAVIATE_API_KEY),
    headers: {
      'X-Google-Api-Key': GOOGLE_API_KEY,
    },
  })

  return client
}

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

async function indexContent(collection) {
  // Read scraped content
  let content
  try {
    content = fs.readFileSync('scraped_content.txt', 'utf8')
    console.log(`Read content: ${content.length} characters`)
  } catch (error) {
    console.error('Error reading scraped_content.txt:', error.message)
    console.error('Please run scraper.js first to generate the content file.')
    return
  }

  // Chunk the content
  const chunks = chunkText(content)
  console.log(`Created ${chunks.length} chunks`)

  if (chunks.length === 0) {
    console.error('No chunks created. The content might be too short or empty.')
    return
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
}

async function verifyData(collection) {
  try {
    const result = await collection.query.fetchObjects({
      limit: 5,
      returnProperties: ['text', 'chunkIndex'],
    })

    console.log('\nSample indexed data:')
    if (result.objects && result.objects.length > 0) {
      result.objects.forEach((item, index) => {
        console.log(
          `${index + 1}. [${item.properties.chunkIndex}] ${item.properties.text.substring(0, 100)}...`
        )
      })
    } else {
      console.log('No data found in collection')
    }
  } catch (error) {
    console.error('Error verifying data:', error)
  }
}

async function main() {
  try {
    // Validate environment variables first
    validateEnvironmentVariables()

    console.log('Connecting to Weaviate...')
    const client = await createWeaviateClient()

    console.log('Creating collection...')
    const collection = await createCollection(client)

    console.log('Indexing content...')
    await indexContent(collection)

    console.log('Verifying data...')
    await verifyData(collection)

    console.log('\nIndexing completed successfully!')

    // Close the client connection
    await client.close()
  } catch (error) {
    console.error('Error in main process:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = {
  createWeaviateClient,
  createCollection,
  indexContent,
  chunkText,
}
