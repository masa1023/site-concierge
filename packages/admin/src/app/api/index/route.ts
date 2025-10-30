import { NextResponse } from 'next/server'
import {
  createWeaviateClient,
  createCollection,
  indexContent,
  validateEnvironmentVariables,
} from '@/lib/weaviate'

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
      { status: 400 }
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

    return NextResponse.json({
      success: true,
      chunksCount: chunksCount,
      message: 'Content indexed successfully',
    })
  } catch (error: any) {
    console.error('Indexing error:', error)
    return NextResponse.json(
      {
        error: 'Indexing failed',
        message: error?.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}
