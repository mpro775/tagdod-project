import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Package } from 'lucide-react'
import {
  CustomTabBar,
  OrderCard,
  EmptyState,
  OrderCardShimmer,
} from '../../components/shared'
import * as orderService from '../../services/orderService'
import type { OrderStatus } from '../../types/enums'

const ORDER_TABS: Array<{ key: string; labelKey: string }> = [
  { key: 'all', labelKey: 'orders.tabAll' },
  { key: 'pending_payment', labelKey: 'orders.tabPending' },
  { key: 'processing', labelKey: 'orders.tabProcessing' },
  { key: 'completed', labelKey: 'orders.tabCompleted' },
  { key: 'cancelled', labelKey: 'orders.tabCancelled' },
]

export function OrdersPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('all')

  const statusFilter =
    activeTab === 'all' ? undefined : (activeTab as OrderStatus)

  const { data, isLoading } = useQuery({
    queryKey: ['orders', activeTab],
    queryFn: () => orderService.getOrders({ status: statusFilter }),
  })

  const orders = data?.data ?? []

  const tabs = ORDER_TABS.map((tab) => ({
    key: tab.key,
    label: t(tab.labelKey, tab.key),
  }))

  return (
    <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg pb-24">
      <h2 className="text-xl font-bold text-tagadod-titles dark:text-tagadod-dark-titles px-4 pt-4 mb-2">
        {t('orders.title', 'الطلبات')}
      </h2>

      <CustomTabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <OrderCardShimmer key={i} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<Package size={56} strokeWidth={1.5} />}
            title={t('orders.empty', 'لا يوجد طلبات')}
            subtitle={t(
              'orders.emptyHint',
              'ستظهر طلباتك هنا بعد إتمام عملية الشراء',
            )}
          />
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
