import { Upload, FolderOpen } from 'lucide-react'
import FileItem from './FileItem'

interface DocumentFile {
  id: string
  name: string
  size?: string
  isUploading?: boolean
  progress?: number
}

interface DocumentSidebarSectionProps {
  documents: DocumentFile[]
  selectedDocumentId: string | null
  onSelectDocument: (id: string) => void
  onRemoveDocument: (id: string) => void
  onUploadClick: () => void
}

function DocumentSidebarSection({
  documents,
  selectedDocumentId,
  onSelectDocument,
  onRemoveDocument,
  onUploadClick,
}: DocumentSidebarSectionProps) {
  return (
    <div className="flex flex-col">
      {/* Section Header with Upload Button */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Documents
          </span>
        </div>
        <button
          onClick={onUploadClick}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload PDF
        </button>
      </div>

      {/* Documents List */}
      <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-2">
              <FolderOpen className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              No documents uploaded yet
            </p>
          </div>
        ) : (
          documents.map((doc) => (
            <FileItem
              key={doc.id}
              id={doc.id}
              name={doc.name}
              size={doc.size}
              isSelected={selectedDocumentId === doc.id}
              isUploading={doc.isUploading}
              progress={doc.progress}
              onSelect={onSelectDocument}
              onRemove={onRemoveDocument}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default DocumentSidebarSection
