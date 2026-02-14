import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Phone, MessageCircle, Star, X, Plus } from 'lucide-react'
import { GlobalButton, GlobalTextField, ListShimmer, EmptyState } from '../../components/shared'
import {
  getEngineerProfile,
  getMyEngineerProfile,
  updateMyEngineerProfile,
  getEngineerRatings,
} from '../../services/engineerService'
import type { EngineerProfile } from '../../types/engineer'

export function EngineerProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const location = useLocation()
  const [params] = useSearchParams()
  const engineerId = params.get('engineerId')
  const isMyProfile = location.pathname.includes('my-engineer') || !engineerId

  // ─── editing state ────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false)
  const [bio, setBio] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [specialties, setSpecialties] = useState<string[]>([])
  const [certifications, setCertifications] = useState<string[]>([])
  const [avatar, setAvatar] = useState('')
  const [newSpecialty, setNewSpecialty] = useState('')
  const [newCertification, setNewCertification] = useState('')
  const [initialized, setInitialized] = useState(false)

  // ─── queries ──────────────────────────────────────────────────────
  const myProfileQuery = useQuery({
    queryKey: ['myEngineerProfile'],
    queryFn: getMyEngineerProfile,
    enabled: isMyProfile,
  })

  const otherProfileQuery = useQuery({
    queryKey: ['engineerProfile', engineerId],
    queryFn: () => getEngineerProfile(engineerId!),
    enabled: !isMyProfile && !!engineerId,
  })

  const profile: EngineerProfile | undefined = isMyProfile
    ? myProfileQuery.data
    : otherProfileQuery.data

  const profileLoading = isMyProfile
    ? myProfileQuery.isLoading
    : otherProfileQuery.isLoading

  const resolvedEngineerId = isMyProfile ? profile?.id : engineerId

  const ratingsQuery = useQuery({
    queryKey: ['engineerRatings', resolvedEngineerId],
    queryFn: () => getEngineerRatings(resolvedEngineerId!),
    enabled: !!resolvedEngineerId,
  })

  const ratings = ratingsQuery.data?.data ?? []

  // pre-fill edit form when data arrives
  useEffect(() => {
    if (profile && !initialized) {
      setBio(profile.bio ?? '')
      setJobTitle(profile.jobTitle ?? '')
      setWhatsapp(profile.whatsapp ?? '')
      setSpecialties(profile.specialties ?? [])
      setCertifications(profile.certifications ?? [])
      setAvatar(profile.avatar ?? '')
      setInitialized(true)
    }
  }, [profile, initialized])

  // ─── mutation ─────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: () =>
      updateMyEngineerProfile({
        bio: bio.trim() || undefined,
        jobTitle: jobTitle.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        specialties: specialties.length > 0 ? specialties : undefined,
        certifications: certifications.length > 0 ? certifications : undefined,
        avatar: avatar.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myEngineerProfile'] })
      setIsEditing(false)
    },
  })

  // ─── helpers ──────────────────────────────────────────────────────
  const displayName =
    profile?.name ??
    [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') ??
    t('common.engineer', 'مهندس')

  const addSpecialty = () => {
    const v = newSpecialty.trim()
    if (v && !specialties.includes(v)) {
      setSpecialties((prev) => [...prev, v])
      setNewSpecialty('')
    }
  }

  const removeSpecialty = (index: number) =>
    setSpecialties((prev) => prev.filter((_, i) => i !== index))

  const addCertification = () => {
    const v = newCertification.trim()
    if (v && !certifications.includes(v)) {
      setCertifications((prev) => [...prev, v])
      setNewCertification('')
    }
  }

  const removeCertification = (index: number) =>
    setCertifications((prev) => prev.filter((_, i) => i !== index))

  // ─── loading ──────────────────────────────────────────────────────
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
        <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
          <button onClick={() => navigate(-1)} className="p-2 -mr-2">
            <ChevronLeft size={24} className="rotate-180 text-tagadod-titles dark:text-tagadod-dark-titles" />
          </button>
          <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
            {t('engineerProfile.title', 'بروفايل المهندس')}
          </h1>
        </header>
        <div className="p-4">
          <ListShimmer count={4} />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
        <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
          <button onClick={() => navigate(-1)} className="p-2 -mr-2">
            <ChevronLeft size={24} className="rotate-180 text-tagadod-titles dark:text-tagadod-dark-titles" />
          </button>
        </header>
        <EmptyState title={t('common.notFound', 'غير موجود')} />
      </div>
    )
  }

  // ─── edit mode render ─────────────────────────────────────────────
  if (isMyProfile && isEditing) {
    return (
      <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg pb-6">
        <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
          <button onClick={() => setIsEditing(false)} className="p-2 -mr-2">
            <ChevronLeft size={24} className="rotate-180 text-tagadod-titles dark:text-tagadod-dark-titles" />
          </button>
          <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
            {t('engineerProfile.editTitle', 'تعديل البروفايل')}
          </h1>
        </header>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            updateMutation.mutate()
          }}
          className="p-4 space-y-4"
        >
          {/* Avatar URL */}
          <GlobalTextField
            label={t('engineerProfile.avatarUrl', 'رابط الصورة الشخصية')}
            placeholder="https://..."
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />

          {/* Job title */}
          <GlobalTextField
            label={t('engineerProfile.jobTitleLabel', 'المسمى الوظيفي')}
            placeholder={t('engineerProfile.jobTitleHint', 'مثال: مهندس كهرباء')}
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />

          {/* Bio */}
          <GlobalTextField
            label={t('engineerProfile.bioLabel', 'نبذة تعريفية')}
            placeholder={t('engineerProfile.bioHint', 'اكتب نبذة عن خبراتك...')}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            multiline
            rows={4}
          />

          {/* WhatsApp */}
          <GlobalTextField
            label={t('engineerProfile.whatsappLabel', 'رقم الواتساب')}
            placeholder="+967..."
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />

          {/* Specialties */}
          <div>
            <label className="block text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles mb-1.5">
              {t('engineerProfile.specialtiesLabel', 'التخصصات')}
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {specialties.map((s, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm"
                >
                  {s}
                  <button type="button" onClick={() => removeSpecialty(i)}>
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSpecialty()
                  }
                }}
                placeholder={t('engineerProfile.addSpecialty', 'أضف تخصص...')}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-tagadod-titles dark:text-tagadod-dark-titles text-sm border-0 focus:ring-2 focus:ring-primary outline-none"
              />
              <button
                type="button"
                onClick={addSpecialty}
                className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Certifications */}
          <div>
            <label className="block text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles mb-1.5">
              {t('engineerProfile.certificationsLabel', 'الشهادات')}
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {certifications.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm"
                >
                  {c}
                  <button type="button" onClick={() => removeCertification(i)}>
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCertification()
                  }
                }}
                placeholder={t('engineerProfile.addCertification', 'أضف شهادة...')}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-tagadod-titles dark:text-tagadod-dark-titles text-sm border-0 focus:ring-2 focus:ring-primary outline-none"
              />
              <button
                type="button"
                onClick={addCertification}
                className="p-2.5 rounded-xl bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Submit */}
          <GlobalButton
            type="submit"
            loading={updateMutation.isPending}
            className="mt-6"
          >
            {t('common.save', 'حفظ التعديلات')}
          </GlobalButton>

          {updateMutation.isError && (
            <p className="text-sm text-tagadod-red text-center">
              {t('common.errorOccurred', 'حدث خطأ، حاول مرة أخرى')}
            </p>
          )}
        </form>
      </div>
    )
  }

  // ─── view mode render ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg pb-6">
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
        <button
          onClick={() => (isMyProfile ? navigate('/profile') : navigate(-1))}
          className="p-2 -mr-2"
        >
          <ChevronLeft size={24} className="rotate-180 text-tagadod-titles dark:text-tagadod-dark-titles" />
        </button>
        <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
          {t('engineerProfile.title', 'بروفايل المهندس')}
        </h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Avatar + name */}
        <div className="flex flex-col items-center py-6">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4 overflow-hidden">
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-primary">
                {displayName.charAt(0)}
              </span>
            )}
          </div>
          <h3 className="text-xl font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
            {displayName}
          </h3>
          {profile.jobTitle && (
            <p className="text-sm text-tagadod-gray mt-1">{profile.jobTitle}</p>
          )}
          <div className="flex items-center gap-4 mt-2">
            {profile.rating != null && (
              <span className="flex items-center gap-1 text-tagadod-gray">
                <Star size={16} className="fill-tagadod-yellow text-tagadod-yellow" />
                {profile.rating.toFixed(1)}
                {profile.ratingsCount != null && (
                  <span className="text-xs">({profile.ratingsCount})</span>
                )}
              </span>
            )}
            {profile.city && (
              <span className="text-sm text-tagadod-gray">{profile.city}</span>
            )}
          </div>
        </div>

        {/* Stats card */}
        <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-tagadod-gray">
              {t('engineerProfile.completedServices', 'الخدمات المنجزة')}
            </span>
            <span className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
              {profile.completedServices ?? 0}
            </span>
          </div>
          {profile.isVerified != null && (
            <div className="flex justify-between">
              <span className="text-sm text-tagadod-gray">
                {t('engineerProfile.verificationStatus', 'حالة التوثيق')}
              </span>
              <span
                className={`text-sm font-semibold ${
                  profile.isVerified ? 'text-green-600 dark:text-green-400' : 'text-tagadod-gray'
                }`}
              >
                {profile.isVerified
                  ? t('engineerProfile.verified', 'موثّق')
                  : t('engineerProfile.notVerified', 'غير موثّق')}
              </span>
            </div>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-4">
            <h3 className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mb-2">
              {t('engineerProfile.bioLabel', 'نبذة تعريفية')}
            </h3>
            <p className="text-sm text-tagadod-titles dark:text-tagadod-dark-titles leading-relaxed">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Specialties */}
        {profile.specialties && profile.specialties.length > 0 && (
          <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-4">
            <h3 className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mb-3">
              {t('engineerProfile.specialtiesLabel', 'التخصصات')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.specialties.map((s, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {profile.certifications && profile.certifications.length > 0 && (
          <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-4">
            <h3 className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mb-3">
              {t('engineerProfile.certificationsLabel', 'الشهادات')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.certifications.map((c, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contact buttons (other profile view) */}
        {!isMyProfile && (
          <div className="flex gap-3">
            {profile.whatsapp && (
              <a
                href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] text-white font-semibold"
              >
                <MessageCircle size={20} />
                {t('engineerProfile.whatsapp', 'واتساب')}
              </a>
            )}
            {profile.phone && (
              <a
                href={`tel:${profile.phone}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-semibold"
              >
                <Phone size={20} />
                {t('engineerProfile.call', 'اتصال')}
              </a>
            )}
          </div>
        )}

        {/* Edit button (my profile) */}
        {isMyProfile && (
          <GlobalButton
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            {t('engineerProfile.editProfile', 'تعديل البروفايل')}
          </GlobalButton>
        )}

        {/* Ratings section */}
        <div>
          <h3 className="text-base font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mb-3">
            {t('engineerProfile.ratings', 'التقييمات')} ({ratings.length})
          </h3>

          {ratingsQuery.isLoading ? (
            <ListShimmer count={2} />
          ) : ratings.length === 0 ? (
            <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-4">
              <p className="text-sm text-tagadod-gray text-center">
                {t('engineerProfile.noRatings', 'لا توجد تقييمات بعد')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {ratings.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
                      {r.customerName ?? t('common.customer', 'عميل')}
                    </span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < r.rating
                              ? 'fill-tagadod-yellow text-tagadod-yellow'
                              : 'text-gray-300 dark:text-white/20'
                          }
                        />
                      ))}
                    </div>
                  </div>
                  {r.comment && (
                    <p className="text-sm text-tagadod-titles dark:text-tagadod-dark-titles mb-1">
                      {r.comment}
                    </p>
                  )}
                  <p className="text-xs text-tagadod-gray">
                    {new Date(r.createdAt).toLocaleDateString('ar')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
