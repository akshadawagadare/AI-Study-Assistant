import { Bot, User, FileText } from 'lucide-react'

interface Source {
  name: string
  page?: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: Source[]
}

interface MessageBubbleProps {
  message: Message
}

function MessageBubble({ message }: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div
      className={`flex gap-3 ${
        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
          message.role === 'user'
            ? 'bg-primary'
            : 'bg-secondary border border-border'
        }`}
      >
        {message.role === 'user' ? (
          <User className="w-4 h-4 text-primary-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-primary" />
        )}
      </div>
      <div
        className={`flex flex-col max-w-[75%] ${
          message.role === 'user' ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={`text-xs font-medium mb-1 ${
            message.role === 'user' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          {message.role === 'user' ? 'You' : 'StudyMind'}
        </div>
        <div
          className={`${
            message.role === 'user'
              ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-md'
              : 'bg-card border border-border text-foreground rounded-2xl rounded-tl-md'
          } px-4 py-3`}
        >
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
        </div>
        {message.role === 'assistant' &&
          message.sources &&
          message.sources.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {message.sources.map((source, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary border border-border text-xs text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors cursor-pointer"
                >
                  <FileText className="w-3 h-3" />
                  <span className="truncate max-w-[120px]">{source.name}</span>
                  {source.page && (
                    <span className="text-primary font-medium">
                      p.{source.page}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        <p className="text-xs text-muted-foreground mt-1.5">
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  )
}

export default MessageBubble
