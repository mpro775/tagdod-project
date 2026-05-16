import { StoreLayout } from './StoreLayout'

interface AppShellProps {
  showNav?: boolean
  showAppBar?: boolean
}

export function AppShell(_props: AppShellProps) {
  // AppShell is now a thin wrapper around StoreLayout.
  // The old mobile-app layout logic (AppBar + BottomNavBar) has been replaced
  // by the professional storefront layout in StoreLayout.
  return <StoreLayout />
}
