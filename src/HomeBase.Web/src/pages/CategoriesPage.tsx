import { useState, type FormEvent } from 'react'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../hooks/useCategories'
import { Spinner } from '../components/Spinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { Input } from '../components/Input'
import { Select } from '../components/Select'
import { getErrorMessage } from '../api/client'
import type { Category } from '../types'
import { Link } from 'react-router-dom'

export function CategoriesPage() {
  const { data: categories, isLoading, error, refetch } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const [showCreate, setShowCreate] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [formError, setFormError] = useState('')

  // Create/Edit form
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('')

  // Delete form
  const [reassignTo, setReassignTo] = useState('')

  function openCreate() {
    setName('')
    setIcon('')
    setFormError('')
    setShowCreate(true)
  }

  function openEdit(cat: Category) {
    setName(cat.name)
    setIcon(cat.icon)
    setFormError('')
    setEditingCategory(cat)
  }

  function openDelete(cat: Category) {
    setReassignTo('')
    setFormError('')
    setDeletingCategory(cat)
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setFormError('')
    try {
      await createCategory.mutateAsync({ name, icon: icon || undefined })
      setShowCreate(false)
    } catch (err) {
      setFormError(getErrorMessage(err))
    }
  }

  async function handleEdit(e: FormEvent) {
    e.preventDefault()
    if (!editingCategory) return
    setFormError('')
    try {
      await updateCategory.mutateAsync({
        id: editingCategory.id,
        data: { name, icon: icon || undefined },
      })
      setEditingCategory(null)
    } catch (err) {
      setFormError(getErrorMessage(err))
    }
  }

  async function handleDelete() {
    if (!deletingCategory) return
    if (deletingCategory.taskCount > 0 && !reassignTo) {
      setFormError('Please select a category to reassign tasks to')
      return
    }
    setFormError('')
    try {
      await deleteCategory.mutateAsync({
        id: deletingCategory.id,
        reassignTo,
      })
      setDeletingCategory(null)
    } catch (err) {
      setFormError(getErrorMessage(err))
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
    return <ErrorMessage message="Failed to load categories" onRetry={refetch} />
  }

  const otherCategories = (categories ?? []).filter((c) => c.id !== deletingCategory?.id)

  return (
    <div className="space-y-5">
      {/* Back header */}
      <div className="flex items-center gap-3">
        <Link
          to="/settings"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-edge bg-card transition-colors hover:bg-card-hover"
        >
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" stroke="currentColor" strokeWidth={2} fill="none">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-ink">Categories</h1>
      </div>

      <div className="mb-2.5 pl-0.5 text-[11px] font-bold uppercase tracking-[1.2px] text-ink-muted">
        Manage
      </div>

      {categories && categories.length === 0 && (
        <div className="rounded-[14px] border-2 border-dashed border-edge py-12 text-center">
          <span className="text-4xl">📁</span>
          <h3 className="mt-3 text-sm font-semibold text-ink">No categories yet</h3>
          <p className="mt-1 text-sm text-ink-muted">
            Create categories to organize your tasks.
          </p>
        </div>
      )}

      {categories && categories.length > 0 && (
        <div className="overflow-hidden rounded-[14px] border border-edge bg-card">
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              className={`flex items-center gap-3 px-4 py-3.5 ${
                i < categories.length - 1 ? 'border-b border-divider' : ''
              }`}
            >
              <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-done-dim text-base">
                {cat.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{cat.name}</p>
              </div>
              <span className="font-mono text-[13px] text-ink-muted">
                {cat.taskCount} task{cat.taskCount !== 1 ? 's' : ''}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(cat)}
                  title="Edit"
                  className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-card-hover hover:text-ink-sub"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => openDelete(cat)}
                  title="Delete"
                  className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-danger-dim hover:text-danger"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          {/* Add button row */}
          <button
            onClick={openCreate}
            className="flex w-full items-center justify-center gap-1.5 border-t border-divider py-3.5 text-sm font-semibold text-accent transition-colors hover:bg-card-hover"
          >
            <span>+</span> Add Category
          </button>
        </div>
      )}

      {categories && categories.length === 0 && (
        <Button onClick={openCreate} className="w-full">
          + Add Category
        </Button>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="New Category"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="create-category-form"
              isLoading={createCategory.isPending}
            >
              Create
            </Button>
          </>
        }
      >
        <form id="create-category-form" onSubmit={handleCreate} className="space-y-5">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Home"
            required
            autoFocus
          />
          <Input
            label="Icon"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="e.g., 🏠"
            hint="An emoji to represent this category"
          />
          {formError && (
            <p className="rounded-xl bg-danger-dim px-3 py-2 text-sm text-danger">{formError}</p>
          )}
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editingCategory !== null}
        onClose={() => setEditingCategory(null)}
        title="Edit Category"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingCategory(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-category-form"
              isLoading={updateCategory.isPending}
            >
              Save
            </Button>
          </>
        }
      >
        <form id="edit-category-form" onSubmit={handleEdit} className="space-y-5">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Home"
            required
            autoFocus
          />
          <Input
            label="Icon"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="e.g., 🏠"
          />
          {formError && (
            <p className="rounded-xl bg-danger-dim px-3 py-2 text-sm text-danger">{formError}</p>
          )}
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deletingCategory !== null}
        onClose={() => setDeletingCategory(null)}
        title="Delete Category"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeletingCategory(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleteCategory.isPending}
            >
              Delete
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <p className="text-sm text-ink-sub">
            Are you sure you want to delete <strong>{deletingCategory?.name}</strong>?
          </p>
          {deletingCategory && deletingCategory.taskCount > 0 && (
            <Select
              label={`Reassign ${deletingCategory.taskCount} task${deletingCategory.taskCount !== 1 ? 's' : ''} to`}
              options={otherCategories.map((c) => ({
                value: c.id,
                label: `${c.icon} ${c.name}`,
              }))}
              value={reassignTo}
              onChange={(e) => setReassignTo(e.target.value)}
              placeholder="Select a category"
              error={formError.includes('reassign') ? formError : undefined}
            />
          )}
          {formError && !formError.includes('reassign') && (
            <p className="rounded-xl bg-danger-dim px-3 py-2 text-sm text-danger">{formError}</p>
          )}
        </div>
      </Modal>
    </div>
  )
}
