import { useState, useRef } from 'react'
import { Send, Paperclip } from 'lucide-react'

const API = import.meta.env.VITE_BACKEND_URL;

interface ChatInputProps {
  onSendMessage: (content: string, response?: string) => void
  onUploadClick: () => void
  isLoading?: boolean
  hasPdf?: boolean // ✅ NEW: know if a PDF has been uploaded
}

function ChatInput({ onSendMessage, onUploadClick, isLoading, hasPdf }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading || loading) return

    const question = input.trim()

    // ✅ Guard: don't send if no PDF uploaded
    if (!hasPdf) {
      alert("Please upload a PDF first before asking a question.")
      return
    }

    try {
      setLoading(true)

      // Note: context is now handled in App.tsx — this component just sends the question up
      onSendMessage(question)

      setInput('')

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }

    } catch (err) {
      console.error("Send error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px'
  }

  return (
    <div className="flex-shrink-0 border-t border-border p-4 bg-background">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">

        {/* ✅ Show warning banner if no PDF uploaded */}
        {!hasPdf && (
          <p className="text-xs text-muted-foreground text-center mb-2">
            📎 Upload a PDF to start asking questions
          </p>
        )}

        <div className="relative flex items-end gap-2 bg-card border border-border rounded-2xl p-2">

          <button
            type="button"
            onClick={onUploadClick}
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={hasPdf ? "Ask anything about your study materials..." : "Upload a PDF first..."}
            rows={1}
            disabled={!hasPdf} // ✅ Disable textarea if no PDF
            className="flex-1 bg-transparent border-0 resize-none text-sm px-3 py-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading || loading || !hasPdf} // ✅ Also disable if no PDF
            className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>

        </div>

      </form>
    </div>
  )
}

export default ChatInput