# 🤖 FlowAgent Admin Interface

A simple web-based interface to manage FlowAgent's content extraction and indexing processes.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Environment Variables

#### Method 1: Using .env.local file (Recommended)

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local with your actual values
WEAVIATE_HOST=your-instance.weaviate.network
WEAVIATE_API_KEY=your-weaviate-api-key
GOOGLE_API_KEY=your-google-api-key
ADMIN_PORT=3001
```

#### Method 2: Using export commands

```bash
export WEAVIATE_HOST="your-instance.weaviate.network"
export WEAVIATE_API_KEY="your-weaviate-api-key"
export GOOGLE_API_KEY="your-google-api-key"
```

### 3. Start Admin Server

```bash
npm run flowagent:admin
```

### 4. Open Admin Interface

Visit [http://localhost:3001](http://localhost:3001) in your browser.

## ✨ Features

### 🔍 Website Content Extraction

- Simple URL input field
- One-click scraping with real-time status
- Content length validation
- Error handling with detailed logs

### 🗄️ Data Indexing

- Automatic chunking of scraped content
- Weaviate integration with progress tracking
- Success/failure status with detailed feedback

### 📊 Progress Tracking

- Visual step indicator (Scrape → Index → Deploy)
- Real-time status updates
- Console logs for debugging

## 🛠️ API Endpoints

### `POST /api/scrape`

Scrapes content from a provided URL.

**Request Body:**

```json
{
  "url": "https://your-website.com"
}
```

**Response:**

```json
{
  "success": true,
  "contentLength": 15420,
  "logs": "Content extraction logs...",
  "message": "Content scraped successfully"
}
```

### `POST /api/index`

Indexes the scraped content into Weaviate.

**Response:**

```json
{
  "success": true,
  "chunksCount": 25,
  "logs": "Indexing process logs...",
  "message": "Content indexed successfully"
}
```

### `GET /api/status`

Checks if scraped content exists.

**Response:**

```json
{
  "hasScrapedContent": true,
  "contentLength": 15420,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### `GET /api/health`

Health check with environment variable status.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": {
    "WEAVIATE_HOST": "✓ Set",
    "WEAVIATE_API_KEY": "✓ Set",
    "GOOGLE_API_KEY": "✓ Set"
  }
}
```

## 🔧 Configuration

### Port Configuration

Default port is `3001`. Override with environment variable:

```bash
export ADMIN_PORT=8080
npm run flowagent:admin
```

### Script Paths

The admin interface executes scripts relative to the project root:

- `./scripts/scraper.js` - Content extraction
- `./scripts/indexer.js` - Data indexing

## 📁 File Structure

```
admin/
├── index.html          # Admin interface UI
├── server.js           # Express.js server
└── README.md          # This documentation
```

## 🎨 UI Features

- **Modern Design** - Clean, responsive interface
- **Visual Feedback** - Loading states and progress indicators
- **Error Handling** - Clear error messages with logs
- **Step Tracking** - Visual progress through the setup process
- **Real-time Updates** - Live status updates during operations

## 🚨 Troubleshooting

### Environment Variables Not Set

Check the health endpoint at `/api/health` to verify environment variable status.

### Script Execution Failures

Check the browser console and server logs for detailed error messages.

### Port Already in Use

Change the port using the `ADMIN_PORT` environment variable.

### CORS Issues

The admin interface serves from the same origin as the API, so CORS should not be an issue.

## 🔒 Security Note

This admin interface has **no authentication** and should only be used in development environments or behind proper access controls in production.
