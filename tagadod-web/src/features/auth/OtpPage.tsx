import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { setTokens } from '../../stores/authStore'
import { useUserStore } from '../../stores/userStore'
import { GlobalButton } from '../../components/shared/GlobalButton'
import * as authService from '../../services/authService'

const OTP_LENGTH = 6
const RESEND_SECONDS = 35

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length <= 4) return digits
  const start = digits.slice(0, digits.length - 4)
  const end = digits.slice(-2)
  return `+967 ${start}****${end}`
}

interface OtpState {
  phone?: string
  mode?: 'login' | 'register'
  firstName?: string
  lastName?: string
  userType?: string
  gender?: string
  city?: string
  jobTitle?: string
  needSetPassword?: boolean
}

export function OtpPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as OtpState) ?? {}
  const phone = state.phone ?? ''
  const mode = state.mode ?? 'login'

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [remainingSeconds, setRemainingSeconds] = useState(RESEND_SECONDS)
  const canResend = remainingSeconds <= 0
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!phone) {
      navigate('/login', { replace: true })
    }
  }, [phone, navigate])

  useEffect(() => {
    if (remainingSeconds <= 0) return
    const timer = setInterval(() => setRemainingSeconds((s) => s - 1), 1000)
    return () => clearInterval(timer)
  }, [remainingSeconds])

  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return
      const next = [...otp]
      next[index] = value.slice(-1)
      setOtp(next)
      if (value && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    },
    [otp]
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    },
    [otp]
  )

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (pasted.length) {
      const next = Array(OTP_LENGTH).fill('')
      pasted.split('').forEach((c, i) => (next[i] = c))
      setOtp(next)
      inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus()
    }
  }, [])

  const code = otp.join('')
  const isComplete = code.length === OTP_LENGTH

  const handleSubmit = async () => {
    if (!isComplete || loading) return
    setLoading(true)
    setError('')
    try {
      const tokens = await authService.verifyOtp({
        phone,
        otp: code,
        firstName: state.firstName,
        lastName: state.lastName,
        userType: state.userType as 'customer' | 'engineer' | 'merchant' | undefined,
        gender: state.gender as 'male' | 'female' | undefined,
        city: state.city,
      })
      setTokens(tokens.accessToken, tokens.refreshToken)
      const user = await authService.getMe()
      useUserStore.getState().setUser({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        userType: user.userType,
      })
      if (mode === 'register' || state.needSetPassword) {
        navigate('/setPassword', { replace: true, state: { phone, fromOtp: true } })
      } else {
        navigate('/home', { replace: true })
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    setRemainingSeconds(RESEND_SECONDS)
    try {
      await authService.sendOtp({ phone, type: mode === 'register' ? 'register' : 'login' })
    } catch {
      // silent
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-tagadod-light-bg dark:bg-tagadod-dark-bg p-6">
      <button
        onClick={() => navigate(-1)}
        className="self-start p-2 -mr-2 -mt-2 text-primary dark:text-white"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>

        <h2 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles text-center mb-2">
          {t('auth.enterOtpCode')}
        </h2>
        <p className="text-sm text-tagadod-gray text-center mb-8">
          {t('auth.otpSentMessage')}
          {phone && <><br />{maskPhone(phone)}</>}
        </p>

        <div className="flex gap-2 mb-6" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-11 h-12 text-center text-lg font-bold rounded-lg border-2 border-gray-200 dark:border-white/20 bg-white dark:bg-white/5 text-tagadod-titles dark:text-tagadod-dark-titles focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
            />
          ))}
        </div>

        {error && <p className="text-sm text-tagadod-red text-center mb-4">{error}</p>}

        <div className="flex items-center justify-center gap-2 mb-8">
          {!canResend ? (
            <span className="text-sm text-tagadod-gray">
              {t('auth.resendCodeIn')} {remainingSeconds} {t('auth.seconds')}
            </span>
          ) : (
            <button
              onClick={handleResend}
              className="px-4 py-2 text-sm font-semibold text-secondary border-2 border-secondary rounded-lg hover:bg-secondary/5"
            >
              {t('auth.resendCode')}
            </button>
          )}
        </div>

        <div className="w-full max-w-sm">
          <GlobalButton onClick={handleSubmit} disabled={!isComplete} loading={loading}>
            {t('auth.continueButton')}
          </GlobalButton>
        </div>
      </div>
    </div>
  )
}
