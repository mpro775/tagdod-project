import { type ButtonHTMLAttributes } from 'react'
import { gradients } from '../../theme'

interface GlobalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export function GlobalButton({
  children,
  loading = false,
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  disabled,
  className = '',
  style,
  ...props
}: GlobalButtonProps) {
  const sizeClasses = {
    sm: 'py-2 px-3 text-sm rounded-lg',
    md: 'py-3 px-4 text-base rounded-xl',
    lg: 'py-4 px-6 text-lg rounded-xl',
  }

  const variantClasses = {
    primary: 'text-white font-semibold',
    secondary: 'bg-primary text-white font-semibold hover:bg-primary/90',
    outline: 'border border-primary text-primary hover:bg-primary/10',
    danger: 'border border-tagadod-red text-tagadod-red hover:bg-tagadod-red/10',
    ghost: 'text-tagadod-gray hover:bg-gray-100 dark:hover:bg-white/10',
  }

  const variantStyle = variant === 'primary' ? { background: gradients.linerGreen, ...style } : style

  return (
    <button
      disabled={disabled || loading}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        transition-opacity hover:opacity-90 disabled:opacity-50
        flex items-center justify-center gap-2
        ${className}
      `}
      style={variantStyle}
      {...props}
    >
      {loading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        children
      )}
    </button>
  )
}
