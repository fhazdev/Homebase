import { useDashboard } from '../hooks/useDashboard'
import { useCompleteTask } from '../hooks/useTasks'
import { TaskCard } from '../components/TaskCard'
import { Spinner } from '../components/Spinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { PageHeader } from '../components/PageHeader'
import { Link } from 'react-router-dom'
import type { TaskDto } from '../types'

function formatRelative(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHr = Math.floor(diffMs / 3_600_000)
  const diffDay = Math.floor(diffMs / 86_400_000)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  return `${diffDay}d ago`
}

export function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboard()
  const completeTask = useCompleteTask()

  function handleComplete(task: TaskDto) {
    completeTask.mutate({ id: task.id, data: {} })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <ErrorMessage message="Failed to load dashboard" onRetry={refetch} />
  }

  if (!data) return null

  const hasOverdue = data.overdueTasks.length > 0
  const hasUpcoming = data.upcomingTasks.length > 0
  const hasRecent = data.recentCompletions.length > 0
  const isEmpty = !hasOverdue && !hasUpcoming && !hasRecent

  return (
    <div className="space-y-6">
      <PageHeader title="HOMEBASE" />

      {isEmpty && (
        <div className="rounded-[14px] border-2 border-dashed border-edge py-12 text-center">
          <span className="text-4xl">📋</span>
          <h3 className="mt-3 text-sm font-semibold text-ink">No tasks yet</h3>
          <p className="mt-1 text-sm text-ink-muted">Create your first tracked task to get started.</p>
          <Link
            to="/tasks"
            className="mt-4 inline-flex items-center rounded-[10px] bg-solid px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-solid-fg"
          >
            Go to Tasks
          </Link>
        </div>
      )}

      {/* Overdue tasks */}
      {hasOverdue && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[12px] font-bold uppercase tracking-[1.5px] text-ink-muted">
              Needs Attention
            </div>
            <span className="rounded-md border border-danger-edge bg-danger-dim px-2.5 py-1 font-mono text-[10px] font-bold text-danger">
              {data.overdueTasks.length} OVERDUE
            </span>
          </div>
          <div className="space-y-2">
            {data.overdueTasks.map((task) => (
              <TaskCard key={task.id} task={task} onComplete={handleComplete} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming tasks */}
      {hasUpcoming && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[12px] font-bold uppercase tracking-[1.5px] text-ink-muted">
              Coming Up
            </div>
            <span className="rounded-md border border-info-edge bg-info-dim px-2.5 py-1 font-mono text-[10px] font-bold text-info">
              UPCOMING
            </span>
          </div>
          <div className="space-y-2">
            {data.upcomingTasks.map((task) => (
              <TaskCard key={task.id} task={task} onComplete={handleComplete} />
            ))}
          </div>
        </section>
      )}

      {/* Recent completions */}
      {hasRecent && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[12px] font-bold uppercase tracking-[1.5px] text-ink-muted">
              Recently Done
            </div>
          </div>
          <div>
            {data.recentCompletions.map((rc) => (
              <Link
                key={`${rc.taskId}-${rc.completedAt}`}
                to={`/tasks/${rc.taskId}`}
                className="flex items-center gap-3 border-b border-edge-subtle py-3 last:border-b-0"
              >
                <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-done-dim">
                  <svg viewBox="0 0 24 24" className="h-[13px] w-[13px]" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ color: 'var(--hb-done)' }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink-muted">{rc.taskName}</p>
                  {rc.notes && (
                    <p className="truncate text-[11px] text-ink-muted opacity-70">{rc.notes}</p>
                  )}
                </div>
                <span className="shrink-0 text-[11px] text-ink-muted opacity-70">
                  {formatRelative(rc.completedAt)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
