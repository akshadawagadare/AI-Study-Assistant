import { useState, useRef } from 'react'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import { Menu, X } from 'lucide-react'

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

interface DocumentFile {
  id: string
  name: string
  size?: string
  isUploading?: boolean
  progress?: number
}

interface ChatHistory {
  id: string
  title: string
  date: string
}

function App() {
  const [apiKey, setApiKey] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>('1')

  const [documents, setDocuments] = useState<DocumentFile[]>([
    { id: '1', name: 'Machine_Learning_Notes.pdf', size: '2.4 MB' },
    { id: '2', name: 'Chapter_5_Summary.pdf', size: '1.1 MB' },
    { id: '3', name: 'Research_Paper.pdf', size: '4.7 MB' },
  ])

  const [chatHistory] = useState<ChatHistory[]>([
    { id: '1', title: 'Biology Chapter Summary', date: 'Today' },
    { id: '2', title: 'Physics Practice Questions', date: 'Yesterday' },
    { id: '3', title: 'Math Flashcards', date: 'Mar 15' },
  ])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /* ---------------- FILE UPLOAD ---------------- */
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const fileId = crypto.randomUUID()

      const newFile: DocumentFile = {
        id: fileId,
        name: file.name,
        size: formatFileSize(file.size),
        progress: 0,
        isUploading: true,
      }

      setDocuments((prev) => [...prev, newFile])

      let progress = 0
      const interval = setInterval(() => {
        progress += 10

        if (progress >= 100) {
          clearInterval(interval)

          setDocuments((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? { ...f, progress: 100, isUploading: false }
                : f
            )
          )
        } else {
          setDocuments((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, progress } : f
            )
          )
        }
      }, 150)
    })

    e.target.value = ''
  }

  const handleSelectDocument = (id: string) => {
    setSelectedDocumentId(id === selectedDocumentId ? null : id)
  }

  const handleRemoveDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
    if (selectedDocumentId === id) setSelectedDocumentId(null)
  }

  const handleNewChat = () => setMessages([])
  const handleUploadClick = () => fileInputRef.current?.click()

  /* ---------------- 🚀 FIXED SEND MESSAGE ---------------- */
  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const res = await fetch('http://localhost:5000/upload/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: content }),
      })

      const data = await res.json()

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.answer || 'No response from AI',
        timestamp: new Date(),
        sources: [],
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      console.error('Error calling backend:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-dvh flex flex-col lg:flex-row bg-background overflow-hidden">

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-background">
        <span className="font-semibold">StudyMind</span>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} lg:block`}>
        <Sidebar
          apiKey={apiKey}
          setApiKey={setApiKey}
          documents={documents}
          selectedDocumentId={selectedDocumentId}
          onSelectDocument={handleSelectDocument}
          onRemoveDocument={handleRemoveDocument}
          onUploadClick={handleUploadClick}
          chatHistory={chatHistory}
          onNewChat={handleNewChat}
        />
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileInput}
        className="hidden"
        accept=".pdf,.txt"
      />

      {/* Chat Window */}
      <ChatWindow
        messages={messages}
        onSendMessage={handleSendMessage}
        onUploadClick={handleUploadClick}
        isLoading={isLoading}
        selectedDocumentName={
          documents.find((d) => d.id === selectedDocumentId)?.name
        }
      />
    </div>
  )
}

export default App