import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[11px] font-bold uppercase tracking-[1px] text-ink-muted"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full rounded-xl border border-edge-input bg-field px-3.5 py-3 text-[15px]
            font-medium text-ink placeholder-ink-placeholder
            outline-none transition-all
            focus:border-edge-focus focus:shadow-[0_0_0_3px_var(--hb-accent-dim)]
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_var(--hb-danger-dim)]' : ''}
            ${className}
          `}
          {...props}
        />
        {hint && !error && <p className="text-xs text-ink-muted">{hint}</p>}
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'
