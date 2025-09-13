# Chat Widget

Preact-based embeddable chat widget for Site Concierge.

## Development

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
  data-weaviate-host="your-weaviate-host.com"
  data-weaviate-api-key="your-weaviate-api-key"
  data-google-api-key="your-google-api-key"
></script>
```

### Configuration

The widget reads configuration from:

1. Script tag data attributes (preferred for embedded usage)
2. Global `CHAT_WIDGET_CONFIG` object

Required configuration:

- `weaviateHost`: Weaviate cluster URL
- `weaviateApiKey`: Weaviate API key
- `googleApiKey`: Google API key for Gemini
