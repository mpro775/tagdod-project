import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ShoppingBag, Grid3X3, Truck, ShieldCheck, Headphones, CreditCard } from 'lucide-react'
import { Container } from '../../../components/layout'
import { gradients } from '../../../theme'

export function HomeHeroSection() {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#E4F5FF]/60 to-transparent dark:from-[rgba(30,153,211,0.08)] dark:to-transparent py-8 md:py-14 lg:py-20">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Text content */}
          <div className="order-2 lg:order-1 text-center lg:text-start">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <ShoppingBag size={14} />
              {t('home.hero.eyebrow')}
            </span>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-tagadod-titles dark:text-tagadod-dark-titles leading-tight mb-4">
              {t('home.hero.title')}
            </h1>

            <p className="text-base md:text-lg text-tagadod-gray max-w-lg mx-auto lg:mx-0 mb-6">
              {t('home.hero.subtitle')}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium text-sm transition-transform hover:scale-105"
                style={{ background: gradients.linerGreen }}
              >
                <ShoppingBag size={18} />
                {t('home.hero.primaryCta')}
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-tagadod-dark-gray border border-gray-200 dark:border-white/10 text-tagadod-titles dark:text-tagadod-dark-titles font-medium text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <Grid3X3 size={18} />
                {t('home.hero.secondaryCta')}
              </Link>
            </div>

            {/* Mini trust metrics */}
            <div className="hidden md:flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-tagadod-gray">
              <span className="inline-flex items-center gap-1.5">
                <Truck size={14} className="text-primary" />
                {t('home.sections.trust.delivery.title')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-primary" />
                {t('home.sections.trust.warranty.title')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Headphones size={14} className="text-primary" />
                {t('home.sections.trust.support.title')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CreditCard size={14} className="text-primary" />
                {t('home.sections.trust.secure.title')}
              </span>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="order-1 lg:order-2 flex items-center justify-center">
            <div className="relative w-full max-w-md lg:max-w-full aspect-square max-h-[420px]">
              {/* Background gradient card */}
              <div
                className="absolute inset-0 rounded-3xl opacity-90"
                style={{ background: gradients.linerBlue }}
              />
              {/* Decorative circles */}
              <div className="absolute top-6 end-6 w-24 h-24 rounded-full bg-white/30 dark:bg-white/10 blur-2xl" />
              <div className="absolute bottom-8 start-8 w-32 h-32 rounded-full bg-primary/20 blur-3xl" />

              {/* Content inside visual card */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white dark:bg-tagadod-dark-gray shadow-lg flex items-center justify-center mb-4">
                  <ShoppingBag size={40} className="text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-tagadod-titles dark:text-tagadod-dark-titles mb-2">
                  {t('home.hero.eyebrow')}
                </h3>
                <p className="text-sm text-tagadod-gray max-w-xs">
                  {t('home.hero.subtitle')}
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-medium text-primary">
                  <span>{t('home.hero.primaryCta')}</span>
                  <ArrowLeft size={14} className="rtl:rotate-180" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
