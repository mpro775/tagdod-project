import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import { GlobalButton } from '../../components/shared/GlobalButton'
import { GlobalTextField } from '../../components/shared/GlobalTextField'
import * as authService from '../../services/authService'

interface ResetPasswordState {
  phone?: string
  fromOtp?: boolean
  resetToken?: string
  code?: string
}

export function ResetPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as ResetPasswordState) ?? {}
  const fromOtp = state.fromOtp ?? false
  const resetToken = state.resetToken

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError(t('auth.passwordTooShort'))
      return
    }
    if (newPassword !== confirm) {
      setError(t('auth.passwordsDoNotMatch'))
      return
    }

    setLoading(true)
    try {
      if (fromOtp) {
        if (!state.phone || (!resetToken && !state.code)) {
          setError(t('common.error'))
          return
        }
        await authService.resetPasswordAfterOtp({
          phone: state.phone!,
          resetToken,
          otp: state.code,
          newPassword,
          confirmPassword: confirm,
        })
      } else {
        await authService.resetPassword({
          oldPassword,
          newPassword,
          confirmPassword: confirm,
        })
      }
      setSuccess(true)
      setTimeout(() => {
        if (fromOtp) {
          navigate('/login', { replace: true })
        } else {
          navigate(-1)
        }
      }, 1500)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-tagadod-titles dark:text-tagadod-dark-titles rtl:rotate-180">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
          {fromOtp ? t('auth.setNewPassword') : t('profile.changePassword')}
        </h1>
      </div>

      {success ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-secondary">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
            {t('auth.passwordUpdatedSuccessfully')}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          {!fromOtp && (
            <GlobalTextField
              label={t('auth.oldPassword')}
              type={showPassword ? 'text' : 'password'}
              placeholder={t('auth.oldPassword')}
              value={oldPassword}
              onChange={(e) => setOldPassword((e.target as HTMLInputElement).value)}
              endIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
          )}
          <GlobalTextField
            label={t('auth.newPassword')}
            type={showPassword ? 'text' : 'password'}
            placeholder={t('auth.newPassword')}
            value={newPassword}
            onChange={(e) => setNewPassword((e.target as HTMLInputElement).value)}
            endIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
          <GlobalTextField
            label={t('auth.confirmPassword')}
            type={showPassword ? 'text' : 'password'}
            placeholder={t('auth.confirmPassword')}
            value={confirm}
            onChange={(e) => setConfirm((e.target as HTMLInputElement).value)}
          />

          {error && <p className="text-sm text-tagadod-red">{error}</p>}

          <GlobalButton type="submit" loading={loading}>
            {t('common.save')}
          </GlobalButton>
        </form>
      )}
    </div>
  )
}

export default ResetPasswordPage
