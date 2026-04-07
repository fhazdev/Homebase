import { useState, type FormEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  useTask,
  useUpdateTask,
  useDeleteTask,
  useCompleteTask,
  useDeleteCompletion,
} from '../hooks/useTasks'
import { useCategories } from '../hooks/useCategories'
import { Spinner } from '../components/Spinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { Input } from '../components/Input'
import { Select } from '../components/Select'
import { getErrorMessage } from '../api/client'
import { RecurrenceUnit, RecurrenceUnitLabels } from '../types'

function formatDate(iso?: string): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: task, isLoading, error, refetch } = useTask(id!)
  const { data: categories } = useCategories()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const completeTask = useCompleteTask()
  const deleteCompletion = useDeleteCompletion()

  const [showEdit, setShowEdit] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [formError, setFormError] = useState('')

  // Complete form
  const [completeNotes, setCompleteNotes] = useState('')
  const [completeDate, setCompleteDate] = useState('')

  // Edit form
  const [editIsRecurring, setEditIsRecurring] = useState(true)
  const [editName, setEditName] = useState('')
  const [editIcon, setEditIcon] = useState('')
  const [editRecurrenceValue, setEditRecurrenceValue] = useState('')
  const [editRecurrenceUnit, setEditRecurrenceUnit] = useState('')
  const [editCategoryId, setEditCategoryId] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editFirstDueDate, setEditFirstDueDate] = useState('')

  function openEdit() {
    if (!task) return
    setEditIsRecurring(task.isRecurring)
    setEditName(task.name)
    setEditIcon(task.icon)
    setEditRecurrenceValue(String(task.recurrenceValue ?? 1))
    setEditRecurrenceUnit(String(task.recurrenceUnit ?? RecurrenceUnit.Weeks))
    setEditCategoryId(task.categoryId)
    setEditNotes(task.notes ?? '')
    setEditFirstDueDate(task.firstDueDate ? task.firstDueDate.split('T')[0] : '')
    setFormError('')
    setShowEdit(true)
  }

  async function handleEdit(e: FormEvent) {
    e.preventDefault()
    setFormError('')
    try {
      await updateTask.mutateAsync({
        id: id!,
        data: {
          name: editName,
          icon: editIcon || undefined,
          recurrenceValue: editIsRecurring ? Number(editRecurrenceValue) : undefined,
          recurrenceUnit: editIsRecurring ? (Number(editRecurrenceUnit) as RecurrenceUnit) : undefined,
          isRecurring: editIsRecurring,
          categoryId: editCategoryId,
          notes: editNotes || undefined,
          firstDueDate: editFirstDueDate || undefined,
        },
      })
      setShowEdit(false)
    } catch (err) {
      setFormError(getErrorMessage(err))
    }
  }

  async function handleComplete(e: FormEvent) {
    e.preventDefault()
    setFormError('')
    try {
      await completeTask.mutateAsync({
        id: id!,
        data: {
          completedAt: completeDate || undefined,
          notes: completeNotes || undefined,
        },
      })
      setShowComplete(false)
      setCompleteNotes('')
      setCompleteDate('')
    } catch (err) {
      setFormError(getErrorMessage(err))
    }
  }

  async function handleDelete() {
    try {
      await deleteTask.mutateAsync(id!)
      navigate('/tasks', { replace: true })
    } catch (err) {
      setFormError(getErrorMessage(err))
    }
  }

  async function handleDeleteCompletion(logId: string) {
    try {
      await deleteCompletion.mutateAsync({ taskId: id!, logId })
    } catch {
      // Silently handled by React Query
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <ErrorMessage message="Failed to load task" onRetry={refetch} />
  }

  if (!task) return null

  const recurrenceOptions = Object.entries(RecurrenceUnitLabels).map(([value, label]) => ({
    value: Number(value),
    label,
  }))

  const categoryOptions = (categories ?? []).map((c) => ({
    value: c.id,
    label: `${c.icon} ${c.name}`,
  }))

  return (
    <div className="space-y-6">
      {/* Back header */}
      <div className="flex items-center gap-3">
        <Link
          to="/tasks"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-edge bg-card transition-colors hover:bg-card-hover"
        >
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" stroke="currentColor" strokeWidth={2} fill="none">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-ink">Task Detail</h1>
        <div className="ml-auto">
          <button
            onClick={openEdit}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-edge bg-card transition-colors hover:bg-card-hover"
          >
            <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" stroke="currentColor" strokeWidth={2} fill="none">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="text-center">
        <span className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-[18px] border border-edge bg-card text-[30px]">
          {task.icon}
        </span>
        <h2 className="text-[22px] font-bold text-ink">{task.name}</h2>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[1px] text-ink-muted">
          {task.categoryName ?? 'Uncategorized'}
        </p>
        {!task.isRecurring && task.completions.length > 0 && !task.nextDueDate ? (
          <div className="mt-2">
            <Badge variant="success">Done</Badge>
          </div>
        ) : task.isOverdue ? (
          <div className="mt-2">
            <Badge variant="overdue">
              {task.daysOverdue != null ? `${task.daysOverdue}d overdue` : 'Overdue'}
            </Badge>
          </div>
        ) : null}
      </div>

      {/* Stats row */}
      <div className="flex gap-2">
        <div className="flex-1 rounded-[14px] border border-edge bg-card py-3.5 text-center">
          <div className={`font-mono text-lg font-bold ${
            !task.isRecurring && task.completions.length > 0 && !task.nextDueDate
              ? 'text-done'
              : task.isOverdue ? 'text-danger' : 'text-accent'
          }`}>
            {!task.isRecurring && task.completions.length > 0 && !task.nextDueDate
              ? '✓'
              : task.isOverdue && task.daysOverdue != null
                ? `-${task.daysOverdue}d`
                : task.nextDueDate
                  ? `${Math.max(0, Math.ceil((new Date(task.nextDueDate).getTime() - Date.now()) / 86_400_000))}d`
                  : '—'}
          </div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Status</div>
        </div>
        <div className="flex-1 rounded-[14px] border border-edge bg-card py-3.5 text-center">
          <div className="font-mono text-lg font-bold text-ink">
            {task.isRecurring && task.recurrenceValue != null && task.recurrenceUnit != null
              ? `${task.recurrenceValue}${RecurrenceUnitLabels[task.recurrenceUnit]?.charAt(0).toLowerCase() ?? ''}`
              : '1×'}
          </div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
            {task.isRecurring ? 'Interval' : 'One-time'}
          </div>
        </div>
        <div className="flex-1 rounded-[14px] border border-edge bg-card py-3.5 text-center">
          <div className="font-mono text-lg font-bold text-accent">{task.completions.length}</div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Done</div>
        </div>
      </div>

      {/* Details card */}
      <div>
        <div className="mb-2.5 text-[12px] font-bold uppercase tracking-[1.5px] text-ink-muted">Details</div>
        <div className="overflow-hidden rounded-[14px] border border-edge bg-card">
          {[
            { label: 'Last Completed', value: task.completions[0] ? formatDate(task.completions[0].completedAt) : '—' },
            { label: 'Next Due', value: !task.isRecurring && task.completions.length > 0 && !task.nextDueDate ? 'Complete' : formatDate(task.nextDueDate), isDanger: task.isOverdue },
            { label: 'Recurrence', value: task.isRecurring && task.recurrenceValue != null && task.recurrenceUnit != null
                ? `Every ${task.recurrenceValue} ${task.recurrenceValue === 1 ? RecurrenceUnitLabels[task.recurrenceUnit].slice(0, -1) : RecurrenceUnitLabels[task.recurrenceUnit]}`
                : 'One-time' },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between border-b border-divider px-4 py-3.5 last:border-b-0">
              <span className="text-[13px] font-medium text-ink-muted">{row.label}</span>
              <span className={`font-mono text-[13px] font-semibold ${row.isDanger ? 'text-danger' : 'text-ink'}`}>
                {row.value}
              </span>
            </div>
          ))}
          {task.notes && (
            <div className="border-t border-divider px-4 py-3.5">
              <span className="text-[13px] font-medium text-ink-muted">Notes</span>
              <p className="mt-1 text-[13px] text-ink-sub">{task.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Completion History */}
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <div className="text-[12px] font-bold uppercase tracking-[1.5px] text-ink-muted">
            Completion History
          </div>
          {task.completions.length > 0 && (
            <span className="rounded-md border border-[rgba(93,217,160,0.2)] bg-done-dim px-2.5 py-1 font-mono text-[10px] font-bold text-done">
              {task.completions.length} TOTAL
            </span>
          )}
        </div>
        {task.completions.length === 0 ? (
          <p className="text-sm text-ink-muted">No completions yet.</p>
        ) : (
          <div className="relative pl-[22px]">
            {/* Timeline line */}
            <div className="absolute left-[6px] top-2 bottom-2 w-0.5 bg-divider" />
            {task.completions.map((log) => (
              <div key={log.id} className="relative flex gap-3.5 pb-[18px] last:pb-0">
                {/* Timeline dot */}
                <div className="absolute -left-[19px] top-[5px] h-2.5 w-2.5 rounded-full border-2 border-ground bg-done" />
                <div className="flex-1">
                  <div className="font-mono text-xs font-semibold text-ink-sub">
                    {formatDateTime(log.completedAt)}
                  </div>
                  {log.notes && <p className="mt-0.5 text-xs text-ink-muted">{log.notes}</p>}
                </div>
                <button
                  onClick={() => handleDeleteCompletion(log.id)}
                  title="Delete completion"
                  className="shrink-0 rounded-full p-1.5 text-ink-muted transition-colors hover:bg-danger-dim hover:text-danger"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Primary action button — hidden for completed one-time tasks */}
      {!((!task.isRecurring) && task.completions.length > 0 && !task.nextDueDate) && (
        <button
          onClick={() => setShowComplete(true)}
          className="w-full rounded-[14px] bg-solid py-[15px] font-mono text-sm font-bold uppercase tracking-wider text-solid-fg transition-all hover:opacity-90 active:scale-[0.98]"
        >
          ✓ Log Completion
        </button>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button variant="secondary" onClick={openEdit} className="flex-1">
          Edit
        </Button>
        <Button variant="danger" onClick={() => setShowDeleteConfirm(true)} className="flex-1">
          Delete
        </Button>
      </div>

      {/* Complete Modal */}
      <Modal
        isOpen={showComplete}
        onClose={() => setShowComplete(false)}
        title="Mark Complete"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowComplete(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="complete-form"
              isLoading={completeTask.isPending}
            >
              Complete
            </Button>
          </>
        }
      >
        <form id="complete-form" onSubmit={handleComplete} className="space-y-5">
          <Input
            label="Completion Date"
            type="datetime-local"
            value={completeDate}
            onChange={(e) => setCompleteDate(e.target.value)}
            hint="Leave blank for now"
          />
          <Input
            label="Notes"
            value={completeNotes}
            onChange={(e) => setCompleteNotes(e.target.value)}
            placeholder="Any notes about this completion"
          />
          {formError && (
            <p className="rounded-xl bg-danger-dim px-3 py-2 text-sm text-danger">{formError}</p>
          )}
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit Task"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEdit(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-form"
              isLoading={updateTask.isPending}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <form id="edit-form" onSubmit={handleEdit} className="space-y-5">
          {/* Recurring / One-time toggle */}
          <div>
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[1px] text-ink-muted">Type</div>
            <div className="flex rounded-xl bg-card p-1">
              <button
                type="button"
                onClick={() => setEditIsRecurring(true)}
                className={`flex-1 rounded-[10px] py-2 text-[13px] font-semibold transition-colors ${
                  editIsRecurring ? 'bg-ground text-ink shadow-sm' : 'text-ink-muted'
                }`}
              >
                Recurring
              </button>
              <button
                type="button"
                onClick={() => setEditIsRecurring(false)}
                className={`flex-1 rounded-[10px] py-2 text-[13px] font-semibold transition-colors ${
                  !editIsRecurring ? 'bg-ground text-ink shadow-sm' : 'text-ink-muted'
                }`}
              >
                One-time
              </button>
            </div>
          </div>
          <Input
            label="Task Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />
          <Input
            label="Icon"
            value={editIcon}
            onChange={(e) => setEditIcon(e.target.value)}
            placeholder="e.g., 🔧"
          />
          {editIsRecurring && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Every"
                type="number"
                min="1"
                value={editRecurrenceValue}
                onChange={(e) => setEditRecurrenceValue(e.target.value)}
                required
              />
              <Select
                label="Unit"
                options={recurrenceOptions}
                value={editRecurrenceUnit}
                onChange={(e) => setEditRecurrenceUnit(e.target.value)}
              />
            </div>
          )}
          <Select
            label="Category"
            options={categoryOptions}
            value={editCategoryId}
            onChange={(e) => setEditCategoryId(e.target.value)}
            placeholder="Select a category"
          />
          <Input
            label={editIsRecurring ? 'First Due Date' : 'Due Date'}
            type="date"
            value={editFirstDueDate}
            onChange={(e) => setEditFirstDueDate(e.target.value)}
            hint={editIsRecurring ? 'When the task is first due (optional)' : undefined}
            required={!editIsRecurring}
          />
          <Input
            label="Notes"
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            placeholder="Any additional notes"
          />
          {formError && (
            <p className="rounded-xl bg-danger-dim px-3 py-2 text-sm text-danger">{formError}</p>
          )}
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Task"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleteTask.isPending}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-sub">
          Are you sure you want to delete <strong>{task.name}</strong>? This will also remove all
          completion history. This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
