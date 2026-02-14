export interface EngineerProfile {
  id: string
  userId: string
  firstName?: string
  lastName?: string
  name?: string
  avatar?: string
  bio?: string
  jobTitle?: string
  whatsapp?: string
  phone?: string
  specialties: string[]
  certifications: string[]
  rating: number
  ratingsCount: number
  completedServices: number
  successRate: number
  city?: string
  isVerified?: boolean
  joinedAt?: string
  createdAt?: string
  // Wallet & financials (only in /me endpoint)
  walletBalance: number
  totalCommissionEarnings: number
  totalEarnings: number
  // Ratings from API
  ratings: EngineerRating[]
  ratingDistribution?: number[]
  // Exchange rates
  exchangeRates?: {
    usdToYer: number
    usdToSar: number
    lastUpdatedAt?: string
  }
  // Offers profit
  offersTotalProfit?: {
    USD: number
    YER: number
    SAR: number
  }
}

export interface EngineerRating {
  id: string
  rating: number
  comment?: string
  customerName?: string
  createdAt: string
}

export interface UpdateEngineerProfileRequest {
  bio?: string
  jobTitle?: string
  whatsapp?: string
  specialties?: string[]
  certifications?: string[]
  avatar?: string
}
