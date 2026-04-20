import { useRef, useEffect } from 'react'
import { Bot, Sparkles, BookOpen, FileText } from 'lucide-react'
import MessageBubble from './MessageBubble'
import ChatInput from './ChatInput'

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

interface ChatWindowProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  onUploadClick: () => void
  isLoading?: boolean
  selectedDocumentName?: string | null
  hasPdf?: boolean // ✅ ADDED
}

function ChatWindow({ messages, onSendMessage, onUploadClick, isLoading, selectedDocumentName, hasPdf }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      {/* Chat Header */}
      <header className="flex-shrink-0 h-16 border-b border-border px-6 flex items-center justify-between bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-foreground font-medium">
            StudyMind Assistant
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Powered by AI</span>
        </div>
      </header>

      {/* Selected Document Context Indicator */}
      {selectedDocumentName && (
        <div className="flex-shrink-0 px-6 py-2 bg-primary/5 border-b border-border">
          <div className="flex items-center gap-2 max-w-3xl mx-auto">
            <FileText className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm text-foreground">
              Chatting with: <span className="font-medium text-primary">{selectedDocumentName}</span>
            </span>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Welcome to StudyMind
            </h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Your AI-powered study companion. Upload your study materials and ask
              questions to enhance your learning experience.
            </p>
            <div className="grid gap-3 w-full max-w-md">
              {[
                'Summarize my uploaded documents',
                'Create flashcards from the material',
                'Explain this concept in simple terms',
                'Generate practice questions',
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(suggestion)}
                  className="text-left px-4 py-3 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-secondary/50 text-sm text-foreground transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex gap-3 flex-row">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 bg-secondary border border-border">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="flex flex-col items-start">
                  <div className="text-xs font-medium mb-1 text-muted-foreground">
                    StudyMind
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-tl-md px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary/80 animate-[pulse_1s_ease-in-out_infinite]" />
                      <span
                        className="w-2 h-2 rounded-full bg-primary/80 animate-[pulse_1s_ease-in-out_infinite]"
                        style={{ animationDelay: '0.2s' }}
                      />
                      <span
                        className="w-2 h-2 rounded-full bg-primary/80 animate-[pulse_1s_ease-in-out_infinite]"
                        style={{ animationDelay: '0.4s' }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        onSendMessage={onSendMessage}
        onUploadClick={onUploadClick}
        isLoading={isLoading}
        hasPdf={hasPdf} // ✅ ADDED: pass hasPdf down to ChatInput
      />
    </div>
  )
}

export default ChatWindow