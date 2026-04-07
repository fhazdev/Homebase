import { Link } from 'react-router-dom'
import type { UserListDto } from '../types'

interface ListCardProps {
  list: UserListDto
}

export function ListCard({ list }: ListCardProps) {
  const progress = list.itemCount > 0
    ? `${list.completedCount}/${list.itemCount}`
    : 'Empty'

  return (
    <Link
      to={`/lists/${list.id}`}
      className="group flex items-center gap-3 rounded-[14px] border border-edge bg-card p-3.5 transition-all hover:bg-card-hover active:scale-[0.98]"
    >
      {/* Icon */}
      <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] border border-edge-subtle bg-card text-[17px]">
        {list.icon}
      </span>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-ink">{list.name}</div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-muted">
          <span>{list.itemCount} {list.itemCount === 1 ? 'item' : 'items'}</span>
          {list.completedCount > 0 && (
            <>
              <span className="text-ink-muted/40">·</span>
              <span className="text-done">{list.completedCount} done</span>
            </>
          )}
        </div>
      </div>

      {/* Progress badge */}
      <span className="shrink-0 rounded-md border border-edge-subtle px-2 py-0.5 font-mono text-[10px] font-bold text-ink-muted">
        {progress}
      </span>
    </Link>
  )
}
