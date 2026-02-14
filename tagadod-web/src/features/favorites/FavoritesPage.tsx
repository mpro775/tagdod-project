import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Heart } from 'lucide-react'
import {
  ProductCard,
  EmptyState,
  ProductCardShimmer,
} from '../../components/shared'
import * as favoriteService from '../../services/favoriteService'
import { useFavoritesStore } from '../../stores/favoritesStore'
import type { FavoriteItem } from '../../types/favorite'

export function FavoritesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toggle } = useFavoritesStore()

  const { data, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoriteService.getFavorites(),
  })

  const removeMutation = useMutation({
    mutationFn: (productId: string) => favoriteService.removeFavorite(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })

  const favorites: FavoriteItem[] = data?.data ?? []

  const handleToggleFavorite = (productId: string) => {
    toggle(productId)
    removeMutation.mutate(productId)
  }

  return (
    <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -mr-2 text-tagadod-titles dark:text-tagadod-dark-titles"
        >
          <ChevronLeft size={24} className="rotate-180" />
        </button>
        <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
          {t('favorites.title')}
        </h1>
        <div className="w-10" />
      </header>

      {isLoading ? (
        <div className="p-4 grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardShimmer key={i} />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={<Heart size={56} strokeWidth={1.5} />}
          title={t('favorites.empty')}
          subtitle={t('favorites.emptyHint')}
        />
      ) : (
        <div className="p-4 grid grid-cols-2 gap-3">
          {favorites.map((fav) =>
            fav.product ? (
              <ProductCard
                key={fav.id}
                product={fav.product}
                isFavorite={true}
                onToggleFavorite={() => handleToggleFavorite(fav.productId)}
              />
            ) : null,
          )}
        </div>
      )}
    </div>
  )
}
