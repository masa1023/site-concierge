;(function () {
  'use strict'

  // Configuration - これらの値はスクリプトタグのdata属性またはグローバル変数から読み込みます
  const getCurrentScript = () => {
    return (
      document.currentScript ||
      document.querySelector('script[src*="chat-widget.js"]')
    )
  }

  const script = getCurrentScript()
  const CONFIG = {
    weaviateHost: script?.dataset?.weaviateHost,
    weaviateApiKey: script?.dataset?.weaviateApiKey,
    googleApiKey: script?.dataset?.googleApiKey,
    weaviateScheme: 'https',
  }

  // State
  let isOpen = false
  let isLoading = false

  // CSS Styles
  const styles = `
    #ai-chat-widget {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      position: fixed;
      z-index: 10000;
    }
    
    #ai-chat-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      z-index: 10001;
    }
    
    #ai-chat-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(0,0,0,0.3);
    }
    
    #ai-chat-button svg {
      width: 24px;
      height: 24px;
      fill: white;
    }
    
    #ai-chat-window {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      display: none;
      flex-direction: column;
      z-index: 10001;
    }
    
    #ai-chat-window.open {
      display: flex;
      animation: slideUp 0.3s ease-out;
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    #ai-chat-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px;
      border-radius: 12px 12px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    #ai-chat-title {
      font-weight: 600;
      font-size: 16px;
    }
    
    #ai-chat-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 18px;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    #ai-chat-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .ai-message, .user-message {
      max-width: 80%;
      padding: 12px 16px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.4;
    }
    
    .user-message {
      align-self: flex-end;
      background: #667eea;
      color: white;
      margin-left: auto;
    }
    
    .ai-message {
      align-self: flex-start;
      background: white;
      color: #374151;
      border: 1px solid #e5e7eb;
    }
    
    .loading-dots {
      display: inline-block;
    }
    
    .loading-dots::after {
      content: '';
      animation: dots 1.4s infinite;
    }
    
    @keyframes dots {
      0%, 20% { content: '.'; }
      40% { content: '..'; }
      60%, 100% { content: '...'; }
    }
    
    #ai-chat-input-container {
      padding: 16px;
      border-top: 1px solid #e5e7eb;
      background: white;
      border-radius: 0 0 12px 12px;
    }
    
    #ai-chat-input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 24px;
      outline: none;
      font-size: 14px;
      box-sizing: border-box;
      resize: none;
    }
    
    #ai-chat-input:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
    }
    
    #ai-chat-input:disabled {
      background-color: #f3f4f6;
      cursor: not-allowed;
    }
    
    @media (max-width: 480px) {
      #ai-chat-window {
        width: calc(100vw - 40px);
        height: calc(100vh - 140px);
        bottom: 90px;
        right: 20px;
        left: 20px;
      }
    }
  `

  // HTML Template
  const chatHTML = `
    <div id="ai-chat-widget">
      <button id="ai-chat-button" aria-label="Open chat">
        <svg viewBox="0 0 24 24">
          <path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4C22,2.89 21.1,2 20,2Z"/>
        </svg>
      </button>
      
      <div id="ai-chat-window">
        <div id="ai-chat-header">
          <div id="ai-chat-title">FlowAgent✨</div>
          <button id="ai-chat-close" aria-label="Close chat">&times;</button>
        </div>
        
        <div id="ai-chat-messages">
          <div class="ai-message">
            Hi there! Ask me anything about this site.
          </div>
        </div>
        
        <div id="ai-chat-input-container">
          <textarea id="ai-chat-input" placeholder="Type your message..." rows="1"></textarea>
        </div>
      </div>
    </div>
  `

  // Weaviate search function
  async function searchWeaviate(query) {
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
        `${CONFIG.weaviateScheme}://${CONFIG.weaviateHost}/v1/graphql`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${CONFIG.weaviateApiKey}`,
            'X-Google-Api-Key': CONFIG.googleApiKey,
            'X-Weaviate-Cluster-Url': CONFIG.weaviateHost,
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

  // Gemini API function
  async function generateResponse(prompt) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': CONFIG.googleApiKey,
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

  // Main chat response handler
  async function handleUserMessage(message) {
    if (isLoading) return

    isLoading = true
    const messagesContainer = document.getElementById('ai-chat-messages')
    const input = document.getElementById('ai-chat-input')

    // Add user message
    const userMessageEl = document.createElement('div')
    userMessageEl.className = 'user-message'
    userMessageEl.textContent = message
    messagesContainer.appendChild(userMessageEl)

    // Add loading message
    const loadingEl = document.createElement('div')
    loadingEl.className = 'ai-message'
    loadingEl.innerHTML = 'Thinking<span class="loading-dots"></span>'
    messagesContainer.appendChild(loadingEl)

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight

    // Disable input
    input.disabled = true

    try {
      // Search Weaviate for relevant content
      const searchResults = await searchWeaviate(message)

      // Build context from search results
      let context = ''
      if (searchResults && searchResults.length > 0) {
        context = searchResults.map((item) => item.text).join('\n\n')
      }

      // Build prompt for Gemini
      const prompt = `You are FlowAgent, a helpful assistant for this website. Use ONLY the following site information to answer the user's question in a friendly, casual and concise manner.

# Site Information
${context || 'No relevant information found.'}

# User Question
${message}`

      // Generate response with Gemini
      const response = await generateResponse(prompt)

      // Replace loading message with actual response
      loadingEl.className = 'ai-message'
      loadingEl.textContent = response
    } catch (error) {
      console.error('Error generating response:', error)
      loadingEl.textContent =
        'Sorry, something went wrong. Please try again in a moment.'
    } finally {
      isLoading = false
      input.disabled = false
      input.focus()
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
  }

  // Initialize the widget
  function initWidget() {
    // Add styles
    const styleEl = document.createElement('style')
    styleEl.textContent = styles
    document.head.appendChild(styleEl)

    // Add HTML
    const widgetEl = document.createElement('div')
    widgetEl.innerHTML = chatHTML
    document.body.appendChild(widgetEl)

    // Get elements
    const button = document.getElementById('ai-chat-button')
    const window = document.getElementById('ai-chat-window')
    const closeButton = document.getElementById('ai-chat-close')
    const input = document.getElementById('ai-chat-input')

    // Event listeners
    button.addEventListener('click', toggleChat)
    closeButton.addEventListener('click', closeChat)

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        const message = input.value.trim()
        if (message && !isLoading) {
          input.value = ''
          handleUserMessage(message)
        }
      }
    })

    // Auto-resize textarea
    input.addEventListener('input', () => {
      input.style.height = 'auto'
      input.style.height = Math.min(input.scrollHeight, 120) + 'px'
    })
  }

  function toggleChat() {
    const window = document.getElementById('ai-chat-window')
    const button = document.getElementById('ai-chat-button')

    isOpen = !isOpen

    if (isOpen) {
      window.classList.add('open')
      button.style.display = 'none'
      document.getElementById('ai-chat-input').focus()
    } else {
      window.classList.remove('open')
      button.style.display = 'flex'
    }
  }

  function closeChat() {
    const window = document.getElementById('ai-chat-window')
    const button = document.getElementById('ai-chat-button')

    isOpen = false
    window.classList.remove('open')
    button.style.display = 'flex'
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget)
  } else {
    initWidget()
  }
})()
