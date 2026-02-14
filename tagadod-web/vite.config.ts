import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Tagadod',
        short_name: 'Tagadod',
        description: 'تطبيق Tagadod - منتجات كهربائية آمنة بمعايير عالمية',
        start_url: '/',
        display: 'standalone',
        background_color: '#FCFCFC',
        theme_color: '#1E99D3',
        lang: 'ar',
        dir: 'rtl',
        icons: [
          { src: '/vite.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.allawzi.net',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          i18n: ['i18next', 'react-i18next'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
})
