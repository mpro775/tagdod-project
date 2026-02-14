import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { hasSeenOnboarding } from '../../stores/onboardingStore'
import { isAuthenticated } from '../../stores/authStore'

export function SplashPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasSeenOnboarding()) {
        navigate('/onboarding', { replace: true })
      } else if (isAuthenticated()) {
        navigate('/home', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#FCFCFC' }}
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">Tagadod</h1>
        <p className="text-tagadod-gray">جاري التحميل...</p>
      </div>
    </div>
  )
}
