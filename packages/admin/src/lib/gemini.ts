const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || ''

export interface GenerateResponseOptions {
  temperature?: number
  maxOutputTokens?: number
}

export async function generateResponse(
  prompt: string,
  options: GenerateResponseOptions = {}
): Promise<string> {
  const {
    temperature = 0.7,
    maxOutputTokens = 1024,
  } = options

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GOOGLE_API_KEY,
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
            temperature,
            topK: 40,
            topP: 0.95,
            maxOutputTokens,
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
