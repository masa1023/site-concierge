# Site Concierge

RAG AI Chat Widget powered by Weaviate and Google Gemini, built as a monorepo with Preact.

## Architecture

This is a monorepo containing two packages:

- **`packages/chat-widget`**: Embeddable Preact chat widget
- **`packages/admin`**: Admin interface for content management

## Features

- 🔍 **Automatic Web Content Extraction** (Playwright)
- 🗄️ **Vector Search Database** (Weaviate + Google Gemini Embedding)
- 🧠 **AI Response Generation** (Google Gemini API)
- 🌐 **Embeddable Web Widget** (Preact + TypeScript)
- 🎛️ **Admin Interface** (Preact + TypeScript)

## Development

### Prerequisites

- Node.js 16+
- npm workspaces support

### Setup

```bash
npm install
```

### Development Commands

```bash
# Start chat widget development server
npm run dev:chat

# Start admin interface development server
npm run dev:admin

# Build both packages
npm run build

# Build specific packages
npm run build:chat
npm run build:admin
```

## Packages

### Chat Widget (`packages/chat-widget`)

Embeddable Preact-based chat widget that can be integrated into any website.

**Features:**
- TypeScript support
- Preact for lightweight rendering
- Embeddable as IIFE script
- Responsive design
- API integration with Weaviate and Gemini

**Usage:**
```html
<script
  src="https://your-domain.com/chat-widget.iife.js"
  data-weaviate-host="your-cluster.weaviate.network"
  data-weaviate-api-key="your-api-key"
  data-google-api-key="your-google-api-key"
></script>
```

### Admin Interface (`packages/admin`)

Preact-based admin interface for managing chat widget configurations and content.

**Features:**
- Site configuration management
- Content scraping interface
- Data indexing controls
- TypeScript support

## Legacy Files

The original implementation files are preserved in the root directory:
- `public/chat-widget.js` - Original vanilla JS implementation
- `admin/` - Original admin interface
- `scripts/` - Scraping and indexing scripts

## Configuration

Each package can be configured independently. See individual package READMEs for specific configuration options.

## License

MIT
