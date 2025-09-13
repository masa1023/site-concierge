# Chat Widget

Preact-based embeddable chat widget for Site Concierge.

## Development

### Setup

1. Copy environment variables:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` with your API keys:
```bash
VITE_WEAVIATE_HOST=your-cluster.weaviate.network
VITE_WEAVIATE_API_KEY=your-weaviate-api-key
VITE_GOOGLE_API_KEY=your-google-api-key
```

3. Start development server:
```bash
npm run dev
```

## Build

```bash
npm run build
```

This creates both IIFE and ES module formats in the `dist` directory.

## Usage

### As an embedded script

```html
<script
  src="https://your-domain.com/chat-widget.iife.js"
  data-weaviate-host="your-cluster.weaviate.network"
  data-weaviate-api-key="your-weaviate-api-key"
  data-google-api-key="your-google-api-key"
></script>
```

### Configuration

The widget reads configuration from:

1. **Script tag data attributes** (preferred for embedded usage)
2. **Environment variables** (development only)
3. **Global `CHAT_WIDGET_CONFIG` object** (fallback)

Required configuration:

- `weaviateHost`: Weaviate cluster URL
- `weaviateApiKey`: Weaviate API key
- `googleApiKey`: Google API key for Gemini
