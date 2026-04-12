import { FileText, X } from 'lucide-react'

interface FileItemProps {
  id: string
  name: string
  size?: string
  isSelected?: boolean
  isUploading?: boolean
  progress?: number
  onSelect?: (id: string) => void
  onRemove?: (id: string) => void
}

function FileItem({
  id,
  name,
  size,
  isSelected,
  isUploading,
  progress,
  onSelect,
  onRemove,
}: FileItemProps) {
  const isPdf = name.toLowerCase().endsWith('.pdf')

  return (
    <div
      onClick={() => onSelect?.(id)}
      className={`
        flex flex-col p-2.5 rounded-lg cursor-pointer group transition-all duration-200
        ${isSelected 
          ? 'bg-primary/10 border border-primary/50' 
          : 'bg-secondary border border-border hover:border-primary/30 hover:bg-secondary/80'
        }
      `}
    >
      <div className="flex items-center gap-2.5">
        <div className={`
          w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
          ${isPdf ? 'bg-red-500/10' : 'bg-primary/10'}
        `}>
          <FileText className={`w-4 h-4 ${isPdf ? 'text-red-400' : 'text-primary'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm truncate ${isSelected ? 'text-foreground font-medium' : 'text-foreground'}`}>
            {name}
          </p>
          {size && (
            <p className="text-xs text-muted-foreground">{size}</p>
          )}
        </div>
        {!isUploading && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove(id)
            }}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {isUploading && progress !== undefined && (
        <div className="mt-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Uploading...</span>
            <span className="text-xs text-primary font-medium">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default FileItem
