import type { AnalyticsEvent, AnalyticsParams } from './analytics.types';

function isWindowDefined(): boolean {
  return typeof window !== 'undefined';
}

function pushToDataLayer(event: string, params: AnalyticsParams = {}): void {
  if (!isWindowDefined()) return;

  try {
    const dataLayer = (window as unknown as Record<string, unknown>)['dataLayer'] as
      | Array<Record<string, unknown>>
      | undefined;

    if (Array.isArray(dataLayer)) {
      dataLayer.push({ event, ...params });
    }
  } catch {
    // Silently fail if analytics provider is not available
  }
}

export function trackEvent(name: AnalyticsEvent, params: AnalyticsParams = {}): void {
  pushToDataLayer(name, params);
}

export function trackPageView(path: string, title?: string): void {
  trackEvent('page_view', { page_path: path, page_title: title || path });
}

export function trackViewProduct(product: { id?: string; name?: string; price?: number }): void {
  trackEvent('view_product', {
    product_id: product.id || '',
    product_name: product.name || '',
    price: product.price || 0,
  });
}

export function trackAddToCart(product: { id?: string; name?: string; price?: number }, quantity: number = 1): void {
  trackEvent('add_to_cart', {
    product_id: product.id || '',
    product_name: product.name || '',
    price: product.price || 0,
    quantity,
  });
}

export function trackRemoveFromCart(product: { id?: string; name?: string }): void {
  trackEvent('remove_from_cart', {
    product_id: product.id || '',
    product_name: product.name || '',
  });
}

export function trackSearch(query: string): void {
  trackEvent('search', { search_term: query });
}

export function trackViewCategory(category: { id?: string; name?: string }): void {
  trackEvent('view_category', {
    category_id: category.id || '',
    category_name: category.name || '',
  });
}

export function trackBeginCheckout(cart: { itemCount: number; total?: number }): void {
  trackEvent('begin_checkout', {
    items_count: cart.itemCount,
    total: cart.total || 0,
  });
}

export function trackViewCart(cart: { itemCount: number; total?: number }): void {
  trackEvent('view_cart', {
    items_count: cart.itemCount,
    total: cart.total || 0,
  });
}

export function trackFilterProducts(filters: Record<string, unknown>): void {
  trackEvent('filter_products', filters as AnalyticsParams);
}

export function trackSortProducts(sortBy: string): void {
  trackEvent('sort_products', { sort_by: sortBy });
}
