import  { useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { useThemeStore } from '@/store/themeStore';
import { createAppTheme } from './theme';

interface Props {
  children: React.ReactNode;
}

// Create RTL cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin],
});

// Create LTR cache
const cacheLtr = createCache({
  key: 'muiltr',
});

export const ThemeProvider: React.FC<Props> = ({ children }) => {
  const { mode, direction } = useThemeStore();

  // Initialize theme on mount
  useEffect(() => {
    useThemeStore.getState().initialize();
  }, []);

  // Create theme based on mode and direction
  const theme = useMemo(() => {
    const language = direction === 'rtl' ? 'ar' : 'en';
    return createAppTheme(mode, direction, language);
  }, [mode, direction]);

  // Select cache based on direction
  const cache = direction === 'rtl' ? cacheRtl : cacheLtr;

  return (
    <CacheProvider value={cache}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </CacheProvider>
  );
};

