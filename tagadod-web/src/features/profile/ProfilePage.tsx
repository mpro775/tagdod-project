import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  Heart,
  MapPin,
  Wrench,
  ChevronLeft,
  Globe,
  Sun,
  DollarSign,
  MessageCircle,
  Share2,
  User,
  Lock,
  FileText,
  Shield,
  Trash2,
  Monitor,
  CheckCircle2,
  Clock,
  Info,
  LogIn,
  ArrowRight,
  LogOut,
} from 'lucide-react'
import { clearAuth, isLoggedIn, isGuestMode as getIsGuestMode } from '../../stores/authStore'
import { useUserStore } from '../../stores/userStore'
import { useThemeStore } from '../../stores/themeStore'
import { useLanguageStore } from '../../stores/languageStore'
import { useCurrencyStore } from '../../stores/currencyStore'
import { useNotificationStore } from '../../stores/notificationStore'
import { languages } from '../../i18n'
import { gradients } from '../../theme'
import { ConfirmationSheet, GlobalTextField, GlobalButton, BottomSheet } from '../../components/shared'
import * as authService from '../../services/authService'

/* ------------------------------------------------------------------ */
/*  Menu Item                                                          */
/* ------------------------------------------------------------------ */
function MenuItem({
  icon: Icon,
  label,
  to,
  onClick,
  trailing,
  disabled,
}: {
  icon: React.ElementType
  label: string
  to?: string
  onClick?: () => void
  trailing?: React.ReactNode
  disabled?: boolean
}) {
  const cls = `w-full flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5 text-start ${disabled ? 'opacity-40 pointer-events-none' : ''}`
  const content = (
    <>
      <span className="flex items-center gap-3 text-tagadod-titles dark:text-tagadod-dark-titles text-sm">
        <Icon size={20} />
        {label}
      </span>
      {trailing ?? <ChevronLeft size={18} className="text-tagadod-gray rtl:rotate-0 ltr:rotate-180" />}
    </>
  )
  if (to) return <Link to={to} className={cls}>{content}</Link>
  return <button onClick={onClick} className={cls}>{content}</button>
}

