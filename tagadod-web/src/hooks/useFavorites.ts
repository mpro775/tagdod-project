import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isLoggedIn } from "../stores/authStore";
import * as favoriteService from "../services/favoriteService";
import type { FavoriteItem } from "../types/favorite";
import type { PaginatedResponse } from "../types/common";

/** الـ API يعيد productId ككائن (منتج populated) أو سلسلة */
function extractProductId(f: {
  productId?: string | { _id?: string; id?: string };
  product?: { _id?: string; id?: string };
}): string {
  const p = f.productId;
  if (typeof p === "string") return p;
  if (p && typeof p === "object")
    return (
      (p as { _id?: string; id?: string })._id ??
      (p as { _id?: string; id?: string }).id ??
      ""
    );
  return f.product?._id ?? f.product?.id ?? "";
}

export function useFavorites() {
  const queryClient = useQueryClient();
  const loggedIn = isLoggedIn();

  const { data } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => favoriteService.getFavorites(),
    enabled: loggedIn,
  });

  const addMutation = useMutation({
    mutationFn: (productId: string) => favoriteService.addFavorite(productId),
    onSuccess: (_, productId) => {
      queryClient.setQueryData<PaginatedResponse<FavoriteItem>>(
        ["favorites"],
        (prev) => {
          const current = prev ?? {
            data: [] as FavoriteItem[],
            meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
          };
          const data = Array.isArray(current.data) ? current.data : [];
          const ids = new Set(data.map(extractProductId));
          if (ids.has(productId)) return prev ?? current;
          const meta = current.meta ?? {
            page: 1,
            limit: 100,
            total: 0,
            totalPages: 0,
          };
          return {
            ...current,
            data: [
              ...data,
              { id: `opt-${productId}`, productId } as FavoriteItem,
            ],
            meta: { ...meta, total: (meta.total ?? 0) + 1 },
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) =>
      favoriteService.removeFavorite(productId),
    onSuccess: (_, productId) => {
      queryClient.setQueryData<PaginatedResponse<FavoriteItem>>(
        ["favorites"],
        (prev) => {
          if (!prev || !Array.isArray(prev.data)) return prev;
          return {
            ...prev,
            data: prev.data.filter((f) => extractProductId(f) !== productId),
            meta: prev.meta
              ? { ...prev.meta, total: Math.max(0, (prev.meta.total ?? 0) - 1) }
              : prev.meta,
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const rawData = (data as { data?: FavoriteItem[] })?.data;
  const favoritesList = Array.isArray(rawData) ? rawData : [];
  const favoriteIds = new Set(
    favoritesList.map(extractProductId).filter(Boolean),
  );

  const isFavorite = (productId: string) => favoriteIds.has(productId);

  const toggleFavorite = async (productId: string) => {
    if (!loggedIn) return { needsLogin: true };
    const fav = isFavorite(productId);
    try {
      if (fav) {
        await removeMutation.mutateAsync(productId);
      } else {
        await addMutation.mutateAsync(productId);
      }
      return { needsLogin: false };
    } catch {
      return { needsLogin: false };
    }
  };

  return {
    isFavorite,
    toggleFavorite,
    isLoading: addMutation.isPending || removeMutation.isPending,
    loggedIn,
  };
}
