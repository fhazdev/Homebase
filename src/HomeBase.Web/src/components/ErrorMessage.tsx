interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="rounded-[14px] border border-danger-edge bg-danger-dim p-4">
      <div className="flex items-start gap-3">
        <span className="text-xl">⚠️</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-danger">Something went wrong</p>
          <p className="mt-1 text-sm text-danger/80">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm font-semibold text-danger underline hover:opacity-80"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
