import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Wrench, MessageCircle, ArrowLeft } from 'lucide-react'
import { Container } from '../../../components/layout'
import { gradients } from '../../../theme'

export function HomeServiceSection() {
  const { t } = useTranslation()

  return (
    <section className="py-10 md:py-16">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#E4F5FF] to-[#C8EDFF] dark:from-[rgba(58,58,60,0.5)] dark:to-[#3A3A3C] p-6 md:p-10 lg:p-12">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 dark:bg-white/10 text-primary text-xs font-semibold mb-3">
                <Wrench size={14} />
                {t('layout.nav.services')}
              </div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-tagadod-titles dark:text-tagadod-dark-titles mb-2">
                {t('home.sections.service.title')}
              </h2>
              <p className="text-sm md:text-base text-tagadod-gray">
                {t('home.sections.service.subtitle')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/maintenance-orders"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium text-sm transition-transform hover:scale-105"
                style={{ background: gradients.linerGreen }}
              >
                <MessageCircle size={16} />
                {t('home.sections.service.primaryCta')}
              </Link>
              <Link
                to="/order-new-engineer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-tagadod-dark-gray border border-gray-200 dark:border-white/10 text-tagadod-titles dark:text-tagadod-dark-titles font-medium text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <Wrench size={16} />
                {t('home.sections.service.secondaryCta')}
                <ArrowLeft size={14} className="rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
