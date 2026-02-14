import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft,
  Phone,
  MessageCircle,
  Star,
  X,
  Plus,
  Edit,
  CheckCircle,
  TrendingUp,
  Wallet,
  Banknote,
  Info,
  User,
} from 'lucide-react'
import { GlobalButton, GlobalTextField, ListShimmer, EmptyState } from '../../components/shared'
import {
  getEngineerProfile,
  getMyEngineerProfile,
  updateMyEngineerProfile,
  getEngineerRatings,
} from '../../services/engineerService'
import type { EngineerProfile, EngineerRating } from '../../types/engineer'

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */
function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="flex-1 rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-4">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon size={22} style={{ color }} />
      </div>
      <p className="text-2xl font-bold text-tagadod-titles dark:text-tagadod-dark-titles">
        {value}
      </p>
      <p className="text-xs text-tagadod-gray mt-1">{title}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Section Card wrapper                                                */
/* ------------------------------------------------------------------ */
function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-5">
      <h3 className="text-base font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mb-3">
        {title}
      </h3>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Rating Item                                                        */
/* ------------------------------------------------------------------ */
function RatingItem({ r }: { r: EngineerRating }) {
  const letter = r.customerName ? r.customerName.charAt(0) : 'ع'
  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 dark:border-white/5 last:border-0">
      <div className="w-10 h-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-sm font-semibold text-primary">{letter}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles">
            {r.customerName ?? 'عميل'}
          </span>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                size={12}
                className={
                  i < r.rating
                    ? 'fill-amber-500 text-amber-500'
                    : 'text-gray-300 dark:text-white/20'
                }
              />
            ))}
          </div>
        </div>
        {r.comment && (
          <p className="text-sm text-tagadod-gray leading-relaxed">{r.comment}</p>
        )}
        <p className="text-xs text-tagadod-gray mt-1">
          {formatRelativeDate(r.createdAt)}
        </p>
      </div>
    </div>
  )
}

