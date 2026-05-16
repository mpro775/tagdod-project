import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { cn } from '../../../utils'

interface ProductImageProps {
  src?: string
  alt?: string
  className?: string
  aspectRatio?: 'square' | '4/3' | 'video'
  priority?: boolean
}

export function ProductImage({
  src,
  alt = '',
  className,
  aspectRatio = 'square',
  priority = false,
}: ProductImageProps) {
  const [error, setError] = useState(false)

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === '4/3'
        ? 'aspect-[4/3]'
        : 'aspect-video'

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-tagadod-bottom-bar-light dark:bg-tagadod-bottom-bar-dark',
        aspectClass,
        className,
      )}
    >
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading={priority ? 'eager' : 'lazy'}
          onError={() => setError(true)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-tagadod-gray/60 gap-2">
          <ImageOff size={28} strokeWidth={1.5} />
          <span className="text-xs">—</span>
        </div>
      )}
    </div>
  )
}
