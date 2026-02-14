import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import {
  CustomTabBar,
  ServiceRequestCard,
  OfferCard,
  EmptyState,
  ListShimmer,
} from '../../components/shared'
import {
  getNearbyRequests,
  getCityRequests,
  getAllRequests,
  getMyOffers,
} from '../../services/maintenanceService'

const TABS = [
  { key: 'nearby', label: 'قريبة' },
  { key: 'city', label: 'المدينة' },
  { key: 'all', label: 'الكل' },
  { key: 'offers', label: 'عروضي' },
] as const

type TabKey = (typeof TABS)[number]['key']

/** Get user location – returns null if denied or unavailable */
function useUserCoords(enabled: boolean) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (!enabled || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setCoords(null),
      { enableHighAccuracy: false, maximumAge: 300000 }
    )
  }, [enabled])

  return coords
}

export function CustomersOrdersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabKey>('nearby')
  const coords = useUserCoords(activeTab === 'nearby')

  // ─── queries per tab ───────────────────────────────────────────────
  const nearbyQuery = useQuery({
    queryKey: ['engineerRequests', 'nearby', coords?.lat, coords?.lng],
    queryFn: () =>
      coords
        ? getNearbyRequests({ lat: coords.lat, lng: coords.lng })
        : getCityRequests(),
    enabled: activeTab === 'nearby',
  })

  const cityQuery = useQuery({
    queryKey: ['engineerRequests', 'city'],
    queryFn: () => getCityRequests(),
    enabled: activeTab === 'city',
  })

  const allQuery = useQuery({
    queryKey: ['engineerRequests', 'all'],
    queryFn: () => getAllRequests(),
    enabled: activeTab === 'all',
  })

  const offersQuery = useQuery({
    queryKey: ['myOffers'],
    queryFn: () => getMyOffers(),
    enabled: activeTab === 'offers',
  })

  // ─── helpers ───────────────────────────────────────────────────────
  const isLoading =
    (activeTab === 'nearby' && nearbyQuery.isLoading) ||
    (activeTab === 'city' && cityQuery.isLoading) ||
    (activeTab === 'all' && allQuery.isLoading) ||
    (activeTab === 'offers' && offersQuery.isLoading)

  const requestsMap: Record<Exclude<TabKey, 'offers'>, typeof nearbyQuery> = {
    nearby: nearbyQuery,
    city: cityQuery,
    all: allQuery,
  }

  const isOffersTab = activeTab === 'offers'
  const requestData = !isOffersTab ? requestsMap[activeTab as Exclude<TabKey, 'offers'>]?.data?.data : null
  const requests = Array.isArray(requestData) ? requestData : []
  const offerData = isOffersTab ? offersQuery.data?.data : null
  const offers = Array.isArray(offerData) ? offerData : []

  // ─── render ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
      {/* header */}
      <header className="sticky top-0 z-10 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link to="/profile" className="p-2 -mr-2">
            <ChevronLeft size={24} className="rotate-180 text-tagadod-titles dark:text-tagadod-dark-titles" />
          </Link>
          <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
            {t('customersOrders.title', 'طلبات العملاء')}
          </h1>
        </div>

        <CustomTabBar
          tabs={TABS.map((tab) => ({ key: tab.key, label: tab.label }))}
          activeTab={activeTab}
          onTabChange={(key) => setActiveTab(key as TabKey)}
        />
      </header>

      {/* content */}
      <div className="p-4 space-y-3">
        {isLoading ? (
          <ListShimmer count={4} />
        ) : isOffersTab ? (
          offers.length === 0 ? (
            <EmptyState
              title={t('customersOrders.noOffers', 'لا توجد عروض')}
              subtitle={t('customersOrders.noOffersSubtitle', 'لم تقدم أي عروض بعد')}
            />
          ) : (
            offers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onView={() => navigate(`/edit-offer/${offer.id}?mode=view`)}
              />
            ))
          )
        ) : requests.length === 0 ? (
          <EmptyState
            title={t('customersOrders.noOrders', 'لا توجد طلبات')}
            subtitle={
              activeTab === 'nearby'
                ? t('customersOrders.noNearbySubtitle', 'لا توجد طلبات قريبة منك حالياً')
                : activeTab === 'city'
                  ? t('customersOrders.noCitySubtitle', 'لا توجد طلبات في مدينتك حالياً')
                  : t('customersOrders.noAllSubtitle', 'لا توجد طلبات متاحة حالياً')
            }
          />
        ) : (
          requests.map((req) => (
            <ServiceRequestCard
              key={req.id}
              request={req}
              linkTo={`/maintenance-details/${req.id}`}
            />
          ))
        )}
      </div>
    </div>
  )
}
