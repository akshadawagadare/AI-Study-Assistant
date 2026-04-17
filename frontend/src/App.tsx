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

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)

  const [documents, setDocuments] = useState<DocumentFile[]>([])
  const [apiKey, setApiKey] = useState('') // ✅ FIX ADDED HERE

  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(bytes, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /* ---------------- FILE UPLOAD ---------------- */
  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      const fileId = crypto.randomUUID()

      setDocuments((prev) => [
        ...prev,
        {
          id: fileId,
          name: file.name,
          size: formatFileSize(file.size),
          progress: 0,
          isUploading: true,
        },
      ])

      try {
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("http://localhost:5000/upload", {
          method: "POST",
          body: formData,
        })

        const data = await res.json()

        console.log("Upload success:", data)

        setDocuments((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, progress: 100, isUploading: false }
              : f
          )
        )
      } catch (err) {
        console.error("Upload failed:", err)
      }
    }

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

  /* ---------------- ASK QUESTION ---------------- */
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
        body: JSON.stringify({
          question: content.trim(),
        }),
      })

      const data = await res.json()

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.answer || 'No response from AI',
        timestamp: new Date(),
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
          documents={documents}
          selectedDocumentId={selectedDocumentId}
          onSelectDocument={handleSelectDocument}
          onRemoveDocument={handleRemoveDocument}
          onUploadClick={handleUploadClick}
          chatHistory={[]}
          onNewChat={handleNewChat}
          apiKey={apiKey}          // ✅ FIX
          setApiKey={setApiKey}    // ✅ FIX
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