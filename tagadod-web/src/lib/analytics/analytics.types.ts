export type AnalyticsEvent =
  | 'page_view'
  | 'view_home'
  | 'view_product'
  | 'view_category'
  | 'search'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'begin_checkout'
  | 'view_cart'
  | 'filter_products'
  | 'sort_products';

export interface AnalyticsParams {
  [key: string]: string | number | boolean | undefined;
}
