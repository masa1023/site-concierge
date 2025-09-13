import { useState, useEffect, useRef } from 'preact/hooks';
import { searchWeaviate, generateResponse } from '../api/client';
import { ChatButton } from './ChatButton';
import { ChatWindow } from './ChatWindow';
import { Message } from '../types';
import './ChatWidget.css';

interface Config {
  weaviateHost?: string;
  weaviateApiKey?: string;
  googleApiKey?: string;
  weaviateScheme: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<Config>({ weaviateScheme: 'https' });

  useEffect(() => {
    // Get configuration from script tag or global config
    const getCurrentScript = () => {
      return (
        document.currentScript ||
        document.querySelector('script[src*="chat-widget"]')
      );
    };

    const script = getCurrentScript();
    const newConfig: Config = {
      weaviateHost: script?.dataset?.weaviateHost || (window as any).CHAT_WIDGET_CONFIG?.weaviateHost,
      weaviateApiKey: script?.dataset?.weaviateApiKey || (window as any).CHAT_WIDGET_CONFIG?.weaviateApiKey,
      googleApiKey: script?.dataset?.googleApiKey || (window as any).CHAT_WIDGET_CONFIG?.googleApiKey,
      weaviateScheme: 'https',
    };
    setConfig(newConfig);

    // Set global config for API client
    (window as any).CHAT_WIDGET_CONFIG = newConfig;
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const handleUserMessage = async (message: string) => {
    if (isLoading) return;

    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, { text: message, isUser: true }]);

    try {
      // Search Weaviate for relevant content
      const searchResults = await searchWeaviate(message);

      // Build context from search results
      let context = '';
      if (searchResults && searchResults.length > 0) {
        context = searchResults.map((item: any) => item.text).join('\n\n');
      }

      // Build prompt for Gemini
      const prompt = `You are FlowAgent, a helpful assistant for this website. Use ONLY the following site information to answer the user's question in a friendly, casual and concise manner.

# Site Information
${context || 'No relevant information found.'}

# User Question
${message}`;

      // Generate response with Gemini
      const response = await generateResponse(prompt);

      // Add AI response
      setMessages(prev => [...prev, { text: response, isUser: false }]);
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [...prev, {
        text: 'Sorry, something went wrong. Please try again in a moment.',
        isUser: false
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ChatButton onClick={toggleChat} isOpen={isOpen} />
      <ChatWindow
        isOpen={isOpen}
        onClose={closeChat}
        messages={messages}
        onSendMessage={handleUserMessage}
        isLoading={isLoading}
      />
    </>
  );
}