import { Link } from 'react-router-dom'
import type { TaskDto } from '../types'
import { RecurrenceUnit, RecurrenceUnitLabels } from '../types'
import { Badge } from './Badge'

interface TaskCardProps {
  task: TaskDto
  onComplete?: (task: TaskDto) => void
  compact?: boolean
}

function formatDate(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function recurrenceShort(value: number, unit: RecurrenceUnit): string {
  const abbrev: Record<RecurrenceUnit, string> = {
    [RecurrenceUnit.Days]: 'D',
    [RecurrenceUnit.Weeks]: 'WK',
    [RecurrenceUnit.Months]: 'MO',
    [RecurrenceUnit.Years]: 'YR',
    [RecurrenceUnit.Miles]: 'K MI',
  }
  return `${value}${abbrev[unit] ?? RecurrenceUnitLabels[unit]}`
}

export function TaskCard({ task, onComplete, compact = false }: TaskCardProps) {
  const isCompletedOneTime = !task.isRecurring && task.lastCompletion && !task.nextDueDate

  const statusBadge = isCompletedOneTime ? (
    <Badge variant="success">Done</Badge>
  ) : task.isOverdue ? (
    <Badge variant="overdue">
      {task.daysOverdue != null ? `${task.daysOverdue}d overdue` : 'Overdue'}
    </Badge>
  ) : task.nextDueDate ? (
    <Badge variant="upcoming">Due {formatDate(task.nextDueDate)}</Badge>
  ) : null

  return (
    <div
      className={`group flex items-center gap-3 rounded-[14px] border border-edge bg-card p-3.5 transition-all hover:bg-card-hover active:scale-[0.98] ${
        task.isOverdue ? 'border-l-[3px] border-l-overdue-border' : ''
      }`}
    >
      {/* Icon */}
      <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] border border-edge-subtle bg-card text-[17px]">
        {task.icon}
      </span>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/tasks/${task.id}`}
            className="truncate text-sm font-semibold text-ink hover:text-accent"
          >
            {task.name}
          </Link>
          {statusBadge}
        </div>

        {!compact && (
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded bg-freq-bg px-1.5 py-0.5 font-mono text-[10px] font-semibold text-freq-text">
              {task.isRecurring && task.recurrenceValue != null && task.recurrenceUnit != null
                ? recurrenceShort(task.recurrenceValue, task.recurrenceUnit)
                : 'ONE-TIME'}
            </span>
            {task.lastCompletion && (
              <span className="text-ink-muted">
                Last: {formatDate(task.lastCompletion.completedAt)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Countdown + Complete */}
      <div className="flex shrink-0 items-center gap-2">
        {task.isOverdue && task.daysOverdue != null && (
          <span className="font-mono text-[13px] font-bold text-danger">
            -{task.daysOverdue}d
          </span>
        )}
        {onComplete && !isCompletedOneTime && (
          <button
            onClick={() => onComplete(task)}
            title="Mark complete"
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-accent-edge bg-accent-dim transition-colors hover:bg-accent-edge"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
              aria-hidden="true"
              style={{ color: 'var(--hb-accent)' }}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
