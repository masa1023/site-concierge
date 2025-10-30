# Site Concierge

RAG AI Chat Widget powered by Weaviate and Google Gemini, built as a monorepo with Preact.

## 🏗️ Architecture

This is a monorepo containing two independent packages:

- **`packages/chat-widget`**: Embeddable Preact chat widget for external websites
- **`packages/admin`**: Web-based admin interface for content management

## ✨ Features

- 🔍 **Automatic Web Content Extraction** (Playwright)
- 🗄️ **Vector Search Database** (Weaviate + Google Gemini Embedding)
- 🧠 **AI Response Generation** (Google Gemini API)
- 🌐 **Embeddable Web Widget** (Preact + TypeScript)
- 🎛️ **Admin Interface** (Express + Static HTML)

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- npm workspaces support

### Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure API keys**

   ```bash
   # For admin interface
   cd packages/admin
   cp .env.local.example .env.local
   # Edit .env.local with your API keys

   # For chat widget development
   cd ../chat-widget
   cp .env.local.example .env.local
   # Edit .env.local with your API keys
   ```

3. **Start development**
   ```bash
   # Root directory commands
   npm run dev:admin    # Start admin interface
   npm run dev:chat     # Start chat widget development
   ```

## 📁 Project Structure

```
site-concierge/
├── packages/
│   ├── admin/                # Express.js admin interface
│   └── chat-widget/          # Preact embeddable widget
├── package.json              # Root package with workspaces
└── README.md
```

## 🔧 Configuration

### Required API Keys

1. **Weaviate Cloud**: [console.weaviate.cloud](https://console.weaviate.cloud)

   - Create cluster → Get Host URL and API Key

2. **Google AI Studio**: [aistudio.google.com](https://aistudio.google.com)
   - Create API key for Gemini model

### Environment Variables

Each package maintains its own environment configuration:

- `packages/admin/.env.local` - Server-side configuration
- `packages/chat-widget/.env.local` - Development configuration

**Admin Interface (`packages/admin/.env.local`):**

```bash
WEAVIATE_HOST=your-cluster.weaviate.network
WEAVIATE_API_KEY=your-weaviate-api-key
GOOGLE_API_KEY=your-google-api-key
```

**Chat Widget (`packages/chat-widget/.env.local`):**

```bash
VITE_ADMIN_API_URL
```

## 🛠️ Development Commands

```bash
# Package management
npm install                    # Install all workspace dependencies
npm install pkg --workspace=admin    # Add dependency to specific package

# Development
npm run dev:admin             # Start admin server
npm run dev:chat              # Start chat widget dev server

# Building
npm run build                 # Build chat widget only
npm run build:chat            # Build chat widget explicitly
```

## 🤖 Chat Widget (`packages/chat-widget`)

Lightweight, embeddable chat widget for any website.

### Features

- 🤖 **AI-powered conversations** using Google Gemini
- 🔍 **Context-aware responses** from your website content
- 📱 **Responsive design** works on desktop and mobile
- ⚡ **Lightweight** - Built with Preact for minimal bundle size
- 🚀 **Easy embedding** - Single script tag integration
- 🎨 **Customizable styling** with CSS-in-JS

### Development

```bash
cd packages/chat-widget
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Build embeddable scripts
```

### Building for Production

```bash
npm run build:chat
```

Generates two formats in `dist/` directory:

- `chat-widget.iife.js` - Self-contained script for embedding
- `chat-widget.es.js` - ES module format

### Website Integration

Add this script tag to any website:

```html
<script
  src="https://your-cdn.com/chat-widget.iife.js"
  data-weaviate-host="your-cluster.weaviate.network"
  data-weaviate-api-key="your-weaviate-api-key"
  data-google-api-key="your-google-api-key"
></script>
```

### Configuration Options

The widget reads configuration in this priority order:

1. **Script tag data attributes** (recommended for production)
2. **Environment variables** (development only)

### Widget Appearance

- **Desktop**: 350px × 500px chat window
- **Mobile**: Full-width with mobile-optimized layout
- **Theme**: Modern gradient design with smooth animations

### CSS Overrides

```css
/* Override widget styles */
#ai-chat-window {
  /* Custom chat window styles */
}

#ai-chat-button {
  /* Custom button styles */
}
```

## 🔧 Admin Interface (`packages/admin`)

Web-based content management interface for Site Concierge chat widget.

### Features

- **Website Content Scraping** - Extract content using Playwright
- **Weaviate Data Indexing** - Chunk and index content for vector search
- **Real-time Processing Status** - Live feedback during operations
- **Environment Validation** - Check API key configuration
- **Health Monitoring** - API endpoints for system status

### Development

```bash
cd packages/admin
npm run dev     # Start development server (http://localhost:3001)
npm start       # Start production server
```

### API Endpoints

#### Content Management

- `POST /api/scrape` - Scrape website content

  ```json
  {
    "url": "https://example.com"
  }
  ```

- `POST /api/index` - Index scraped content into Weaviate
  ```json
  {
    "success": true,
    "chunksCount": 42
  }
  ```

#### System Status

- `GET /api/status` - Check scraped content status
- `GET /api/health` - Validate environment and system health

### Usage Workflow

1. **Configure API Keys** - Set up Weaviate and Google API credentials
2. **Scrape Content** - Extract text content from target website
3. **Index Data** - Process and upload content chunks to Weaviate
4. **Deploy Widget** - Use indexed data with chat widget on websites

### Content Processing

#### Scraping Process

1. Launches headless Chrome browser
2. Extracts main content using CSS selectors
3. Cleans and normalizes text
4. Saves to `scraped_content.txt`

#### Indexing Process

1. Reads scraped content file
2. Splits into semantic chunks (500 chars)
3. Creates Weaviate collection
4. Uploads chunks with embeddings

## 🚢 Deployment

### Chat Widget

```bash
npm run build:chat
# Upload dist/chat-widget.iife.js to your CDN
```

### Admin Interface

```bash
cd packages/admin
npm start  # Production server
```

## 🚨 Troubleshooting

### Common Issues

**"Environment variables missing"**

- Ensure `.env.local` files exist in both packages
- Check variable names (VITE\_ prefix for chat-widget)

**"Build fails"**

- Clear node_modules and reinstall
- Check TypeScript errors in chat-widget

**"API connection failed"**

- Verify API keys are correct
- Check Weaviate cluster status
- Ensure proper CORS configuration

**Widget not appearing**

- Check browser console for errors
- Ensure script loads successfully
- Verify no CSS conflicts with z-index

### Debug Mode

Enable debug logging in browser console:

```javascript
localStorage.setItem('chat-widget-debug', 'true')
```

### Health Check

Visit http://localhost:3001/api/health to verify:

- ✅ All environment variables set
- ✅ Server running properly

## 🔐 Security Considerations

- **API Keys**: Use environment-specific keys
- **CORS**: Configure Weaviate cluster for your domains
- **Content**: Ensure scraped content is appropriate
- **Rate Limiting**: Consider API usage limits
