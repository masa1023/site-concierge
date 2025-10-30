import * as weaviate from 'weaviate-client'
import { chunkText } from './chunker'
import { readScrapedContent } from './scraper'

const WEAVIATE_HOST = process.env.WEAVIATE_HOST || ''
const WEAVIATE_API_KEY = process.env.WEAVIATE_API_KEY || ''
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || ''

export async function createWeaviateClient() {
  const client = await weaviate.connectToWeaviateCloud(WEAVIATE_HOST, {
    authCredentials: new weaviate.ApiKey(WEAVIATE_API_KEY),
    headers: {
      'X-Google-Api-Key': GOOGLE_API_KEY,
    },
  })
  return client
}

export async function createCollection(client: any) {
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

export async function indexContent(collection: any): Promise<number> {
  // Read scraped content
  const content = readScrapedContent()
  console.log(`Read content: ${content.length} characters`)

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

export function validateEnvironmentVariables(): { valid: boolean; missing: string[] } {
  const requiredVars = [
    'WEAVIATE_HOST',
    'WEAVIATE_API_KEY',
    'GOOGLE_API_KEY',
  ]

  const missing = requiredVars.filter((v) => !process.env[v])

  return {
    valid: missing.length === 0,
    missing,
  }
}

export interface SearchResult {
  text: string
  chunkIndex: number
}

export async function searchWeaviate(
  query: string,
  limit: number = 3,
  distance: number = 0.7
): Promise<SearchResult[]> {
  const graphqlQuery = {
    query: `
      {
        Get {
          WebsiteContent(
            nearText: {
              concepts: ["${query.replace(/"/g, '\\"')}"]
              distance: ${distance}
            }
            limit: ${limit}
          ) {
            text
            chunkIndex
          }
        }
      }
    `,
  }

  try {
    const response = await fetch(
      `https://${WEAVIATE_HOST}/v1/graphql`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${WEAVIATE_API_KEY}`,
          'X-Google-Api-Key': GOOGLE_API_KEY,
          'X-Weaviate-Cluster-Url': WEAVIATE_HOST,
        },
        body: JSON.stringify(graphqlQuery),
      }
    )

    if (!response.ok) {
      throw new Error(`Weaviate API error: ${response.status}`)
    }

    const result = await response.json()

    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`)
    }

    return result.data?.Get?.WebsiteContent || []
  } catch (error) {
    console.error('Weaviate search error:', error)
    throw error
  }
}
