// Get configuration from global variable set by ChatWidget component
const getConfig = () => {
  return (window as any).CHAT_WIDGET_CONFIG || {}
}

export async function searchWeaviate(query: string) {
  const config = getConfig()

  const graphqlQuery = {
    query: `
      {
        Get {
          WebsiteContent(
            nearText: {
              concepts: ["${query.replace(/"/g, '\\"')}"]
              distance: 0.7
            }
            limit: 3
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
      `${config.weaviateScheme}://${config.weaviateHost}/v1/graphql`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.weaviateApiKey}`,
          'X-Google-Api-Key': config.googleApiKey,
          'X-Weaviate-Cluster-Url': config.weaviateHost,
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

export async function generateResponse(prompt: string) {
  const config = getConfig()

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': config.googleApiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const result = await response.json()

    if (
      result.candidates &&
      result.candidates[0] &&
      result.candidates[0].content
    ) {
      return result.candidates[0].content.parts[0].text
    } else {
      throw new Error('Invalid response from Gemini API')
    }
  } catch (error) {
    console.error('Gemini API error:', error)
    throw error
  }
}
