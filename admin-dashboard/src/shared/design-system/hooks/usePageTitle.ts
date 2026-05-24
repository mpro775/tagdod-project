import { useEffect } from 'react';

export function usePageTitle(title: string, suffix = 'تجدد') {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = suffix ? `${title} | ${suffix}` : title;

    return () => {
      document.title = previousTitle;
    };
  }, [suffix, title]);
}

export default usePageTitle;
