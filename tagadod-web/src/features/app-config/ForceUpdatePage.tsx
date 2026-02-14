import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Lottie from 'lottie-react'

interface ForceUpdatePageProps {
  updateUrl?: string
}

export function ForceUpdatePage({ updateUrl }: ForceUpdatePageProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [retrying, setRetrying] = useState(false)
  const [animData, setAnimData] = useState<object | null>(null)

  useEffect(() => {
    fetch('/assets/animations/update.json')
      .then((r) => r.json())
      .then(setAnimData)
      .catch(() => setAnimData(null))
  }, [])

  const handleRetry = async () => {
    if (retrying) return
    setRetrying(true)
    await new Promise((r) => setTimeout(r, 1000))
    setRetrying(false)
    navigate('/splash', { replace: true })
  }

  const handleUpdate = () => {
    if (updateUrl) window.open(updateUrl, '_blank')
  }

  const canOpenStore = !!updateUrl && updateUrl.length > 0

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
      <div className="max-w-md w-full rounded-2xl bg-white dark:bg-tagadod-dark-bg shadow-lg dark:shadow-none border border-gray-200 dark:border-white/10 p-8">
        <div className="w-40 h-40 mx-auto">
          {animData ? (
            <Lottie animationData={animData} loop />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-white/10 rounded-xl">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </div>
          )}
        </div>
        <h2 className="text-xl font-bold text-tagadod-titles dark:text-tagadod-dark-titles text-center mt-6">
          {t('forceUpdate.title')}
        </h2>
        <p className="text-tagadod-gray text-center mt-3">
          {t('forceUpdate.message')}
        </p>
        <div className="mt-8 space-y-3">
          {canOpenStore && (
            <button
              onClick={handleUpdate}
              className="w-full py-3 rounded-xl bg-primary text-white font-semibold"
            >
              {t('forceUpdate.updateButton')}
            </button>
          )}
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="w-full py-3 rounded-xl border-2 border-gray-300 dark:border-white/20 text-tagadod-titles dark:text-tagadod-dark-titles font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {retrying ? (
              <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 11-9-9 9 9 0 019 9z" />
                <path d="M21 12v-6M21 12h-6" />
              </svg>
            )}
            {t('maintenance.retry')}
          </button>
        </div>
      </div>
    </div>
  )
}
