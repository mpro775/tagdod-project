import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import { setGuestMode, setTokens } from '../../stores/authStore'
import { useUserStore } from '../../stores/userStore'
import { GlobalButton } from '../../components/shared/GlobalButton'
import { GlobalTextField } from '../../components/shared/GlobalTextField'
import { PhoneNumberField } from '../../components/shared/PhoneNumberField'
import { CustomTabBar } from '../../components/shared/CustomTabBar'
import * as authService from '../../services/authService'
import type { UserType, Gender } from '../../types/enums'

const USER_TYPES: { value: UserType; label: string; labelEn: string }[] = [
  { value: 'customer', label: 'عميل', labelEn: 'Customer' },
  { value: 'engineer', label: 'مهندس', labelEn: 'Engineer' },
  { value: 'merchant', label: 'تاجر', labelEn: 'Merchant' },
]

const GENDERS: { value: Gender; label: string; labelEn: string }[] = [
  { value: 'male', label: 'ذكر', labelEn: 'Male' },
  { value: 'female', label: 'أنثى', labelEn: 'Female' },
]

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from ?? '/home'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  // Login fields
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Register fields
  const [regPhone, setRegPhone] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [userType, setUserType] = useState<UserType>('customer')
  const [gender, setGender] = useState<Gender>('male')
  const [city, setCity] = useState('')
  const [jobTitle, setJobTitle] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) return
    setError('')
    setLoading(true)
    try {
      if (password) {
        // Login with password
        const tokens = await authService.login({ phone: phone.trim(), password })
        setTokens(tokens.accessToken, tokens.refreshToken)
        const user = await authService.getMe()
        useUserStore.getState().setUser({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          userType: user.userType,
        })
        navigate(from, { replace: true })
      } else {
        // Login with OTP
        await authService.sendOtp({ phone: phone.trim(), type: 'login' })
        navigate('/otp', { state: { phone: phone.trim(), mode: 'login', from } })
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!regPhone.trim() || !firstName.trim() || !lastName.trim()) return
    setError('')
    setLoading(true)
    try {
      await authService.sendOtp({ phone: regPhone.trim(), type: 'register' })
      navigate('/otp', {
        state: {
          phone: regPhone.trim(),
          mode: 'register',
          firstName,
          lastName,
          userType,
          gender,
          city: city || undefined,
          jobTitle: userType === 'engineer' ? jobTitle || undefined : undefined,
        },
      })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleGuest = () => {
    setGuestMode()
    useUserStore.getState().setUser(null)
    navigate('/home', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
      <div className="w-full max-w-md flex flex-col flex-1 p-6">
        {/* Logo */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-primary mb-1">Tagadod</h1>
          <p className="text-sm text-tagadod-gray">تجدُّد</p>
        </div>

        {/* Tabs */}
        <CustomTabBar
          tabs={[
            { key: 'login', label: t('auth.login') },
            { key: 'register', label: t('auth.createAccount') },
          ]}
          activeTab={activeTab}
          onTabChange={(k) => { setActiveTab(k as 'login' | 'register'); setError('') }}
        />

        <div className="flex-1 pt-6">
          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <PhoneNumberField
                label={t('auth.phoneNumberHint')}
                placeholder="7XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <div className="relative">
                <GlobalTextField
                  label={t('auth.passwordHint')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.passwordHint')}
                  value={password}
                  onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
                  hint="اتركه فارغاً للتسجيل بـ OTP"
                  endIcon={
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                />
              </div>

              {error && <p className="text-sm text-tagadod-red text-center">{error}</p>}

              <GlobalButton type="submit" loading={loading}>
                {password ? t('auth.login') : t('auth.continueButton')}
              </GlobalButton>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <PhoneNumberField
                label={t('auth.phoneNumberHint')}
                placeholder="7XXXXXXXX"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <GlobalTextField
                  label={t('editProfile.firstName')}
                  placeholder={t('editProfile.firstNameHint')}
                  value={firstName}
                  onChange={(e) => setFirstName((e.target as HTMLInputElement).value)}
                />
                <GlobalTextField
                  label={t('editProfile.lastName')}
                  placeholder={t('editProfile.lastNameHint')}
                  value={lastName}
                  onChange={(e) => setLastName((e.target as HTMLInputElement).value)}
                />
              </div>

              {/* User type */}
              <div>
                <label className="block text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles mb-1.5">
                  نوع الحساب
                </label>
                <div className="flex gap-2">
                  {USER_TYPES.map((ut) => (
                    <button
                      key={ut.value}
                      type="button"
                      onClick={() => setUserType(ut.value)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        userType === ut.value
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-white/10 text-tagadod-titles dark:text-tagadod-dark-titles'
                      }`}
                    >
                      {ut.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles mb-1.5">
                  الجنس
                </label>
                <div className="flex gap-2">
                  {GENDERS.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setGender(g.value)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        gender === g.value
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-white/10 text-tagadod-titles dark:text-tagadod-dark-titles'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <GlobalTextField
                label="المدينة (اختياري)"
                placeholder="مثلاً: صنعاء"
                value={city}
                onChange={(e) => setCity((e.target as HTMLInputElement).value)}
              />

              {userType === 'engineer' && (
                <GlobalTextField
                  label="المسمى الوظيفي"
                  placeholder="مثلاً: مهندس كهرباء"
                  value={jobTitle}
                  onChange={(e) => setJobTitle((e.target as HTMLInputElement).value)}
                />
              )}

              {error && <p className="text-sm text-tagadod-red text-center">{error}</p>}

              <GlobalButton type="submit" loading={loading}>
                {t('auth.continueButton')}
              </GlobalButton>
            </form>
          )}
        </div>

        <button
          onClick={handleGuest}
          className="mt-6 mb-4 text-tagadod-gray hover:text-primary transition-colors text-sm"
        >
          {t('auth.continueAsGuest')}
        </button>
      </div>
    </div>
  )
}
