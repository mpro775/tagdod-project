import { useEffect } from 'react'
import { useThemeStore } from '../../stores/themeStore'

function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((s) => s.mode)

  useEffect(() => {
    const resolved = mode === 'auto' ? getSystemPreference() : mode
    document.documentElement.classList.toggle('dark', resolved === 'dark')
  }, [mode])

  return <>{children}</>
}
