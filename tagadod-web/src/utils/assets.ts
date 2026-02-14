/**
 * Asset paths - from app_assets.dart
 * Assets are in public/assets for Vite
 */
const ASSETS_BASE = '/assets';

export const assets = {
  animations: {
    splash: `${ASSETS_BASE}/animations/splash.json`,
    splashWhiteGif: `${ASSETS_BASE}/animations/splash_white.gif`,
    splashDarkGif: `${ASSETS_BASE}/animations/splash_dark.gif`,
    maintenance: `${ASSETS_BASE}/animations/maintenance.json`,
    update: `${ASSETS_BASE}/animations/update.json`,
    ok: `${ASSETS_BASE}/animations/ok.json`,
    noConnection: `${ASSETS_BASE}/animations/noconnection.json`,
  },
  icons: {
    appLogo: `${ASSETS_BASE}/icons/app_logo.png`,
    darkAppLogo: `${ASSETS_BASE}/icons/dark_app_logo.png`,
    home: `${ASSETS_BASE}/icons/home.svg`,
    category: `${ASSETS_BASE}/icons/category.svg`,
    cart: `${ASSETS_BASE}/icons/cart.svg`,
    orders: `${ASSETS_BASE}/icons/orders.svg`,
    user: `${ASSETS_BASE}/icons/user.svg`,
    engineer: `${ASSETS_BASE}/icons/engineer.svg`,
    search: `${ASSETS_BASE}/icons/search.svg`,
    notification: `${ASSETS_BASE}/icons/notification.svg`,
  },
  onboarding: {
    image: `${ASSETS_BASE}/onboarding/onboarding_image.png`,
  },
} as const;
