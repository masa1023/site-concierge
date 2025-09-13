import { useState, useEffect, useRef } from 'preact/hooks';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const trimmed = message.trim();
      if (trimmed && !disabled) {
        onSendMessage(trimmed);
        setMessage('');
      }
    }
  };

  const handleInput = (e: Event) => {
    const target = e.target as HTMLTextAreaElement;
    setMessage(target.value);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  return (
    <div className="ai-chat-input-container">
      <textarea
        ref={textareaRef}
        className="ai-chat-input"
        placeholder="Type your message..."
        rows={1}
        value={message}
        onInput={handleInput}
        onKeyDown={handleSubmit}
        disabled={disabled}
      />
    </div>
  );
}