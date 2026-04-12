import { useState } from 'react'
import { Key, Eye, EyeOff, Sparkles, MessageSquare, Plus } from 'lucide-react'
import DocumentSidebarSection from './DocumentSidebarSection'

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

interface SidebarProps {
  apiKey: string
  setApiKey: (key: string) => void
  documents: DocumentFile[]
  selectedDocumentId: string | null
  onSelectDocument: (id: string) => void
  onRemoveDocument: (id: string) => void
  onUploadClick: () => void
  chatHistory: ChatHistory[]
  onNewChat: () => void
}

function Sidebar({
  apiKey,
  setApiKey,
  documents,
  selectedDocumentId,
  onSelectDocument,
  onRemoveDocument,
  onUploadClick,
  chatHistory,
  onNewChat,
}: SidebarProps) {
  const [showApiKey, setShowApiKey] = useState(false)

  return (
    <aside className="w-full lg:w-[280px] h-full flex-shrink-0 bg-card border-r border-border flex flex-col overflow-hidden">
      {/* Logo & New Chat */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground">StudyMind</span>
          </div>
        </div>
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="mb-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
            Recent Chats
          </span>
        </div>
        <div className="space-y-1">
          {chatHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground px-2 py-4 text-center">
              No chat history yet
            </p>
          ) : (
            chatHistory.map((chat) => (
              <button
                key={chat.id}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary text-left transition-colors group"
              >
                <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{chat.title}</p>
                  <p className="text-xs text-muted-foreground">{chat.date}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Documents Section */}
      <div className="border-t border-border p-3">
        <DocumentSidebarSection
          documents={documents}
          selectedDocumentId={selectedDocumentId}
          onSelectDocument={onSelectDocument}
          onRemoveDocument={onRemoveDocument}
          onUploadClick={onUploadClick}
        />
      </div>

      {/* API Key Section */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 mb-2 px-2">
          <Key className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            API Key
          </span>
          {apiKey && (
            <div className="ml-auto flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">Connected</span>
            </div>
          )}
        </div>
        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter API key..."
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 pr-9"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
