import { useTranslation } from 'react-i18next'

interface ProductDescriptionProps {
  description: string
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  const { t } = useTranslation()

  if (!description) {
    return (
      <p className="text-sm text-tagadod-gray italic">
        {t('productDetails.states.noDescription')}
      </p>
    )
  }

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      {description.split('\n').map((paragraph, idx) => (
        <p key={idx} className="text-sm text-tagadod-gray leading-relaxed mb-2 last:mb-0">
          {paragraph}
        </p>
      ))}
    </div>
  )
}
