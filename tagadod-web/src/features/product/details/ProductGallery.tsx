import { useState } from 'react'
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'
import { ProductGalleryThumbnail } from './ProductGalleryThumbnail'

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const safeImages = images?.length ? images : []

  if (!safeImages.length) {
    return (
      <div className="aspect-square bg-tagadod-bottom-bar-light dark:bg-tagadod-bottom-bar-dark rounded-2xl flex flex-col items-center justify-center mb-4 border border-gray-100 dark:border-white/10">
        <ImageOff size={48} className="text-tagadod-gray/40 mb-2" />
        <span className="text-tagadod-gray text-sm">No image available</span>
      </div>
    )
  }

  const goToPrev = () => setActiveIdx((p) => (p - 1 + safeImages.length) % safeImages.length)
  const goToNext = () => setActiveIdx((p) => (p + 1) % safeImages.length)

  return (
    <div>
      {/* Main image */}
      <div className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-white dark:bg-tagadod-dark-gray group border border-gray-100 dark:border-white/10">
        <img
          src={safeImages[activeIdx]}
          alt={productName}
          className="w-full h-full object-contain p-3 md:p-6 transition-opacity duration-200"
          loading={activeIdx === 0 ? 'eager' : 'lazy'}
        />

        {safeImages.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              aria-label="Previous image"
              className="absolute start-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 dark:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-black/70"
            >
              <ChevronRight size={20} className="rtl:hidden text-tagadod-titles" />
              <ChevronLeft size={20} className="hidden rtl:block text-tagadod-titles" />
            </button>
            <button
              onClick={goToNext}
              aria-label="Next image"
              className="absolute end-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 dark:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-black/70"
            >
              <ChevronLeft size={20} className="rtl:hidden text-tagadod-titles" />
              <ChevronRight size={20} className="hidden rtl:block text-tagadod-titles" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {safeImages.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1" role="tablist" aria-label="Product images">
          {safeImages.map((img, idx) => (
            <ProductGalleryThumbnail
              key={idx}
              src={img}
              alt={`${productName} - image ${idx + 1}`}
              isActive={idx === activeIdx}
              onClick={() => setActiveIdx(idx)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
