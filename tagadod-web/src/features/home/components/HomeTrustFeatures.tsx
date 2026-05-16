import { useTranslation } from 'react-i18next'
import { Truck, ShieldCheck, Headphones, CreditCard } from 'lucide-react'
import { Container } from '../../../components/layout'

const features = [
  { key: 'delivery', icon: Truck },
  { key: 'warranty', icon: ShieldCheck },
  { key: 'support', icon: Headphones },
  { key: 'secure', icon: CreditCard },
] as const

export function HomeTrustFeatures() {
  const { t } = useTranslation()

  return (
    <section className="py-8 md:py-12 bg-white dark:bg-tagadod-dark-gray border-y border-gray-100 dark:border-white/5">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.key}
                className="flex items-start gap-3 md:gap-4 p-4 md:p-5 rounded-2xl bg-tagadod-light-bg dark:bg-tagadod-dark-bg border border-gray-100 dark:border-white/5 transition-shadow hover:shadow-sm"
              >
                <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon size={20} className="text-primary md:w-[22px] md:h-[22px]" />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
                    {t(`home.sections.trust.${f.key}.title`)}
                  </h3>
                  <p className="text-xs md:text-sm text-tagadod-gray mt-0.5">
                    {t(`home.sections.trust.${f.key}.subtitle`)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
