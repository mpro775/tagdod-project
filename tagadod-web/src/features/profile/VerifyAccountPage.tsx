import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight, Upload, CheckCircle2 } from 'lucide-react'
import { GlobalButton, GlobalTextField } from '../../components/shared'
import { useUserStore } from '../../stores/userStore'
import * as verificationService from '../../services/verificationService'

export function VerifyAccountPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useUserStore((s) => s.user)
  const isEngineer = user?.userType === 'engineer'
  const isMerchant = user?.userType === 'merchant'

  const [cvFile, setCvFile] = useState<File | null>(null)
  const [shopName, setShopName] = useState('')
  const [shopPhoto, setShopPhoto] = useState<File | null>(null)
  const [note, setNote] = useState('')
  const [success, setSuccess] = useState(false)

  const submitMutation = useMutation({
    mutationFn: async () => {
      // In a real app, you'd upload the file first and get a URL
      const payload: verificationService.VerificationSubmission = {
        type: isEngineer ? 'engineer' : 'merchant',
        note: note.trim() || undefined,
        shopName: isMerchant ? shopName.trim() || undefined : undefined,
        // documentUrl would come from file upload
        documentUrl: cvFile?.name || shopPhoto?.name || undefined,
      }
      return verificationService.submitVerification(payload)
    },
    onSuccess: () => {
      setSuccess(true)
    },
  })

  const canSubmit = isEngineer ? !!cvFile : isMerchant ? !!shopName.trim() && !!shopPhoto : false

  if (success) {
    return (
      <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
        <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -mr-2 text-tagadod-titles dark:text-tagadod-dark-titles"
            aria-label={t('common.back')}
          >
            <ArrowRight size={24} />
          </button>
          <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
            تحقق الحساب
          </h1>
        </header>
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
            <CheckCircle2 size={40} className="text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mb-2">
            تم إرسال طلب التحقق بنجاح
          </h3>
          <p className="text-sm text-tagadod-gray max-w-xs mb-6">
            سيتم مراجعة طلبك والرد عليك في أقرب وقت ممكن.
          </p>
          <GlobalButton onClick={() => navigate('/profile')} fullWidth={false} className="px-8">
            {t('common.back', 'رجوع')}
          </GlobalButton>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -mr-2 text-tagadod-titles dark:text-tagadod-dark-titles"
          aria-label={t('common.back')}
        >
          <ArrowRight size={24} />
        </button>
        <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
          تحقق الحساب
        </h1>
      </header>

      <div className="p-4 space-y-5">
        <p className="text-sm text-tagadod-gray">
          {isEngineer
            ? 'يرجى رفع السيرة الذاتية للتحقق من حسابك كمهندس.'
            : 'يرجى إدخال بيانات المتجر للتحقق من حسابك كتاجر.'}
        </p>

        {/* Engineer: CV Upload */}
        {isEngineer && (
          <div>
            <label className="block text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles mb-1.5">
              السيرة الذاتية (CV)
            </label>
            <label className="flex flex-col items-center justify-center py-8 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <Upload size={32} className="text-tagadod-gray mb-2" />
              <span className="text-sm text-tagadod-gray">
                {cvFile ? cvFile.name : 'اضغط لرفع الملف'}
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        )}

        {/* Merchant: Shop name + photo */}
        {isMerchant && (
          <>
            <GlobalTextField
              label="اسم المتجر"
              placeholder="أدخل اسم المتجر"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles mb-1.5">
                صورة المتجر
              </label>
              <label className="flex flex-col items-center justify-center py-8 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <Upload size={32} className="text-tagadod-gray mb-2" />
                <span className="text-sm text-tagadod-gray">
                  {shopPhoto ? shopPhoto.name : 'اضغط لرفع الصورة'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setShopPhoto(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </>
        )}

        {/* Optional note */}
        <GlobalTextField
          label="ملاحظة (اختياري)"
          placeholder="أضف ملاحظة..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          multiline
          rows={3}
        />

        {/* Error */}
        {submitMutation.isError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-tagadod-red text-sm text-center">
            {(submitMutation.error as Error)?.message || 'حدث خطأ أثناء الإرسال'}
          </div>
        )}

        <GlobalButton
          onClick={() => submitMutation.mutate()}
          loading={submitMutation.isPending}
          disabled={!canSubmit}
          className="mt-4"
        >
          إرسال طلب التحقق
        </GlobalButton>
      </div>
    </div>
  )
}
