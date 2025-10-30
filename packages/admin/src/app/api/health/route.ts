import { NextResponse } from 'next/server'
import { validateEnvironmentVariables } from '@/lib/weaviate'

export async function GET() {
  const { valid, missing } = validateEnvironmentVariables()

  const environment: Record<string, string> = {
    WEAVIATE_HOST: process.env.WEAVIATE_HOST ? '✓ Set' : '✗ Missing',
    WEAVIATE_API_KEY: process.env.WEAVIATE_API_KEY ? '✓ Set' : '✗ Missing',
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ? '✓ Set' : '✗ Missing',
  }

  return NextResponse.json({
    status: valid ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    environment,
    missingVars: missing.length > 0 ? missing : null,
  })
}
