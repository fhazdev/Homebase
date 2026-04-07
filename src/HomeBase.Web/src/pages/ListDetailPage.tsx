import { useState, type FormEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  useList,
  useUpdateList,
  useDeleteList,
  useAddListItem,
  useUpdateListItem,
  useDeleteListItem,
} from '../hooks/useLists'
import { Spinner } from '../components/Spinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { ListItemRow } from '../components/ListItemRow'
import { Modal } from '../components/Modal'
import { Input } from '../components/Input'
import { Button } from '../components/Button'
import { getErrorMessage } from '../api/client'

export function ListDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: list, isLoading, error, refetch } = useList(id!)
  const updateList = useUpdateList()
  const deleteList = useDeleteList()
  const addItem = useAddListItem()
  const updateItem = useUpdateListItem()
  const deleteItem = useDeleteListItem()

  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)
  const [showEditList, setShowEditList] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)
  const [showEditItem, setShowEditItem] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [formError, setFormError] = useState('')

  // Edit list form
  const [editName, setEditName] = useState('')
  const [editIcon, setEditIcon] = useState('')

  // Add/Edit item form
  const [itemTitle, setItemTitle] = useState('')
  const [itemUrl, setItemUrl] = useState('')
  const [itemPhone, setItemPhone] = useState('')
  const [itemDetails, setItemDetails] = useState('')

  function openEditList() {
    if (!list) return
    setEditName(list.name)
    setEditIcon(list.icon)
    setFormError('')
    setShowEditList(true)
  }

  function resetItemForm() {
    setItemTitle('')
    setItemUrl('')
    setItemPhone('')
    setItemDetails('')
    setFormError('')
    setEditingItemId(null)
  }

  function openEditItem(itemId: string) {
    if (!list) return
    const item = list.items.find((i) => i.id === itemId)
    if (!item) return
    setItemTitle(item.title)
    setItemUrl(item.url ?? '')
    setItemPhone(item.phone ?? '')
    setItemDetails(item.details ?? '')
    setEditingItemId(itemId)
    setFormError('')
    setShowEditItem(true)
  }

  async function handleEditList(e: FormEvent) {
    e.preventDefault()
    setFormError('')
    try {
      await updateList.mutateAsync({
        id: id!,
        data: { name: editName, icon: editIcon || undefined },
      })
      setShowEditList(false)
    } catch (err) {
      setFormError(getErrorMessage(err))
    }
  }

  async function handleDeleteList() {
    try {
      await deleteList.mutateAsync(id!)
      navigate('/lists', { replace: true })
    } catch (err) {
      setFormError(getErrorMessage(err))
    }
  }

  async function handleAddItem(e: FormEvent) {
    e.preventDefault()
    setFormError('')
    try {
      await addItem.mutateAsync({
        listId: id!,
        data: {
          title: itemTitle,
          url: itemUrl || undefined,
          phone: itemPhone || undefined,
          details: itemDetails || undefined,
        },
      })
      setShowAddItem(false)
      resetItemForm()
    } catch (err) {
      setFormError(getErrorMessage(err))
    }
  }

  async function handleEditItem(e: FormEvent) {
    e.preventDefault()
    if (!editingItemId) return
    setFormError('')
    try {
      await updateItem.mutateAsync({
        listId: id!,
        itemId: editingItemId,
        data: {
          title: itemTitle,
          url: itemUrl || undefined,
          phone: itemPhone || undefined,
          details: itemDetails || undefined,
        },
      })
      setShowEditItem(false)
      resetItemForm()
    } catch (err) {
      setFormError(getErrorMessage(err))
    }
  }

  function handleToggleComplete(itemId: string, currentState: boolean) {
    updateItem.mutate({
      listId: id!,
      itemId,
      data: { isCompleted: !currentState },
    })
  }

  function handleDeleteItem(itemId: string) {
    deleteItem.mutate({ listId: id!, itemId })
    if (expandedItemId === itemId) setExpandedItemId(null)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <ErrorMessage message="Failed to load list" onRetry={refetch} />
  }

  if (!list) return null

  const completedCount = list.items.filter((i) => i.isCompleted).length

  return (
    <div className="space-y-6">
      {/* Back header */}
      <div className="flex items-center gap-3">
        <Link
          to="/lists"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-edge bg-card transition-colors hover:bg-card-hover"
        >
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" stroke="currentColor" strokeWidth={2} fill="none">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-ink">List Detail</h1>
        <div className="ml-auto">
          <button
            onClick={openEditList}
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
          {list.icon}
        </span>
        <h2 className="text-[22px] font-bold text-ink">{list.name}</h2>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[1px] text-ink-muted">
          {list.items.length} {list.items.length === 1 ? 'item' : 'items'}
          {completedCount > 0 && ` · ${completedCount} done`}
        </p>
      </div>

      {/* Stats row */}
      <div className="flex gap-2">
        <div className="flex-1 rounded-[14px] border border-edge bg-card py-3.5 text-center">
          <div className="font-mono text-lg font-bold text-accent">{list.items.length}</div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Total</div>
        </div>
        <div className="flex-1 rounded-[14px] border border-edge bg-card py-3.5 text-center">
          <div className="font-mono text-lg font-bold text-done">{completedCount}</div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Done</div>
        </div>
        <div className="flex-1 rounded-[14px] border border-edge bg-card py-3.5 text-center">
          <div className="font-mono text-lg font-bold text-ink">{list.items.length - completedCount}</div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Remaining</div>
        </div>
      </div>

      {/* Items */}
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <div className="text-[12px] font-bold uppercase tracking-[1.5px] text-ink-muted">Items</div>
          {list.items.length > 0 && (
            <span className="rounded-md border border-[rgba(93,217,160,0.2)] bg-done-dim px-2.5 py-1 font-mono text-[10px] font-bold text-done">
              {completedCount}/{list.items.length}
            </span>
          )}
        </div>

        {list.items.length === 0 ? (
          <p className="text-sm text-ink-muted">No items yet. Add your first one below.</p>
        ) : (
          <div className="space-y-2">
            {list.items.map((item) => (
              <ListItemRow
                key={item.id}
                item={item}
                isExpanded={expandedItemId === item.id}
                onToggle={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                onToggleComplete={() => handleToggleComplete(item.id, item.isCompleted)}
                onDelete={() => handleDeleteItem(item.id)}
                onEdit={() => openEditItem(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Item button */}
      <button
        onClick={() => { resetItemForm(); setShowAddItem(true) }}
        className="w-full rounded-[14px] bg-solid py-[15px] font-mono text-sm font-bold uppercase tracking-wider text-solid-fg transition-all hover:opacity-90 active:scale-[0.98]"
      >
        + Add Item
      </button>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button variant="secondary" onClick={openEditList} className="flex-1">
          Edit List
        </Button>
        <Button variant="danger" onClick={() => setShowDeleteConfirm(true)} className="flex-1">
          Delete List
        </Button>
      </div>

      {/* Add Item Modal */}
      <Modal
        isOpen={showAddItem}
        onClose={() => { setShowAddItem(false); resetItemForm() }}
        title="Add Item"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowAddItem(false); resetItemForm() }}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-item-form"
              isLoading={addItem.isPending}
            >
              + Add
            </Button>
          </>
        }
      >
        <form id="add-item-form" onSubmit={handleAddItem} className="space-y-5">
          <Input
            label="Title"
            value={itemTitle}
            onChange={(e) => setItemTitle(e.target.value)}
            placeholder="e.g. Inception"
            required
            autoFocus
          />
          <Input
            label="URL"
            value={itemUrl}
            onChange={(e) => setItemUrl(e.target.value)}
            placeholder="https://..."
          />
          <Input
            label="Phone"
            value={itemPhone}
            onChange={(e) => setItemPhone(e.target.value)}
            placeholder="(555) 123-4567"
          />
          <Input
            label="Details"
            value={itemDetails}
            onChange={(e) => setItemDetails(e.target.value)}
            placeholder="Any notes or details..."
          />
          {formError && (
            <p className="rounded-xl bg-danger-dim px-3 py-2 text-sm text-danger">{formError}</p>
          )}
        </form>
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        isOpen={showEditItem}
        onClose={() => { setShowEditItem(false); resetItemForm() }}
        title="Edit Item"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowEditItem(false); resetItemForm() }}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-item-form"
              isLoading={updateItem.isPending}
            >
              Save
            </Button>
          </>
        }
      >
        <form id="edit-item-form" onSubmit={handleEditItem} className="space-y-5">
          <Input
            label="Title"
            value={itemTitle}
            onChange={(e) => setItemTitle(e.target.value)}
            placeholder="e.g. Inception"
            required
            autoFocus
          />
          <Input
            label="URL"
            value={itemUrl}
            onChange={(e) => setItemUrl(e.target.value)}
            placeholder="https://..."
          />
          <Input
            label="Phone"
            value={itemPhone}
            onChange={(e) => setItemPhone(e.target.value)}
            placeholder="(555) 123-4567"
          />
          <Input
            label="Details"
            value={itemDetails}
            onChange={(e) => setItemDetails(e.target.value)}
            placeholder="Any notes or details..."
          />
          {formError && (
            <p className="rounded-xl bg-danger-dim px-3 py-2 text-sm text-danger">{formError}</p>
          )}
        </form>
      </Modal>

      {/* Edit List Modal */}
      <Modal
        isOpen={showEditList}
        onClose={() => setShowEditList(false)}
        title="Edit List"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEditList(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-list-form"
              isLoading={updateList.isPending}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <form id="edit-list-form" onSubmit={handleEditList} className="space-y-5">
          <Input
            label="List Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />
          <Input
            label="Icon"
            value={editIcon}
            onChange={(e) => setEditIcon(e.target.value)}
            placeholder="e.g., 🎬"
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
        title="Delete List"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteList}
              isLoading={deleteList.isPending}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-sub">
          Are you sure you want to delete <strong>{list.name}</strong>? All items in this list will be
          removed. This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
