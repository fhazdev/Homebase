interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'overdue' | 'upcoming' | 'success' | 'neutral'
  className?: string
}

const variantMap = {
  default: 'bg-accent-dim text-accent border border-accent-edge',
  overdue: 'bg-danger-dim text-danger border border-danger-edge',
  upcoming: 'bg-info-dim text-info border border-info-edge',
  success: 'bg-done-dim text-done border border-[rgba(93,217,160,0.2)]',
  neutral: 'bg-card text-ink-muted border border-edge',
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider ${variantMap[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
