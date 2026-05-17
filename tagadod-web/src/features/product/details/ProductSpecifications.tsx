import { useTranslation } from 'react-i18next'

interface ProductSpecificationsProps {
  specifications: Record<string, string>
}

export function ProductSpecifications({ specifications }: ProductSpecificationsProps) {
  const { t } = useTranslation()
  const entries = Object.entries(specifications).filter(([, v]) => v.trim() !== '')

  if (entries.length === 0) {
    return (
      <p className="text-sm text-tagadod-gray italic">
        {t('productDetails.states.noSpecifications')}
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-white/10">
      <table className="w-full text-sm">
        <tbody>
          {entries.map(([key, value], idx) => (
            <tr
              key={key}
              className={
                idx % 2 === 0
                  ? 'bg-gray-50 dark:bg-white/5'
                  : 'bg-white dark:bg-tagadod-dark-gray'
              }
            >
              <td className="py-2.5 px-4 font-medium text-tagadod-titles dark:text-tagadod-dark-titles w-2/5">
                {key}
              </td>
              <td className="py-2.5 px-4 text-tagadod-gray">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
