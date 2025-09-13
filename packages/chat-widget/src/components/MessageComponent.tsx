interface MessageComponentProps {
  message: string;
  isUser: boolean;
  isLoading: boolean;
}

export function MessageComponent({ message, isUser, isLoading }: MessageComponentProps) {
  const className = isUser ? 'user-message' : 'ai-message';

  if (isLoading) {
    return (
      <div className={className}>
        Thinking<span className="loading-dots"></span>
      </div>
    );
  }

  return (
    <div className={className}>
      {message}
    </div>
  );
}