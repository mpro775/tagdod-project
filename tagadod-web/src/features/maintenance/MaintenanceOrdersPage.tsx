import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import {
  CustomTabBar,
  ServiceRequestCard,
  EmptyState,
  GlobalButton,
  ListShimmer,
} from '../../components/shared'
import {
  getMyRequestsNoOffers,
  getMyRequestsWithOffers,
  getMyRequestsWithAccepted,
} from '../../services/maintenanceService'

const TABS = [
  { key: 'no-offers', label: 'بدون عروض' },
  { key: 'with-offers', label: 'مع عروض' },
  { key: 'accepted', label: 'مقبولة' },
] as const

type TabKey = (typeof TABS)[number]['key']

export function MaintenanceOrdersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabKey>('no-offers')

  // ─── queries per tab ───────────────────────────────────────────────
  const noOffersQuery = useQuery({
    queryKey: ['myRequests', 'no-offers'],
    queryFn: () => getMyRequestsNoOffers(),
    enabled: activeTab === 'no-offers',
  })

  const withOffersQuery = useQuery({
    queryKey: ['myRequests', 'with-offers'],
    queryFn: () => getMyRequestsWithOffers(),
    enabled: activeTab === 'with-offers',
  })

  const acceptedQuery = useQuery({
    queryKey: ['myRequests', 'accepted'],
    queryFn: () => getMyRequestsWithAccepted(),
    enabled: activeTab === 'accepted',
  })

  const queryMap: Record<TabKey, typeof noOffersQuery> = {
    'no-offers': noOffersQuery,
    'with-offers': withOffersQuery,
    accepted: acceptedQuery,
  }

  const current = queryMap[activeTab]
  const requests = current.data?.data ?? []

  // ─── render ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
      {/* header */}
      <div className="sticky top-0 z-10 bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="text-xl font-bold text-tagadod-titles dark:text-tagadod-dark-titles">
            {t('maintenanceOrders.title', 'طلبات الصيانة')}
          </h2>
        </div>

        <CustomTabBar
          tabs={TABS.map((tab) => ({ key: tab.key, label: tab.label }))}
          activeTab={activeTab}
          onTabChange={(key) => setActiveTab(key as TabKey)}
        />
      </div>

      {/* content */}
      <div className="p-4 space-y-3">
        {current.isLoading ? (
          <ListShimmer count={4} />
        ) : requests.length === 0 ? (
          <EmptyState
            title={
              activeTab === 'no-offers'
                ? t('maintenanceOrders.noRequestsNoOffers', 'لا توجد طلبات بدون عروض')
                : activeTab === 'with-offers'
                  ? t('maintenanceOrders.noRequestsWithOffers', 'لا توجد طلبات مع عروض')
                  : t('maintenanceOrders.noAcceptedRequests', 'لا توجد طلبات مقبولة')
            }
            subtitle={t('maintenanceOrders.noOrdersSubtitle', 'يمكنك طلب مهندس جديد الآن')}
            action={
              <GlobalButton
                fullWidth={false}
                onClick={() => navigate('/order-new-engineer')}
              >
                {t('maintenanceOrders.orderNew', 'طلب مهندس جديد')}
              </GlobalButton>
            }
          />
        ) : (
          requests.map((req) => (
            <ServiceRequestCard key={req.id} request={req} />
          ))
        )}
      </div>

      {/* FAB-style bottom button */}
      {requests.length > 0 && (
        <div className="sticky bottom-4 px-4">
          <GlobalButton onClick={() => navigate('/order-new-engineer')}>
            {t('maintenanceOrders.orderNew', 'طلب مهندس جديد')}
          </GlobalButton>
        </div>
      )}
    </div>
  )
}
