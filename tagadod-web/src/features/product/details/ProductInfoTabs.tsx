import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ProductDescription } from './ProductDescription'
import { ProductSpecifications } from './ProductSpecifications'
import type { Product } from '../../../types/product'

interface ProductInfoTabsProps {
  description?: string
  specifications?: Record<string, string>
  product: Product
}

type TabKey = 'description' | 'specifications' | 'shipping'

export function ProductInfoTabs({
  description,
  specifications,
  product,
}: ProductInfoTabsProps) {
  const { t } = useTranslation()

  const tabs: { key: TabKey; label: string; hasContent: boolean }[] = [
    { key: 'description', label: t('productDetails.tabs.description'), hasContent: !!description },
    { key: 'specifications', label: t('productDetails.tabs.specifications'), hasContent: !!specifications && Object.keys(specifications).length > 0 },
    { key: 'shipping', label: t('productDetails.tabs.shippingReturns'), hasContent: true },
  ]

  const visibleTabs = tabs.filter((t) => t.hasContent)
  if (visibleTabs.length === 0) return null

  const [activeTab, setActiveTab] = useState<TabKey>(visibleTabs[0].key)

  return (
    <div>
      {/* Desktop tabs */}
      <div className="hidden md:flex gap-1 border-b border-gray-100 dark:border-white/10 mb-6">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-tagadod-gray hover:text-tagadod-titles dark:hover:text-tagadod-dark-titles'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mobile accordion */}
      <div className="md:hidden space-y-3">
        {visibleTabs.map((tab) => (
          <MobileAccordionItem
            key={tab.key}
            label={tab.label}
            isOpen={activeTab === tab.key}
            onToggle={() => setActiveTab(activeTab === tab.key ? '' as TabKey : tab.key)}
          >
            <TabContent tabKey={tab.key} description={description} specifications={specifications} t={t} product={product} />
          </MobileAccordionItem>
        ))}
      </div>

      {/* Desktop content */}
      <div className="hidden md:block">
        <TabContent tabKey={activeTab} description={description} specifications={specifications} t={t} product={product} />
      </div>
    </div>
  )
}

function MobileAccordionItem({
  label,
  isOpen,
  onToggle,
  children,
}: {
  label: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        <span>{label}</span>
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  )
}

function TabContent({
  tabKey,
  description,
  specifications,
  t,
  product: _product,
}: {
  tabKey: TabKey
  description?: string
  specifications?: Record<string, string>
  t: (key: string) => string
  product: Product
}) {
  switch (tabKey) {
    case 'description':
      return description ? <ProductDescription description={description} /> : null
    case 'specifications':
      return specifications ? <ProductSpecifications specifications={specifications} /> : null
    case 'shipping':
      return (
        <p className="text-sm text-tagadod-gray leading-relaxed">
          {t('productDetails.shippingReturns.text')}
        </p>
      )
    default:
      return null
  }
}
