import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Lottie from 'lottie-react'

export function MaintenancePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [retrying, setRetrying] = useState(false)
  const [animData, setAnimData] = useState<object | null>(null)

  useEffect(() => {
    fetch('/assets/animations/maintenance.json')
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

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
      <div className="max-w-md w-full rounded-2xl bg-white dark:bg-tagadod-dark-bg shadow-lg dark:shadow-none border border-gray-200 dark:border-white/10 p-8">
        <div className="w-40 h-40 mx-auto">
          {animData ? (
            <Lottie animationData={animData} loop />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-white/10 rounded-xl">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-tagadod-gray">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
          )}
        </div>
        <h2 className="text-xl font-bold text-tagadod-titles dark:text-tagadod-dark-titles text-center mt-6">
          {t('maintenance.title')}
        </h2>
        <p className="text-tagadod-gray text-center mt-3">
          {t('maintenance.message')}
        </p>
        <button
          onClick={handleRetry}
          disabled={retrying}
          className="w-full mt-8 py-3 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {retrying ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
  )
}
