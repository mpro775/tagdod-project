import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import { GlobalButton } from '../../components/shared/GlobalButton'
import { GlobalTextField } from '../../components/shared/GlobalTextField'
import * as authService from '../../services/authService'

export function SetPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const fromOtp = (location.state as { fromOtp?: boolean })?.fromOtp ?? true

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError(t('auth.passwordTooShort'))
      return
    }
    if (password !== confirm) {
      setError(t('auth.passwordsDoNotMatch'))
      return
    }

    setLoading(true)
    try {
      await authService.setPassword({ password, confirmPassword: confirm })
      navigate('/home', { replace: true })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-tagadod-light-bg dark:bg-tagadod-dark-bg p-6">
      <button
        onClick={() => (fromOtp ? navigate(-1) : navigate('/login'))}
        className="self-start p-2 -mr-2 -mt-2 text-primary dark:text-white"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h2 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles text-center mb-2">
          {t('auth.createPassword')}
        </h2>
        <p className="text-sm text-tagadod-gray text-center mb-8">
          {t('auth.yourPassword')}
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <GlobalTextField
            type={showPassword ? 'text' : 'password'}
            placeholder={t('auth.newPassword')}
            value={password}
            onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
            endIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
          <GlobalTextField
            type={showPassword ? 'text' : 'password'}
            placeholder={t('auth.confirmPassword')}
            value={confirm}
            onChange={(e) => setConfirm((e.target as HTMLInputElement).value)}
          />

          {error && <p className="text-sm text-tagadod-red text-center">{error}</p>}

          <GlobalButton type="submit" loading={loading}>
            {t('auth.confirm')}
          </GlobalButton>
        </form>
      </div>
    </div>
  )
}
