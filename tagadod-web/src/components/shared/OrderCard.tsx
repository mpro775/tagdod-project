import { Link } from 'react-router-dom'
import { ChevronLeft, Package } from 'lucide-react'
import type { Order } from '../../types/order'
import { StatusChip } from './StatusChip'
import { formatPrice } from '../../stores/currencyStore'
import type { CurrencyCode } from '../../types/enums'

interface OrderCardProps {
  order: Order
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Link
      to={`/order-details/${order.id}`}
      className="block rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Package size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
              طلب #{order.orderNumber ?? order.id.slice(0, 8)}
            </p>
            <p className="text-xs text-tagadod-gray">
              {new Date(order.createdAt).toLocaleDateString('ar')}
            </p>
          </div>
        </div>
        <StatusChip status={order.status} type="order" />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-tagadod-gray">{order.items?.length ?? 0} منتجات</span>
          <span className="mx-2 text-tagadod-gray">•</span>
          <span className="text-sm font-semibold text-primary">
            {formatPrice(order.total, order.currency as CurrencyCode)}
          </span>
        </div>
        <ChevronLeft size={18} className="text-tagadod-gray rtl:rotate-180" />
      </div>
    </Link>
  )
}
