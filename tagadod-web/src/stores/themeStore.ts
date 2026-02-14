import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const STORAGE_KEY = 'tagadod-theme'

export type ThemeMode = 'light' | 'dark' | 'auto'

interface ThemeStore {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  toggle: () => void
}

function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(mode: ThemeMode) {
  const resolved = mode === 'auto' ? getSystemPreference() : mode
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(STORAGE_KEY)
  try {
    const parsed = stored ? JSON.parse(stored) : null
    if (parsed?.state?.mode) return parsed.state.mode
  } catch {
    // fallback
  }
  if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored
  return 'auto'
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: getInitialMode(),
      setMode: (mode) => {
        set({ mode })
        applyTheme(mode)
      },
      toggle: () =>
        set((s) => {
          const modes: ThemeMode[] = ['light', 'dark', 'auto']
          const idx = modes.indexOf(s.mode)
          const next = modes[(idx + 1) % modes.length]
          applyTheme(next)
          return { mode: next }
        }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({ mode: s.mode }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.mode)
        }
      },
    }
  )
)

// Listen for system theme changes when in auto mode
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const store = useThemeStore.getState()
    if (store.mode === 'auto') {
      applyTheme('auto')
    }
  })
}
