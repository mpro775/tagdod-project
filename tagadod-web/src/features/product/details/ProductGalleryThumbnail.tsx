interface ProductGalleryThumbnailProps {
  src: string
  alt: string
  isActive: boolean
  onClick: () => void
}

export function ProductGalleryThumbnail({ src, alt, isActive, onClick }: ProductGalleryThumbnailProps) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={isActive}
      aria-label={alt}
      className={`flex-shrink-0 w-14 h-14 md:w-18 md:h-18 rounded-lg overflow-hidden border-2 transition-all ${
        isActive
          ? 'border-primary ring-2 ring-primary/20'
          : 'border-transparent hover:border-tagadod-gray/30'
      }`}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain bg-white dark:bg-tagadod-dark-gray"
        loading="lazy"
      />
    </button>
  )
}
