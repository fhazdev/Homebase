import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTasks, useCreateTask, useCompleteTask } from '../hooks/useTasks'
import { useCategories } from '../hooks/useCategories'
import { TaskCard } from '../components/TaskCard'
import { Spinner } from '../components/Spinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { PageHeader } from '../components/PageHeader'
import { Modal } from '../components/Modal'
import { Input } from '../components/Input'
import { Select } from '../components/Select'
import { Button } from '../components/Button'
import { CreateMenu } from '../components/CreateMenu'
import { getErrorMessage } from '../api/client'
import { RecurrenceUnit, RecurrenceUnitLabels, type TaskDto } from '../types'

const recurrenceOptions = Object.entries(RecurrenceUnitLabels).map(([value, label]) => ({
  value: Number(value),
  label,
}))

export function TasksPage() {
  const navigate = useNavigate()
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [showCreate, setShowCreate] = useState(false)

  const { data: tasks, isLoading, error, refetch } = useTasks(categoryFilter || undefined)
  const { data: categories } = useCategories()
  const completeTask = useCompleteTask()
  const createTask = useCreateTask()

  // Create form state
  const [isRecurring, setIsRecurring] = useState(true)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('')
  const [recurrenceValue, setRecurrenceValue] = useState('1')
  const [recurrenceUnit, setRecurrenceUnit] = useState<string>(String(RecurrenceUnit.Weeks))
  const [categoryId, setCategoryId] = useState('')
  const [notes, setNotes] = useState('')
  const [firstDueDate, setFirstDueDate] = useState('')
  const [formError, setFormError] = useState('')

  function handleComplete(task: TaskDto) {
    completeTask.mutate({ id: task.id, data: {} })
  }

  function resetForm() {
    setIsRecurring(true)
    setName('')
    setIcon('')
    setRecurrenceValue('1')
    setRecurrenceUnit(String(RecurrenceUnit.Weeks))
    setCategoryId('')
    setNotes('')
    setFirstDueDate('')
    setFormError('')
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setFormError('')

    if (!categoryId) {
      setFormError('Please select a category')
      return
    }

    try {
      await createTask.mutateAsync({
        name,
        icon: icon || undefined,
        recurrenceValue: isRecurring ? Number(recurrenceValue) : undefined,
        recurrenceUnit: isRecurring ? (Number(recurrenceUnit) as RecurrenceUnit) : undefined,
        categoryId,
        notes: notes || undefined,
        firstDueDate: firstDueDate || undefined,
      })
      setShowCreate(false)
      resetForm()
    } catch (err) {
      setFormError(getErrorMessage(err))
    }
  }

  const categoryOptions = (categories ?? []).map((c) => ({
    value: c.id,
    label: `${c.icon} ${c.name}`,
  }))

  const filterOptions = [{ value: '', label: 'All' }, ...categoryOptions]

  return (
    <div className="space-y-5">
      <PageHeader
        title="ALL TASKS"
        actions={
          <CreateMenu
            onNewTask={() => setShowCreate(true)}
            onNewList={() => navigate('/lists')}
          />
        }
      />

      {/* Category filter chips */}
      {categoryOptions.length > 0 && (
        <div className="scrollbar-hide flex gap-[7px] overflow-x-auto pb-1">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setCategoryFilter(String(opt.value))}
              className={`shrink-0 rounded-full border px-[15px] py-[7px] text-xs font-semibold transition-colors ${
                categoryFilter === String(opt.value)
                  ? 'border-chip-active-edge bg-chip-active text-chip-active-text'
                  : 'border-chip-edge bg-chip text-chip-text'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Task list */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {error && <ErrorMessage message="Failed to load tasks" onRetry={refetch} />}

      {tasks && tasks.length === 0 && (
        <div className="rounded-[14px] border-2 border-dashed border-edge py-12 text-center">
          <span className="text-4xl">📋</span>
          <h3 className="mt-3 text-sm font-semibold text-ink">No tasks found</h3>
          <p className="mt-1 text-sm text-ink-muted">
            {categoryFilter ? 'Try a different category filter.' : 'Create your first task to get started.'}
          </p>
        </div>
      )}

      {tasks && tasks.length > 0 && (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onComplete={handleComplete} />
          ))}
        </div>
      )}

      {/* FAB - visible on mobile */}
      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-[98px] right-[22px] z-30 flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-solid shadow-[0_6px_20px_rgba(0,0,0,0.25)] transition-transform hover:scale-105 active:scale-95 sm:hidden"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-solid-fg">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      </button>

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => {
          setShowCreate(false)
          resetForm()
        }}
        title="New Task"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowCreate(false); resetForm() }}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="create-task-form"
              isLoading={createTask.isPending}
            >
              + Create Task
            </Button>
          </>
        }
      >
        <form id="create-task-form" onSubmit={handleCreate} className="space-y-5">
          {/* Recurring / One-time toggle */}
          <div>
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[1px] text-ink-muted">Type</div>
            <div className="flex rounded-xl bg-card p-1">
              <button
                type="button"
                onClick={() => setIsRecurring(true)}
                className={`flex-1 rounded-[10px] py-2 text-[13px] font-semibold transition-colors ${
                  isRecurring ? 'bg-ground text-ink shadow-sm' : 'text-ink-muted'
                }`}
              >
                Recurring
              </button>
              <button
                type="button"
                onClick={() => setIsRecurring(false)}
                className={`flex-1 rounded-[10px] py-2 text-[13px] font-semibold transition-colors ${
                  !isRecurring ? 'bg-ground text-ink shadow-sm' : 'text-ink-muted'
                }`}
              >
                One-time
              </button>
            </div>
          </div>
          <Input
            label="Task Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isRecurring ? 'e.g. Water Filter Replacement' : 'e.g. File taxes'}
            required
            autoFocus
          />
          <Input
            label="Icon"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="e.g., 🔧"
            hint="An emoji to represent this task"
          />
          {isRecurring && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Every"
                type="number"
                min="1"
                value={recurrenceValue}
                onChange={(e) => setRecurrenceValue(e.target.value)}
                required
              />
              <Select
                label="Unit"
                options={recurrenceOptions}
                value={recurrenceUnit}
                onChange={(e) => setRecurrenceUnit(e.target.value)}
              />
            </div>
          )}
          <Select
            label="Category"
            options={categoryOptions}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            placeholder="Select a category"
            error={!categoryId && formError.includes('category') ? formError : undefined}
          />
          <Input
            label={isRecurring ? 'First Due Date' : 'Due Date'}
            type="date"
            value={firstDueDate}
            onChange={(e) => setFirstDueDate(e.target.value)}
            hint={isRecurring ? 'When the task is first due (optional)' : undefined}
            required={!isRecurring}
          />
          <Input
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Filter model, purchase link, tips..."
          />
          {formError && !formError.includes('category') && (
            <p className="rounded-xl bg-danger-dim px-3 py-2 text-sm text-danger">{formError}</p>
          )}
        </form>
      </Modal>
    </div>
  )
}
