import { useState, useCallback, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'

interface SearchInputProps {
  value?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  placeholder?: string
  suggestions?: string[]
  onSuggestionClick?: (s: string) => void
  debounceMs?: number
}

export function SearchInput({
  value: controlledValue,
  onChange,
  onSearch,
  placeholder = 'ابحث عن...',
  suggestions = [],
  onSuggestionClick,
  debounceMs = 500,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(controlledValue ?? '')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>()
  const inputRef = useRef<HTMLInputElement>(null)

  const val = controlledValue ?? internalValue

  const handleChange = useCallback(
    (v: string) => {
      setInternalValue(v)
      onChange?.(v)
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(() => {
        onSearch?.(v)
      }, debounceMs)
    },
    [onChange, onSearch, debounceMs]
  )

  const clear = () => {
    handleChange('')
    inputRef.current?.focus()
  }

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-tagadod-gray" />
        <input
          ref={inputRef}
          type="text"
          value={val}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className="w-full ps-10 pe-10 py-3 rounded-xl bg-gray-100 dark:bg-white/10 text-tagadod-titles dark:text-tagadod-dark-titles placeholder-tagadod-gray border-0 focus:ring-2 focus:ring-primary outline-none"
        />
        {val && (
          <button onClick={clear} className="absolute end-3 top-1/2 -translate-y-1/2 text-tagadod-gray hover:text-tagadod-titles">
            <X size={18} />
          </button>
        )}
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-tagadod-dark-gray rounded-xl shadow-lg z-50 overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={i}
              className="w-full text-start px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/10 text-tagadod-titles dark:text-tagadod-dark-titles text-sm border-b last:border-b-0 border-gray-100 dark:border-white/5"
              onMouseDown={() => onSuggestionClick?.(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
