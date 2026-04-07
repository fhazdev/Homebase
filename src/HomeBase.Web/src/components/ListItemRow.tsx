import type { ListItemDto } from '../types'

interface ListItemRowProps {
  item: ListItemDto
  isExpanded: boolean
  onToggle: () => void
  onToggleComplete: () => void
  onDelete: () => void
  onEdit: () => void
}

export function ListItemRow({
  item,
  isExpanded,
  onToggle,
  onToggleComplete,
  onDelete,
  onEdit,
}: ListItemRowProps) {
  const hasDetails = item.url || item.phone || item.details

  return (
    <div className="overflow-hidden rounded-[14px] border border-edge bg-card transition-all">
      {/* Main row */}
      <div className="flex items-center gap-3 p-3.5">
        {/* Checkbox */}
        <button
          onClick={onToggleComplete}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
            item.isCompleted
              ? 'border-done bg-done'
              : 'border-edge-input hover:border-accent'
          }`}
        >
          {item.isCompleted && (
            <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>

        {/* Title — clickable to expand */}
        <button
          onClick={onToggle}
          className="min-w-0 flex-1 text-left"
          disabled={!hasDetails}
        >
          <span className={`text-sm font-semibold ${item.isCompleted ? 'text-ink-muted line-through' : 'text-ink'}`}>
            {item.title}
          </span>
        </button>

        {/* Chevron (only if has details) */}
        {hasDetails && (
          <button onClick={onToggle} className="shrink-0 p-1 text-ink-muted transition-transform">
            <svg
              className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
      </div>

      {/* Expanded details */}
      {isExpanded && hasDetails && (
        <div className="border-t border-divider px-3.5 py-3 space-y-2">
          {item.url && (
            <div className="flex items-start gap-2">
              <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
              </svg>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-xs font-medium text-accent hover:underline"
              >
                {item.url}
              </a>
            </div>
          )}
          {item.phone && (
            <div className="flex items-center gap-2">
              <svg className="h-3.5 w-3.5 shrink-0 text-ink-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
              <a href={`tel:${item.phone}`} className="text-xs font-medium text-accent hover:underline">
                {item.phone}
              </a>
            </div>
          )}
          {item.details && (
            <div className="flex items-start gap-2">
              <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <p className="text-xs text-ink-sub">{item.details}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onEdit}
              className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-ink-muted transition-colors hover:bg-card-hover hover:text-ink"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-ink-muted transition-colors hover:bg-danger-dim hover:text-danger"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
