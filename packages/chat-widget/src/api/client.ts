// Admin API base URL from environment variables
const ADMIN_API_URL =
  import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:3000'

export async function searchWeaviate(query: string) {
  try {
    const response = await fetch(`${ADMIN_API_URL}/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: 3,
        distance: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`Admin API error: ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Search failed')
    }

    return result.results || []
  } catch (error) {
    console.error('Search error:', error)
    throw error
  }
}

export async function generateResponse(prompt: string) {
  try {
    const response = await fetch(`${ADMIN_API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        temperature: 0.7,
        maxOutputTokens: 1024,
      }),
    })

    if (!response.ok) {
      throw new Error(`Admin API error: ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Generation failed')
    }

    return result.response
  } catch (error) {
    console.error('Generation error:', error)
    throw error
  }
}
