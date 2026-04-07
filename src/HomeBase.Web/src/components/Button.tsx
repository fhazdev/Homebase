import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { Spinner } from './Spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
}

const variantMap = {
  primary:
    'bg-solid text-solid-fg hover:opacity-90 active:scale-[0.98] disabled:opacity-40',
  secondary:
    'bg-card text-ink border border-edge hover:bg-card-hover disabled:opacity-50',
  danger:
    'bg-danger-dim text-danger border border-danger-edge hover:opacity-90 disabled:opacity-40',
  ghost:
    'text-ink-sub hover:bg-card disabled:opacity-50',
}

const sizeMap = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      children,
      className = '',
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold
          font-mono text-xs uppercase tracking-wider
          transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ground
          disabled:cursor-not-allowed
          ${variantMap[variant]}
          ${sizeMap[size]}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <Spinner size="sm" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
