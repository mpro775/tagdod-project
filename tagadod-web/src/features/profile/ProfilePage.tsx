import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
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
  CheckCircle,
  Monitor,
} from 'lucide-react'
import { clearAuth, isLoggedIn } from '../../stores/authStore'
import { useUserStore } from '../../stores/userStore'
import { useThemeStore } from '../../stores/themeStore'
import { useLanguageStore } from '../../stores/languageStore'
import { useCurrencyStore } from '../../stores/currencyStore'
import { languages } from '../../i18n'
import { ConfirmationSheet, GlobalTextField, GlobalButton, BottomSheet } from '../../components/shared'
import * as authService from '../../services/authService'

export function ProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const loggedIn = isLoggedIn()
  const user = useUserStore((s) => s.user)
  const isEngineer = useUserStore((s) => s.isEngineer())
  const isMerchant = user?.userType === 'merchant'
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

  const handleLogout = () => {
    clearAuth()
    useUserStore.getState().setUser(null)
    navigate('/login', { replace: true })
  }

  const deleteAccountMutation = useMutation({
    mutationFn: () =>
      authService.deleteAccount({ reason: deleteReason || undefined, password: deletePassword }),
    onSuccess: () => {
      setShowDeleteSheet(false)
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
    <div className="p-4 pb-24">
      {/* Header */}
      <div className="flex flex-col items-center py-6">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-3">
          <span className="text-2xl font-bold text-primary">
            {loggedIn ? 'م' : 'ز'}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
          {loggedIn ? t('profile.welcome') : t('profile.guest')}
        </h3>
      </div>

      {/* Menu */}
      <div className="rounded-xl bg-tagadod-bottom-bar-light dark:bg-tagadod-bottom-bar-dark overflow-hidden">
        <Link
          to="/favorites"
          className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10"
        >
          <span className="flex items-center gap-3 text-tagadod-titles dark:text-tagadod-dark-titles">
            <Heart size={20} />
            {t('profile.favorites')}
          </span>
          <ChevronLeft size={20} className="text-tagadod-gray rotate-180" />
        </Link>
        <Link
          to="/addresses"
          className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10"
        >
          <span className="flex items-center gap-3 text-tagadod-titles dark:text-tagadod-dark-titles">
            <MapPin size={20} />
            {t('profile.addresses')}
          </span>
          <ChevronLeft size={20} className="text-tagadod-gray rotate-180" />
        </Link>
        {!isEngineer ? (
          <Link
            to="/maintenance-orders"
            className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10"
          >
            <span className="flex items-center gap-3 text-tagadod-titles dark:text-tagadod-dark-titles">
              <Wrench size={20} />
              {t('profile.requestEngineer')}
            </span>
            <ChevronLeft size={20} className="text-tagadod-gray rotate-180" />
          </Link>
        ) : (
          <>
            <Link
              to="/my-engineer-profile"
              className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10"
            >
              <span className="flex items-center gap-3 text-tagadod-titles dark:text-tagadod-dark-titles">
                <User size={20} />
                بروفايل المهندس
              </span>
              <ChevronLeft size={20} className="text-tagadod-gray rotate-180" />
            </Link>
            <Link
              to="/customers-orders"
              className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10"
            >
              <span className="flex items-center gap-3 text-tagadod-titles dark:text-tagadod-dark-titles">
                <Wrench size={20} />
                طلبات العملاء
              </span>
              <ChevronLeft size={20} className="text-tagadod-gray rotate-180" />
            </Link>
          </>
        )}

        {/* Preferences */}
        <button
          onClick={() => setShowLangSheet(true)}
          className="w-full flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10 text-start"
        >
          <span className="flex items-center gap-3 text-tagadod-titles dark:text-tagadod-dark-titles">
            <Globe size={20} />
            {t('profile.language')}
          </span>
          <span className="text-tagadod-gray text-sm">
            {languages.find((x) => x.code === language)?.label ?? language}
          </span>
        </button>
        <button
          onClick={() => setShowThemeSheet(true)}
          className="w-full flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10 text-start"
        >
          <span className="flex items-center gap-3 text-tagadod-titles dark:text-tagadod-dark-titles">
            <Sun size={20} />
            {t('profile.theme')}
          </span>
          <span className="text-tagadod-gray text-sm">{themeLabel}</span>
        </button>
        <button
          onClick={() => setShowCurrencySheet(true)}
          className="w-full flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10 text-start"
        >
          <span className="flex items-center gap-3 text-tagadod-titles dark:text-tagadod-dark-titles">
            <DollarSign size={20} />
            {t('profile.currencyType')}
          </span>
          <span className="text-tagadod-gray text-sm">{currencyLabels[currency] ?? currency}</span>
        </button>

        {loggedIn && (
          <>
            <Link
              to="/edit-profile"
              className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10"
            >
              <span className="flex items-center gap-3 text-tagadod-titles dark:text-tagadod-dark-titles">
                <User size={20} />
                {t('profile.editAccount')}
              </span>
              <ChevronLeft size={20} className="text-tagadod-gray rotate-180" />
            </Link>
            <Link
              to="/reset-password"
              className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10"
            >
              <span className="flex items-center gap-3 text-tagadod-titles dark:text-tagadod-dark-titles">
                <Lock size={20} />
                {t('profile.changePassword', 'تغيير كلمة المرور')}
              </span>
              <ChevronLeft size={20} className="text-tagadod-gray rotate-180" />
            </Link>
          </>
        )}

        {/* Verify Account - for engineer/merchant */}
        {loggedIn && (isEngineer || isMerchant) && (
          <Link
            to="/verify-account"
            className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10"
          >
            <span className="flex items-center gap-3 text-tagadod-titles dark:text-tagadod-dark-titles">
              <CheckCircle size={20} />
              تحقق الحساب
            </span>
            <ChevronLeft size={20} className="text-tagadod-gray rotate-180" />
          </Link>
        )}

        {/* Chat */}
        <Link
          to="/chat"
          className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10"
        >
          <span className="flex items-center gap-3 text-tagadod-titles dark:text-tagadod-dark-titles">
            <MessageCircle size={20} />
            الدردشة
          </span>
          <ChevronLeft size={20} className="text-tagadod-gray rotate-180" />
        </Link>

        <button className="w-full flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10 text-start">
          <span className="flex items-center gap-3 text-tagadod-titles dark:text-tagadod-dark-titles">
            <Share2 size={20} />
            {t('profile.shareApp')}
          </span>
          <ChevronLeft size={20} className="text-tagadod-gray rotate-180" />
        </button>
        <Link
          to="/privacy-policy"
          className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10"
        >
          <span className="flex items-center gap-3 text-tagadod-titles dark:text-tagadod-dark-titles">
            <FileText size={20} />
            سياسة الخصوصية
          </span>
          <ChevronLeft size={20} className="text-tagadod-gray rotate-180" />
        </Link>
        <Link
          to="/terms-and-conditions"
          className="flex items-center justify-between p-4 text-start"
        >
          <span className="flex items-center gap-3 text-tagadod-titles dark:text-tagadod-dark-titles">
            <Shield size={20} />
            الشروط والأحكام
          </span>
          <ChevronLeft size={20} className="text-tagadod-gray rotate-180" />
        </Link>
      </div>

      {loggedIn && (
        <>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full mt-6 py-3 text-tagadod-red font-semibold rounded-xl border border-tagadod-red"
          >
            {t('profile.logout')}
          </button>

          {/* Delete Account */}
          <button
            onClick={() => setShowDeleteSheet(true)}
            className="w-full mt-3 py-3 text-tagadod-red/70 font-medium rounded-xl border border-dashed border-tagadod-red/40 flex items-center justify-center gap-2"
          >
            <Trash2 size={18} />
            حذف الحساب
          </button>

          {/* Engineer/Customer toggle for testing */}
          <button
            onClick={() => {
              useUserStore.getState().setUser(
                isEngineer
                  ? { id: 'demo', userType: 'customer' }
                  : { id: 'demo', userType: 'engineer' }
              )
            }}
            className="w-full mt-3 py-2 text-xs text-tagadod-gray border border-dashed rounded-xl"
          >
            {isEngineer ? 'عرض كعميل' : 'عرض كمهندس'}
          </button>
        </>
      )}

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
        onClose={() => {
          setShowDeleteSheet(false)
          setDeleteReason('')
          setDeletePassword('')
          deleteAccountMutation.reset()
        }}
        title="حذف الحساب"
      >
        <p className="text-sm text-tagadod-gray mb-4">
          هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.
        </p>
        <div className="space-y-3 mb-4">
          <GlobalTextField
            label="سبب الحذف (اختياري)"
            placeholder="أدخل سبب الحذف..."
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            multiline
            rows={2}
          />
          <GlobalTextField
            label="كلمة المرور"
            placeholder="أدخل كلمة المرور للتأكيد"
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
          />
        </div>
        {deleteAccountMutation.isError && (
          <p className="text-xs text-tagadod-red mb-3">
            {(deleteAccountMutation.error as Error)?.message || 'حدث خطأ'}
          </p>
        )}
        <div className="flex gap-3">
          <GlobalButton
            variant="ghost"
            onClick={() => {
              setShowDeleteSheet(false)
              setDeleteReason('')
              setDeletePassword('')
            }}
            className="border border-gray-300 dark:border-white/20"
          >
            {t('common.cancel', 'إلغاء')}
          </GlobalButton>
          <GlobalButton
            variant="danger"
            onClick={() => deleteAccountMutation.mutate()}
            loading={deleteAccountMutation.isPending}
            disabled={!deletePassword.trim()}
          >
            حذف الحساب
          </GlobalButton>
        </div>
      </BottomSheet>

      {/* Language Sheet */}
      <BottomSheet
        open={showLangSheet}
        onClose={() => setShowLangSheet(false)}
        title={t('profile.language')}
      >
        <div className="space-y-2">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLanguage(l.code as 'ar' | 'en')
                setShowLangSheet(false)
              }}
              className={`w-full py-3 rounded-xl text-start px-4 ${
                language === l.code
                  ? 'bg-primary/20 text-primary'
                  : 'bg-gray-100 dark:bg-white/10 text-tagadod-titles dark:text-tagadod-dark-titles'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Theme Sheet with auto option */}
      <BottomSheet
        open={showThemeSheet}
        onClose={() => setShowThemeSheet(false)}
        title={t('profile.theme')}
      >
        <div className="flex gap-3">
          <button
            onClick={() => {
              setThemeMode('light')
              setShowThemeSheet(false)
            }}
            className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 ${
              themeMode === 'light'
                ? 'bg-primary/20 text-primary'
                : 'bg-gray-100 dark:bg-white/10 text-tagadod-titles dark:text-tagadod-dark-titles'
            }`}
          >
            <Sun size={20} />
            <span className="text-sm">{t('profile.light', 'فاتح')}</span>
          </button>
          <button
            onClick={() => {
              setThemeMode('dark')
              setShowThemeSheet(false)
            }}
            className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 ${
              themeMode === 'dark'
                ? 'bg-primary/20 text-primary'
                : 'bg-gray-100 dark:bg-white/10 text-tagadod-titles dark:text-tagadod-dark-titles'
            }`}
          >
            <Sun size={20} />
            <span className="text-sm">{t('profile.dark', 'داكن')}</span>
          </button>
          <button
            onClick={() => {
              setThemeMode('auto')
              setShowThemeSheet(false)
            }}
            className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 ${
              themeMode === 'auto'
                ? 'bg-primary/20 text-primary'
                : 'bg-gray-100 dark:bg-white/10 text-tagadod-titles dark:text-tagadod-dark-titles'
            }`}
          >
            <Monitor size={20} />
            <span className="text-sm">{t('profile.auto', 'تلقائي')}</span>
          </button>
        </div>
      </BottomSheet>

      {/* Currency Sheet */}
      <BottomSheet
        open={showCurrencySheet}
        onClose={() => setShowCurrencySheet(false)}
        title={t('profile.currencyType')}
      >
        <div className="space-y-2">
          {(['USD', 'SAR', 'YER'] as const).map((c) => (
            <button
              key={c}
              onClick={() => {
                setCurrency(c)
                setShowCurrencySheet(false)
              }}
              className={`w-full py-3 rounded-xl text-start px-4 ${
                currency === c
                  ? 'bg-primary/20 text-primary'
                  : 'bg-gray-100 dark:bg-white/10 text-tagadod-titles dark:text-tagadod-dark-titles'
              }`}
            >
              {currencyLabels[c]}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  )
}