function formatRelativeDate(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays === 0) {
    const diffHrs = Math.floor(diffMs / 3600000)
    if (diffHrs === 0) {
      const diffMins = Math.floor(diffMs / 60000)
      return diffMins <= 0 ? 'الآن' : `منذ ${diffMins} دقيقة`
    }
    return `منذ ${diffHrs} ساعة`
  }
  if (diffDays < 7) return `منذ ${diffDays} يوم`
  if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسبوع`
  if (diffDays < 365) return `منذ ${Math.floor(diffDays / 30)} شهر`
  return `منذ ${Math.floor(diffDays / 365)} سنة`
}

/* ================================================================== */
/*  Main Page                                                          */
/* ================================================================== */
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

  const externalRatings = ratingsQuery.data?.data ?? []
  // Use profile.ratings if populated, otherwise fallback to separate query
  const ratings =
    profile?.ratings && profile.ratings.length > 0
      ? profile.ratings
      : externalRatings

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
    ([profile?.firstName, profile?.lastName].filter(Boolean).join(' ') ||
    t('common.engineer', 'مهندس'))

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

  const joinDateDesc = (() => {
    const d = profile?.joinedAt ?? profile?.createdAt
    if (!d) return null
    const date = new Date(d)
    if (isNaN(date.getTime())) return null
    const days = Math.floor((Date.now() - date.getTime()) / 86400000)
    if (days < 30) return `انضم منذ ${days} يوم`
    if (days < 365) return `انضم منذ ${Math.floor(days / 30)} شهر`
    return `انضم منذ ${Math.floor(days / 365)} سنة`
  })()

  // ─── loading ──────────────────────────────────────────────────────
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
        <Header
          title={t('engineerProfile.title', 'بروفايل المهندس')}
          onBack={() => navigate(-1)}
        />
        <div className="p-4">
          <ListShimmer count={4} />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
        <Header title="" onBack={() => navigate(-1)} />
        <EmptyState title={t('common.notFound', 'غير موجود')} />
      </div>
    )
  }

  // ─── edit mode render ─────────────────────────────────────────────
  if (isMyProfile && isEditing) {
    return (
      <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg pb-24">
        <Header
          title={t('engineerProfile.editTitle', 'تعديل البروفايل')}
          onBack={() => setIsEditing(false)}
        />
        <form
          onSubmit={(e) => {
            e.preventDefault()
            updateMutation.mutate()
          }}
          className="p-4 space-y-4"
        >
          <GlobalTextField
            label={t('engineerProfile.avatarUrl', 'رابط الصورة الشخصية')}
            placeholder="https://..."
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />
          <GlobalTextField
            label={t('engineerProfile.jobTitleLabel', 'المسمى الوظيفي')}
            placeholder={t('engineerProfile.jobTitleHint', 'مثال: مهندس كهرباء')}
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
          <GlobalTextField
            label={t('engineerProfile.bioLabel', 'نبذة تعريفية')}
            placeholder={t('engineerProfile.bioHint', 'اكتب نبذة عن خبراتك...')}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            multiline
            rows={4}
          />
          <GlobalTextField
            label={t('engineerProfile.whatsappLabel', 'رقم الواتساب')}
            placeholder="+967..."
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />

          {/* Specialties */}
          <div>
            <label className="block text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles mb-1.5">
              التخصصات
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
                placeholder="أضف تخصص..."
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
              الشهادات
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
                placeholder="أضف شهادة..."
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

          <GlobalButton type="submit" loading={updateMutation.isPending} className="mt-6">
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
    <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg pb-24">
      <Header
        title={t('engineerProfile.title', 'بروفايل المهندس')}
        onBack={() => (isMyProfile ? navigate('/profile') : navigate(-1))}
        trailing={
          isMyProfile ? (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <Edit size={20} className="text-tagadod-gray" />
            </button>
          ) : undefined
        }
      />

      <div className="p-4 space-y-4">
        {/* ========== Header Card ========== */}
        <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-6 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 overflow-hidden">
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <User size={48} className="text-primary" />
            )}
          </div>
          <h3 className="text-xl font-bold text-tagadod-titles dark:text-tagadod-dark-titles text-center">
            {displayName}
          </h3>
          {profile.jobTitle && (
            <p className="text-sm text-tagadod-gray mt-1">{profile.jobTitle}</p>
          )}
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1">
              <Star size={18} className="fill-amber-500 text-amber-500" />
              <span className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
                {profile.rating.toFixed(1)}
              </span>
              <span className="text-xs text-tagadod-gray">
                ({profile.ratingsCount} تقييم)
              </span>
            </div>
            {profile.city && (
              <>
                <span className="text-tagadod-gray">•</span>
                <span className="text-sm text-tagadod-gray">{profile.city}</span>
              </>
            )}
          </div>
          {joinDateDesc && (
            <p className="text-xs text-tagadod-gray mt-2">{joinDateDesc}</p>
          )}
        </div>

        {/* ========== Statistics ========== */}
        <div>
          <h3 className="text-base font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mb-3 flex items-center gap-2">
            الإحصائيات
          </h3>
          <div className="flex gap-3 mb-3">
            <StatCard
              title="الخدمات المكتملة"
              value={String(profile.completedServices)}
              icon={CheckCircle}
              color="#8BC543"
            />
            <StatCard
              title="نسبة النجاح"
              value={`${profile.successRate.toFixed(1)}%`}
              icon={TrendingUp}
              color="#159647"
            />
          </div>
          <StatCard
            title="التقييمات"
            value={String(profile.ratingsCount)}
            icon={Star}
            color="#8BC543"
          />
        </div>

        {/* ========== Wallet & Commission (only /me) ========== */}
        {isMyProfile && profile.exchangeRates && profile.exchangeRates.usdToYer > 0 && (
          <div>
            <h3 className="text-base font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mb-3 flex items-center gap-2">
              المحفظة والعمولات
              <button className="p-1 rounded-full bg-primary/10">
                <Info size={14} className="text-primary" />
              </button>
            </h3>
            <div className="flex gap-3 mb-3">
              <StatCard
                title="الرصيد الحالي"
                value={`${Math.round(profile.walletBalance * profile.exchangeRates.usdToYer)} ر.ي`}
                icon={Wallet}
                color="#159647"
              />
              <StatCard
                title="إجمالي العمولات"
                value={`${Math.round(profile.totalCommissionEarnings * profile.exchangeRates.usdToYer)} ر.ي`}
                icon={Banknote}
                color="#F59E0B"
              />
            </div>
            {profile.offersTotalProfit && (
              <>
                <h4 className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mb-2">
                  أرباح العروض
                </h4>
                <div className="flex gap-3 mb-3">
                  <StatCard
                    title="بالريال اليمني"
                    value={`${Math.round(profile.offersTotalProfit.YER || (profile.offersTotalProfit.USD * profile.exchangeRates.usdToYer))} ر.ي`}
                    icon={TrendingUp}
                    color="#8BC543"
                  />
                  <StatCard
                    title="بالدولار"
                    value={`${profile.offersTotalProfit.USD.toFixed(2)} $`}
                    icon={Banknote}
                    color="#159647"
                  />
                </div>
                <StatCard
                  title="بالريال السعودي"
                  value={`${(profile.offersTotalProfit.SAR || (profile.offersTotalProfit.USD * profile.exchangeRates.usdToSar)).toFixed(2)} ر.س`}
                  icon={Banknote}
                  color="#F59E0B"
                />
              </>
            )}
          </div>
        )}

        {/* ========== Bio ========== */}
        {profile.bio && (
          <SectionCard title="نبذة عن المهندس">
            <p className="text-sm text-tagadod-gray leading-relaxed">{profile.bio}</p>
          </SectionCard>
        )}

        {/* ========== Specialties ========== */}
        {profile.specialties.length > 0 && (
          <SectionCard title="التخصصات">
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
          </SectionCard>
        )}

        {/* ========== Certifications ========== */}
        {profile.certifications.length > 0 && (
          <SectionCard title="الشهادات">
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
          </SectionCard>
        )}

        {/* ========== Contact Info ========== */}
        <SectionCard title="معلومات الاتصال">
          {profile.phone ? (
            <div className="flex items-center gap-3 mb-3">
              <Phone size={18} className="text-primary" />
              <span className="text-sm text-tagadod-titles dark:text-tagadod-dark-titles" dir="ltr">
                {profile.phone}
              </span>
            </div>
          ) : null}
          {profile.whatsapp ? (
            <div className="flex items-center gap-3">
              <MessageCircle size={18} className="text-primary" />
              <span className="text-sm text-tagadod-titles dark:text-tagadod-dark-titles" dir="ltr">
                {profile.whatsapp}
              </span>
            </div>
          ) : null}
          {!profile.phone && !profile.whatsapp && (
            <p className="text-sm text-tagadod-gray text-center">لا توجد معلومات اتصال</p>
          )}
        </SectionCard>

        {/* ========== Contact Buttons (other profile) ========== */}
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
                واتساب
              </a>
            )}
            {profile.phone && (
              <a
                href={`tel:${profile.phone}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-semibold"
              >
                <Phone size={20} />
                اتصال
              </a>
            )}
          </div>
        )}

        {/* ========== Ratings ========== */}
        <SectionCard title={`التقييمات (${profile.ratingsCount})`}>
          {ratingsQuery.isLoading && !profile.ratings?.length ? (
            <ListShimmer count={2} />
          ) : ratings.length === 0 ? (
            <div className="flex flex-col items-center py-4">
              <Star size={40} className="text-tagadod-gray/30 mb-2" />
              <p className="text-sm text-tagadod-gray">لا توجد تقييمات بعد</p>
            </div>
          ) : (
            ratings.map((r) => <RatingItem key={r.id} r={r} />)
          )}
        </SectionCard>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Header bar                                                         */
/* ------------------------------------------------------------------ */
function Header({
  title,
  onBack,
  trailing,
}: {
  title: string
  onBack: () => void
  trailing?: React.ReactNode
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 -mr-2">
          <ChevronLeft
            size={24}
            className="rtl:rotate-0 ltr:rotate-180 text-tagadod-titles dark:text-tagadod-dark-titles"
          />
        </button>
        <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
          {title}
        </h1>
      </div>
      {trailing}
    </header>
  )
}
