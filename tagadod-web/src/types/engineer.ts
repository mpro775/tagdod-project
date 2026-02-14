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
  specialties?: string[]
  certifications?: string[]
  rating?: number
  ratingsCount?: number
  completedServices?: number
  city?: string
  isVerified?: boolean
  createdAt?: string
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
