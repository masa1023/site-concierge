import { render } from 'preact'
import { ChatWidget } from './components/ChatWidget'

// Development mode: render to app div
if (document.getElementById('app')) {
  render(<ChatWidget />, document.getElementById('app'))
}

// Production/embedded mode: render to body as widget
export function initChatWidget() {
  const container = document.createElement('div')
  container.id = 'ai-chat-widget'
  document.body.appendChild(container)
  render(<ChatWidget />, container)
}

// Auto-initialize if script is loaded as embeddable widget
if (typeof window !== 'undefined' && !document.getElementById('app')) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatWidget)
  } else {
    initChatWidget()
  }
}
