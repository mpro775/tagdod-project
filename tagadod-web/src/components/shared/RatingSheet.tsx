import { useState } from 'react'
import { Star } from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { GlobalButton } from './GlobalButton'
import { GlobalTextField } from './GlobalTextField'

interface RatingSheetProps {
  open: boolean
  onClose: () => void
  onSubmit: (rating: number, comment?: string) => void
  title?: string
  loading?: boolean
}

export function RatingSheet({ open, onClose, onSubmit, title = 'تقييم الخدمة', loading }: RatingSheetProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, comment || undefined)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <div className="flex justify-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} onClick={() => setRating(i)} className="p-1">
            <Star
              size={32}
              className={i <= rating ? 'fill-tagadod-yellow text-tagadod-yellow' : 'text-gray-300 dark:text-gray-600'}
            />
          </button>
        ))}
      </div>
      <GlobalTextField
        placeholder="أضف تعليق (اختياري)"
        value={comment}
        onChange={(e) => setComment((e.target as HTMLInputElement).value)}
        multiline
        rows={3}
      />
      <div className="mt-4">
        <GlobalButton onClick={handleSubmit} disabled={rating === 0} loading={loading}>
          إرسال التقييم
        </GlobalButton>
      </div>
    </BottomSheet>
  )
}
