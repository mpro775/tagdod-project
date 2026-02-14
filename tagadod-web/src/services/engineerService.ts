import { api } from './api'
import type { EngineerProfile, EngineerRating, UpdateEngineerProfileRequest } from '../types/engineer'
import type { PaginatedResponse, PaginationParams } from '../types/common'

/* ------------------------------------------------------------------ */
/*  Normalize – same logic as mobile EngineerProfileDto.fromJson       */
/* ------------------------------------------------------------------ */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeEngineerProfile(raw: any): EngineerProfile {
  // Handle userId as populated object
  const userIdData = raw.userId
  let firstName: string | undefined
  let lastName: string | undefined
  let phone: string | undefined
  let city: string | undefined
  let userIdStr = ''

  if (userIdData && typeof userIdData === 'object') {
    firstName = userIdData.firstName
    lastName = userIdData.lastName
    phone = userIdData.phone
    city = userIdData.city
    userIdStr = userIdData._id ?? userIdData.id ?? ''
  } else if (typeof userIdData === 'string') {
    userIdStr = userIdData
  }

  // Fallback to direct fields
  firstName ??= raw.firstName
  lastName ??= raw.lastName
  phone ??= raw.phone
  city ??= raw.city

  // Build display name
  const parts = [firstName, lastName].filter(Boolean)
  const name = parts.length > 0 ? parts.join(' ') : undefined

  // Parse ratings array
  const ratings: EngineerRating[] = Array.isArray(raw.ratings)
    ? raw.ratings.map((r: Record<string, unknown>) => ({
        id: String(r._id ?? r.id ?? ''),
        rating: Number(r.score ?? r.rating ?? 0),
        comment: r.comment as string | undefined,
        customerName: r.customerName as string | undefined,
        createdAt: String(r.ratedAt ?? r.createdAt ?? ''),
      }))
    : []

  return {
    id: String(raw._id ?? raw.id ?? ''),
    userId: userIdStr,
    firstName,
    lastName,
    name,
    avatar: raw.avatarUrl ?? raw.profileImageUrl ?? raw.avatar,
    bio: raw.bio,
    jobTitle: raw.jobTitle,
    whatsapp: raw.whatsappNumber ?? raw.whatsapp,
    phone,
    specialties: Array.isArray(raw.specialties) ? raw.specialties : [],
    certifications: Array.isArray(raw.certifications) ? raw.certifications : [],
    rating: Number(raw.averageRating ?? raw.rating ?? 0),
    ratingsCount: Number(raw.totalRatings ?? raw.ratingsCount ?? 0),
    completedServices: Number(raw.totalCompletedServices ?? raw.completedServices ?? 0),
    successRate: Number(raw.completionRate ?? raw.successRate ?? 0),
    city,
    isVerified: raw.isVerified,
    joinedAt: raw.joinedAt,
    createdAt: raw.createdAt,
    walletBalance: Number(raw.walletBalance ?? 0),
    totalCommissionEarnings: Number(raw.totalCommissionEarnings ?? 0),
    totalEarnings: Number(raw.totalEarnings ?? 0),
    ratings,
    ratingDistribution: Array.isArray(raw.ratingDistribution) ? raw.ratingDistribution : undefined,
    exchangeRates: raw.exchangeRates
      ? {
          usdToYer: Number(raw.exchangeRates.usdToYer ?? raw.usdToYerRate ?? 0),
          usdToSar: Number(raw.exchangeRates.usdToSar ?? raw.usdToSarRate ?? 0),
          lastUpdatedAt: raw.exchangeRates.lastUpdatedAt,
        }
      : raw.usdToYerRate
        ? { usdToYer: Number(raw.usdToYerRate), usdToSar: Number(raw.usdToSarRate ?? 0) }
        : undefined,
    offersTotalProfit: raw.offersTotalProfit
      ? {
          USD: Number(raw.offersTotalProfit.USD ?? 0),
          YER: Number(raw.offersTotalProfit.YER ?? 0),
          SAR: Number(raw.offersTotalProfit.SAR ?? 0),
        }
      : undefined,
  }
}

/* ------------------------------------------------------------------ */
/*  API calls                                                          */
/* ------------------------------------------------------------------ */
export async function getEngineerProfile(engineerId: string): Promise<EngineerProfile> {
  const { data } = await api.get(`/engineers/profile/${engineerId}`)
  const raw = data?.data ?? data
  return normalizeEngineerProfile(raw)
}

export async function getMyEngineerProfile(): Promise<EngineerProfile> {
  const { data } = await api.get('/engineers/profile/me')
  const raw = data?.data ?? data
  return normalizeEngineerProfile(raw)
}

export async function updateMyEngineerProfile(body: UpdateEngineerProfileRequest): Promise<EngineerProfile> {
  const { data } = await api.put('/engineers/profile/me', body)
  const raw = data?.data ?? data
  return normalizeEngineerProfile(raw)
}

export async function getEngineerRatings(engineerId: string, params?: PaginationParams): Promise<PaginatedResponse<EngineerRating>> {
  const { data } = await api.get(`/engineers/profile/${engineerId}/ratings`, { params })
  // Normalize response
  const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
  const normalized: EngineerRating[] = items.map((r: Record<string, unknown>) => ({
    id: String(r._id ?? r.id ?? ''),
    rating: Number(r.score ?? r.rating ?? 0),
    comment: r.comment as string | undefined,
    customerName: r.customerName as string | undefined,
    createdAt: String(r.ratedAt ?? r.createdAt ?? ''),
  }))
  return {
    data: normalized,
    meta: data?.meta ?? { page: 1, limit: 20, total: normalized.length, totalPages: 1 },
  }
}
