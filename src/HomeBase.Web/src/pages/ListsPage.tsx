import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLists, useCreateList } from '../hooks/useLists'
import { ListCard } from '../components/ListCard'
import { Spinner } from '../components/Spinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { PageHeader } from '../components/PageHeader'
import { CreateMenu } from '../components/CreateMenu'
import { Modal } from '../components/Modal'
import { Input } from '../components/Input'
import { Button } from '../components/Button'
import { getErrorMessage } from '../api/client'

export function ListsPage() {
  const navigate = useNavigate()
  const { data: lists, isLoading, error, refetch } = useLists()
  const createList = useCreateList()

  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('')
  const [formError, setFormError] = useState('')

  function resetForm() {
    setName('')
    setIcon('')
    setFormError('')
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setFormError('')
    try {
      await createList.mutateAsync({
        name,
        icon: icon || undefined,
      })
      setShowCreate(false)
      resetForm()
    } catch (err) {
      setFormError(getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="LISTS"
        actions={
          <CreateMenu
            onNewTask={() => navigate('/tasks')}
            onNewList={() => setShowCreate(true)}
          />
        }
      />

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {error && <ErrorMessage message="Failed to load lists" onRetry={refetch} />}

      {lists && lists.length === 0 && (
        <div className="rounded-[14px] border-2 border-dashed border-edge py-12 text-center">
          <span className="text-4xl">📝</span>
          <h3 className="mt-3 text-sm font-semibold text-ink">No lists yet</h3>
          <p className="mt-1 text-sm text-ink-muted">
            Create your first list to start tracking things.
          </p>
        </div>
      )}

      {lists && lists.length > 0 && (
        <div className="space-y-2">
          {lists.map((list) => (
            <ListCard key={list.id} list={list} />
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

      {/* Create List Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => { setShowCreate(false); resetForm() }}
        title="New List"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowCreate(false); resetForm() }}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="create-list-form"
              isLoading={createList.isPending}
            >
              + Create List
            </Button>
          </>
        }
      >
        <form id="create-list-form" onSubmit={handleCreate} className="space-y-5">
          <Input
            label="List Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Movies to Watch"
            required
            autoFocus
          />
          <Input
            label="Icon"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="e.g., 🎬"
            hint="An emoji to represent this list"
          />
          {formError && (
            <p className="rounded-xl bg-danger-dim px-3 py-2 text-sm text-danger">{formError}</p>
          )}
        </form>
      </Modal>
    </div>
  )
}
