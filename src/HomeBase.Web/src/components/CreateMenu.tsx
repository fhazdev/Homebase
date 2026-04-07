import { useState, useRef, useEffect } from 'react'

interface CreateMenuProps {
  onNewTask: () => void
  onNewList: () => void
}

export function CreateMenu({ onNewTask, onNewList }: CreateMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-edge bg-card transition-colors hover:bg-card-hover"
      >
        <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" stroke="currentColor" strokeWidth={2} fill="none">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-[12px] border border-edge bg-card shadow-lg">
          <button
            onClick={() => { setOpen(false); onNewTask() }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] font-semibold text-ink transition-colors hover:bg-card-hover"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" strokeWidth={2} fill="none" stroke="currentColor">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
            New Task
          </button>
          <div className="border-t border-divider" />
          <button
            onClick={() => { setOpen(false); onNewList() }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] font-semibold text-ink transition-colors hover:bg-card-hover"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" strokeWidth={1.8} fill="none" stroke="currentColor">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            New List
          </button>
        </div>
      )}
    </div>
  )
}
