import { useState, useRef } from 'react'
import { Send, Paperclip } from 'lucide-react'

interface ChatInputProps {
  onSendMessage: (content: string, response?: string) => void
  onUploadClick: () => void
  isLoading?: boolean
}

function ChatInput({ onSendMessage, onUploadClick, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading || loading) return

    const question = input.trim()

    try {
      setLoading(true)

      // send question to backend (THIS IS THE FIX)
      const res = await fetch("http://localhost:5000/upload/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
        }),
      })

      const data = await res.json()

      console.log("Backend Response:", data)

      // send both question + answer to parent
      onSendMessage(question, data.answer)

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
      handleSubmit(e)
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
        <div className="relative flex items-end gap-2 bg-card border border-border rounded-2xl p-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">

          <button
            type="button"
            onClick={onUploadClick}
            className="w-10 h-10 rounded-xl bg-secondary text-muted-foreground flex items-center justify-center hover:bg-secondary/80 hover:text-foreground transition-all flex-shrink-0"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your study materials..."
            rows={1}
            className="flex-1 bg-transparent border-0 resize-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none px-3 py-2 max-h-[150px]"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading || loading}
            className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>

        </div>

        <p className="text-xs text-muted-foreground text-center mt-3">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </div>
  )
}

export default ChatInput
// import { useState, useRef } from 'react'
// import { Send, Paperclip } from 'lucide-react'

// interface ChatInputProps {
//   onSendMessage: (content: string) => void
//   onUploadClick: () => void
//   isLoading?: boolean
// }

// function ChatInput({ onSendMessage, onUploadClick, isLoading }: ChatInputProps) {
//   const [input, setInput] = useState('')
//   const textareaRef = useRef<HTMLTextAreaElement>(null)

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     if (input.trim() && !isLoading) {
//       onSendMessage(input.trim())
//       setInput('')
//       if (textareaRef.current) {
//         textareaRef.current.style.height = 'auto'
//       }
//     }
//   }

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault()
//       handleSubmit(e)
//     }
//   }

//   const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setInput(e.target.value)
//     e.target.style.height = 'auto'
//     e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px'
//   }

//   return (
//     <div className="flex-shrink-0 border-t border-border p-4 bg-background">
//       <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
//         <div className="relative flex items-end gap-2 bg-card border border-border rounded-2xl p-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
//           <button
//             type="button"
//             onClick={onUploadClick}
//             className="w-10 h-10 rounded-xl bg-secondary text-muted-foreground flex items-center justify-center hover:bg-secondary/80 hover:text-foreground transition-all flex-shrink-0"
//           >
//             <Paperclip className="w-4 h-4" />
//           </button>
//           <textarea
//             ref={textareaRef}
//             value={input}
//             onChange={handleTextareaChange}
//             onKeyDown={handleKeyDown}
//             placeholder="Ask anything about your study materials..."
//             rows={1}
//             className="flex-1 bg-transparent border-0 resize-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none px-3 py-2 max-h-[150px]"
//           />
//           <button
//             type="submit"
//             disabled={!input.trim() || isLoading}
//             className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
//           >
//             <Send className="w-4 h-4" />
//           </button>
//         </div>
//         <p className="text-xs text-muted-foreground text-center mt-3">
//           Press Enter to send, Shift+Enter for new line
//         </p>
//       </form>
//     </div>
//   )
// }

// export default ChatInput