/* ------------------------------------------------------------------ */
/*  Profile Page                                                       */
/* ------------------------------------------------------------------ */
export function ProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const loggedIn = isLoggedIn()
  const isGuest = getIsGuestMode() || !loggedIn
  const user = useUserStore((s) => s.user)
  const themeMode = useThemeStore((s) => s.mode)
  const setThemeMode = useThemeStore((s) => s.setMode)
  const language = useLanguageStore((s) => s.language)
  const setLanguage = useLanguageStore((s) => s.setLanguage)
  const currency = useCurrencyStore((s) => s.currency)
  const setCurrency = useCurrencyStore((s) => s.setCurrency)

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showLangSheet, setShowLangSheet] = useState(false)
  const [showThemeSheet, setShowThemeSheet] = useState(false)
  const [showCurrencySheet, setShowCurrencySheet] = useState(false)
  const [showDeleteSheet, setShowDeleteSheet] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')
  const [deletePassword, setDeletePassword] = useState('')

  /* ---- جلب بيانات المستخدم ---- */
  const { data: meData } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: authService.getMe,
    enabled: loggedIn,
  })

  useEffect(() => {
    if (meData) {
      useUserStore.getState().setUser({
        id: meData.id,
        firstName: meData.firstName,
        lastName: meData.lastName,
        phone: meData.phone,
        userType: meData.userType,
        verificationStatus: meData.verificationStatus,
      })
    }
  }, [meData])

  /* ---- مشتقات المستخدم ---- */
  const isEngineer = user?.userType === 'engineer'
  const isMerchant = user?.userType === 'merchant'
  const displayName = user?.firstName
    ? [user.firstName, user.lastName].filter(Boolean).join(' ')
    : null
  const avatarLetter = displayName
    ? displayName.charAt(0)
    : loggedIn ? 'م' : 'ز'
  const verificationStatus = user?.verificationStatus ?? 'unverified'
  const needsVerify = loggedIn && verificationStatus === 'unverified' && (isEngineer || isMerchant)

  /* ---- أحداث ---- */
  const handleLogout = () => {
    useNotificationStore.getState().destroyWebSocket()
    clearAuth()
    useUserStore.getState().setUser(null)
    navigate('/login', { replace: true })
  }

  const deleteAccountMutation = useMutation({
    mutationFn: () =>
      authService.deleteAccount({ reason: deleteReason || undefined, password: deletePassword }),
    onSuccess: () => {
      setShowDeleteSheet(false)
      useNotificationStore.getState().destroyWebSocket()
      clearAuth()
      useUserStore.getState().setUser(null)
      navigate('/login', { replace: true })
    },
  })

  const currencyLabels: Record<string, string> = {
    USD: t('currency.usd'),
    SAR: t('currency.sar'),
    YER: t('currency.yer'),
  }

  const themeLabel =
    themeMode === 'light'
      ? t('profile.light', 'فاتح')
      : themeMode === 'dark'
        ? t('profile.dark', 'داكن')
        : t('profile.auto', 'تلقائي')

  return (
    <div className="pb-24">
      {/* ========== Header ========== */}
      <div className="flex flex-col items-center pt-6 pb-4 px-4">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#E4F5FF] to-[#C8EDFF] dark:from-white/10 dark:to-white/5 flex items-center justify-center mb-4 shadow-md">
          <span className="text-3xl font-bold text-primary">{avatarLetter}</span>
        </div>

        {/* Name */}
        <h3 className="text-xl font-bold text-tagadod-titles dark:text-tagadod-dark-titles text-center mb-1">
          {isGuest ? t('auth.continueAsGuest', 'الاستمرار كزائر') : (displayName ?? t('profile.welcome'))}
        </h3>

        {/* Phone */}
        {loggedIn && user?.phone && (
          <p className="text-sm text-tagadod-gray mb-3" dir="ltr">{user.phone}</p>
        )}

        {/* شارة حالة التوثيق أو الزائر */}
        {isGuest ? (
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-primary text-sm font-medium mb-4">
            <User size={16} />
            {t('auth.continueAsGuest', 'الاستمرار كزائر')}
          </span>
        ) : (
          <span
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium mb-3 ${
              verificationStatus === 'verified'
                ? 'bg-green-500/15 border border-green-500/30 text-green-600 dark:text-green-400'
                : verificationStatus === 'underReview'
                  ? 'bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : 'bg-tagadod-gray/15 border border-tagadod-gray/30 text-tagadod-gray'
            }`}
          >
            {verificationStatus === 'verified' ? <CheckCircle2 size={16} /> : verificationStatus === 'underReview' ? <Clock size={16} /> : <Info size={16} />}
            {t(`profile.${verificationStatus}`)}
          </span>
        )}

        {/* زر تحقق الحساب */}
        {needsVerify && (
          <Link
            to="/verify-account"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-500 text-white text-sm font-semibold mb-3 hover:bg-amber-600 transition-colors"
          >
            {t('profile.verifyAccount')}
            <ArrowRight size={14} className="rtl:rotate-180" />
          </Link>
        )}

        {/* زر تعديل الحساب أو تسجيل الدخول */}
        {isGuest ? (
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-sm font-semibold transition-colors"
            style={{ background: gradients.linerGreen }}
          >
            {t('profile.loginNow')}
            <LogIn size={16} />
          </Link>
        ) : (
          <Link
            to="/edit-profile"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-sm font-semibold transition-colors"
            style={{ background: gradients.linerGreenReversed }}
          >
            {t('profile.editAccount')}
            <ArrowRight size={14} className="rtl:rotate-180" />
          </Link>
        )}
      </div>

      {/* ========== قسم المهندس / الصيانة ========== */}
      <div className="mx-4 mb-4 rounded-xl bg-tagadod-bottom-bar-light dark:bg-tagadod-bottom-bar-dark overflow-hidden">
        {isEngineer ? (
          <>
            <MenuItem icon={User} label="بروفايل المهندس" to="/my-engineer-profile" />
            <MenuItem icon={Wrench} label={t('profile.customerOrders', 'طلبات العملاء')} to="/customers-orders" />
          </>
        ) : (
          <MenuItem icon={Wrench} label={t('profile.requestEngineer')} to="/maintenance-orders" />
        )}
      </div>

      {/* ========== المفضلة والعناوين ========== */}
      <div className="mx-4 mb-4 rounded-xl bg-tagadod-bottom-bar-light dark:bg-tagadod-bottom-bar-dark overflow-hidden">
        <MenuItem icon={Heart} label={t('profile.favorites')} to="/favorites" disabled={isGuest} />
        <MenuItem icon={MapPin} label={t('profile.addresses')} to="/addresses" disabled={isGuest} />
      </div>

      {/* ========== الأمان ========== */}
      {loggedIn && (
        <div className="mx-4 mb-4 rounded-xl bg-tagadod-bottom-bar-light dark:bg-tagadod-bottom-bar-dark overflow-hidden">
          <MenuItem icon={Lock} label={t('profile.changePassword', 'تغيير كلمة المرور')} to="/reset-password" />
        </div>
      )}

      {/* ========== الدعم والمشاركة ========== */}
      <div className="mx-4 mb-4 rounded-xl bg-tagadod-bottom-bar-light dark:bg-tagadod-bottom-bar-dark overflow-hidden">
        <MenuItem icon={MessageCircle} label={t('profile.contactUs', 'تواصل معنا')} to="/chat" />
        <MenuItem icon={Share2} label={t('profile.shareApp')} onClick={() => navigator.share?.({ url: 'https://tagadod.app/' }).catch(() => {})} />
      </div>

      {/* ========== اللغة والعملة والمظهر ========== */}
      <div className="mx-4 mb-4 rounded-xl bg-tagadod-bottom-bar-light dark:bg-tagadod-bottom-bar-dark overflow-hidden">
        <MenuItem
          icon={Globe}
          label={t('profile.language')}
          onClick={() => setShowLangSheet(true)}
          trailing={<span className="text-tagadod-gray text-sm">{languages.find((x) => x.code === language)?.label ?? language}</span>}
        />
        <MenuItem
          icon={Sun}
          label={t('profile.theme')}
          onClick={() => setShowThemeSheet(true)}
          trailing={<span className="text-tagadod-gray text-sm">{themeLabel}</span>}
        />
        <MenuItem
          icon={DollarSign}
          label={t('profile.currencyType')}
          onClick={() => setShowCurrencySheet(true)}
          trailing={<span className="text-tagadod-gray text-sm">{currencyLabels[currency] ?? currency}</span>}
        />
      </div>

      {/* ========== الشروط والسياسة ========== */}
      <div className="mx-4 mb-4 rounded-xl bg-tagadod-bottom-bar-light dark:bg-tagadod-bottom-bar-dark overflow-hidden">
        <MenuItem icon={FileText} label={t('profile.termsAndConditions', 'الشروط والأحكام')} to="/terms-and-conditions" />
        <MenuItem icon={Shield} label={t('profile.privacyPolicy', 'سياسة الخصوصية')} to="/privacy-policy" />
      </div>

      {/* ========== تسجيل الخروج / حذف الحساب ========== */}
      {isGuest ? (
        <div className="mx-4 mb-4 rounded-xl bg-tagadod-bottom-bar-light dark:bg-tagadod-bottom-bar-dark overflow-hidden">
          <MenuItem icon={LogIn} label={t('profile.loginNow')} to="/login" />
        </div>
      ) : (
        <>
          <div className="mx-4 mb-4 rounded-xl bg-tagadod-bottom-bar-light dark:bg-tagadod-bottom-bar-dark overflow-hidden">
            <MenuItem icon={LogOut} label={t('profile.logout')} onClick={() => setShowLogoutConfirm(true)} />
          </div>
          <div className="mx-4 mb-4 rounded-xl bg-tagadod-bottom-bar-light dark:bg-tagadod-bottom-bar-dark overflow-hidden">
            <MenuItem icon={Trash2} label={t('profile.deleteAccount', 'حذف الحساب')} onClick={() => setShowDeleteSheet(true)} />
          </div>
        </>
      )}

      {/* ========== Sheets ========== */}

      {/* Logout Confirmation */}
      <ConfirmationSheet
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title={t('profile.doYouWantToLogout')}
        message={t('profile.youWillBeLoggedOut')}
        confirmLabel={t('profile.logout')}
        cancelLabel={t('common.cancel')}
      />

      {/* Delete Account Sheet */}
      <BottomSheet
        open={showDeleteSheet}
        onClose={() => { setShowDeleteSheet(false); setDeleteReason(''); setDeletePassword(''); deleteAccountMutation.reset() }}
        title={t('profile.deleteAccount', 'حذف الحساب')}
      >
        <p className="text-sm text-tagadod-gray mb-4">
          {t('profile.deleteAccountConfirm', 'هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.')}
        </p>
        <div className="space-y-3 mb-4">
          <GlobalTextField
            label={t('profile.deleteReason', 'سبب الحذف (اختياري)')}
            placeholder="..."
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            multiline
            rows={2}
          />
          <GlobalTextField
            label={t('profile.enterPassword', 'كلمة المرور')}
            placeholder="..."
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
          />
        </div>
        {deleteAccountMutation.isError && (
          <p className="text-xs text-tagadod-red mb-3">
            {(deleteAccountMutation.error as Error)?.message || t('common.error')}
          </p>
        )}
        <div className="flex gap-3">
          <GlobalButton variant="ghost" onClick={() => { setShowDeleteSheet(false); setDeleteReason(''); setDeletePassword('') }} className="border border-gray-300 dark:border-white/20">
            {t('common.cancel', 'إلغاء')}
          </GlobalButton>
          <GlobalButton variant="danger" onClick={() => deleteAccountMutation.mutate()} loading={deleteAccountMutation.isPending} disabled={!deletePassword.trim()}>
            {t('profile.deleteAccount', 'حذف الحساب')}
          </GlobalButton>
        </div>
      </BottomSheet>

      {/* Language Sheet */}
      <BottomSheet open={showLangSheet} onClose={() => setShowLangSheet(false)} title={t('profile.language')}>
        <div className="space-y-2">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLanguage(l.code as 'ar' | 'en'); setShowLangSheet(false) }}
              className={`w-full py-3 rounded-xl text-start px-4 ${language === l.code ? 'bg-primary/20 text-primary' : 'bg-gray-100 dark:bg-white/10 text-tagadod-titles dark:text-tagadod-dark-titles'}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Theme Sheet */}
      <BottomSheet open={showThemeSheet} onClose={() => setShowThemeSheet(false)} title={t('profile.theme')}>
        <div className="flex gap-3">
          {([
            { key: 'light' as const, icon: Sun, label: t('profile.light', 'فاتح') },
            { key: 'dark' as const, icon: Sun, label: t('profile.dark', 'داكن') },
            { key: 'auto' as const, icon: Monitor, label: t('profile.auto', 'تلقائي') },
          ]).map(({ key, icon: TIcon, label }) => (
            <button
              key={key}
              onClick={() => { setThemeMode(key); setShowThemeSheet(false) }}
              className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 ${themeMode === key ? 'bg-primary/20 text-primary' : 'bg-gray-100 dark:bg-white/10 text-tagadod-titles dark:text-tagadod-dark-titles'}`}
            >
              <TIcon size={20} />
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Currency Sheet */}
      <BottomSheet open={showCurrencySheet} onClose={() => setShowCurrencySheet(false)} title={t('profile.currencyType')}>
        <div className="space-y-2">
          {(['USD', 'SAR', 'YER'] as const).map((c) => (
            <button
              key={c}
              onClick={() => { setCurrency(c); setShowCurrencySheet(false) }}
              className={`w-full py-3 rounded-xl text-start px-4 ${currency === c ? 'bg-primary/20 text-primary' : 'bg-gray-100 dark:bg-white/10 text-tagadod-titles dark:text-tagadod-dark-titles'}`}
            >
              {currencyLabels[c]}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  )
}
