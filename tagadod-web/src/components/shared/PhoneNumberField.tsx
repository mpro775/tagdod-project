import { type InputHTMLAttributes, forwardRef } from 'react'
import { Phone } from 'lucide-react'

interface PhoneNumberFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  countryCode?: string
}

export const PhoneNumberField = forwardRef<HTMLInputElement, PhoneNumberFieldProps>(
  ({ label, error, countryCode = '+967', className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex">
          <div className="flex items-center gap-1 px-3 py-3 bg-gray-200 dark:bg-white/20 rounded-s-xl text-tagadod-titles dark:text-tagadod-dark-titles text-sm">
            <Phone size={16} className="text-tagadod-gray" />
            <span>{countryCode}</span>
          </div>
          <input
            ref={ref}
            type="tel"
            dir="ltr"
            className={`
              flex-1 px-4 py-3 rounded-e-xl
              bg-gray-100 dark:bg-white/10
              text-tagadod-titles dark:text-tagadod-dark-titles
              placeholder-tagadod-gray
              border-0 focus:ring-2 focus:ring-primary outline-none
              ${error ? 'ring-2 ring-tagadod-red' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-tagadod-red">{error}</p>}
      </div>
    )
  }
)

PhoneNumberField.displayName = 'PhoneNumberField'
