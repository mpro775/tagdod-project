import { type InputHTMLAttributes, type ReactNode, forwardRef } from 'react'

interface GlobalTextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  startIcon?: ReactNode
  endIcon?: ReactNode
  multiline?: boolean
  rows?: number
}

export const GlobalTextField = forwardRef<HTMLInputElement, GlobalTextFieldProps>(
  ({ label, error, hint, startIcon, endIcon, multiline, rows = 3, className = '', ...props }, ref) => {
    const baseClasses = `
      w-full px-4 py-3 rounded-xl
      bg-gray-100 dark:bg-white/10
      text-tagadod-titles dark:text-tagadod-dark-titles
      placeholder-tagadod-gray
      border-0 focus:ring-2 focus:ring-primary outline-none
      transition-all
      ${startIcon ? 'ps-11' : ''}
      ${endIcon ? 'pe-11' : ''}
      ${error ? 'ring-2 ring-tagadod-red' : ''}
      ${className}
    `

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {startIcon && (
            <div className="absolute start-3 top-1/2 -translate-y-1/2 text-tagadod-gray">
              {startIcon}
            </div>
          )}
          {multiline ? (
            <textarea
              rows={rows}
              className={baseClasses + ' resize-none'}
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input ref={ref} className={baseClasses} {...props} />
          )}
          {endIcon && (
            <div className="absolute end-3 top-1/2 -translate-y-1/2 text-tagadod-gray">
              {endIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-tagadod-red">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-tagadod-gray">{hint}</p>}
      </div>
    )
  }
)

GlobalTextField.displayName = 'GlobalTextField'
