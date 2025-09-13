import { useEffect, useRef } from 'preact/hooks';
import { MessageComponent } from './MessageComponent';
import { ChatInput } from './ChatInput';
import { Message } from '../types';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function ChatWindow({ isOpen, onClose, messages, onSendMessage, isLoading }: ChatWindowProps) {
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!isOpen) return null;

  return (
    <div id="ai-chat-window" className="open">
      <div className="ai-chat-header">
        <div className="ai-chat-title">FlowAgent✨</div>
        <button className="ai-chat-close" aria-label="Close chat" onClick={onClose}>×</button>
      </div>

      <div className="ai-chat-messages" ref={messagesRef}>
        <div className="ai-message">
          Hi there! Ask me anything about this site.
        </div>
        {messages.map((msg, index) => (
          <MessageComponent
            key={index}
            message={msg.text}
            isUser={msg.isUser}
            isLoading={false}
          />
        ))}
        {isLoading && <MessageComponent message="" isUser={false} isLoading={true} />}
      </div>

      <ChatInput onSendMessage={onSendMessage} disabled={isLoading} />
    </div>
  );
}