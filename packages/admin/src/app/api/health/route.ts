import { NextResponse } from 'next/server'
import { validateEnvironmentVariables } from '@/lib/weaviate'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS })
}

export async function GET() {
  const { valid, missing } = validateEnvironmentVariables()

  const environment: Record<string, string> = {
    WEAVIATE_HOST: process.env.WEAVIATE_HOST ? '✓ Set' : '✗ Missing',
    WEAVIATE_API_KEY: process.env.WEAVIATE_API_KEY ? '✓ Set' : '✗ Missing',
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ? '✓ Set' : '✗ Missing',
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? '✓ Set' : '✗ Missing',
  }

  return NextResponse.json(
    {
      status: valid ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      environment,
      missingVars: missing.length > 0 ? missing : null,
    },
    { headers: CORS_HEADERS }
  )
}
