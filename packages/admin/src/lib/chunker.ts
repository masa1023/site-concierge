export function chunkText(text: string, maxChunkSize: number = 500): string[] {
  const sentences = text
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0)
  const chunks: string[] = []
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
    chunks.push(
      currentChunk + (currentChunk.endsWith('.') ? '' : '.')
    )
  }

  return chunks.filter((chunk) => chunk.length > 20)
}
