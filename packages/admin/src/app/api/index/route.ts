import { NextResponse } from 'next/server'
import {
  createWeaviateClient,
  createCollection,
  indexContent,
  validateEnvironmentVariables,
} from '@/lib/weaviate'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS })
}

export async function POST() {
  console.log('Starting indexing process...')

  // Validate environment variables
  const { valid, missing } = validateEnvironmentVariables()

  if (!valid) {
    return NextResponse.json(
      {
        error: 'Missing required environment variables',
        missingVars: missing,
        message: 'Please set all required environment variables before indexing.',
      },
      { status: 400, headers: CORS_HEADERS }
    )
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

    return NextResponse.json(
      {
        success: true,
        chunksCount: chunksCount,
        message: 'Content indexed successfully',
      },
      { headers: CORS_HEADERS }
    )
  } catch (error: any) {
    console.error('Indexing error:', error)
    return NextResponse.json(
      {
        error: 'Indexing failed',
        message: error?.message || 'Unknown error',
      },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}
