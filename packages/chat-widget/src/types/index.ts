export interface Message {
  text: string
  isUser: boolean
}

export interface Config {
  weaviateHost?: string
  weaviateApiKey?: string
  googleApiKey?: string
  weaviateScheme: string
}
