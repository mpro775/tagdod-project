/// <reference types="vite/client" />
/// <reference types="@testing-library/jest-dom" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_DEFAULT_LANGUAGE: string;
  readonly VITE_DEFAULT_THEME: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_PWA: string;
  readonly VITE_MAX_UPLOAD_SIZE: string;
  readonly VITE_MAX_IMAGES_PER_PRODUCT: string;
  readonly VITE_DEFAULT_PAGE_SIZE: string;
  readonly VITE_MAX_PAGE_SIZE: string;
}

// eslint-disable-next-line no-unused-vars
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

