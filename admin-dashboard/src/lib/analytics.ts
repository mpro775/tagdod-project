import { ENABLE_ANALYTICS } from '@/config/constants';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Initialize GA4
export const initializeGA4 = () => {
  if (!ENABLE_ANALYTICS || !import.meta.env.VITE_GA4_ID) {
    console.log('📊 Analytics disabled or GA4_ID not configured');
    return;
  }

  const GA4_ID = import.meta.env.VITE_GA4_ID;
  
  // Load GA4 script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: any[]) {
    window.dataLayer.push(args);
  };

  // Configure GA4
  window.gtag('js', new Date());
  window.gtag('config', GA4_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });

  console.log('📊 GA4 initialized with ID:', GA4_ID);
};

// Track page views
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (!ENABLE_ANALYTICS || !window.gtag) return;

  window.gtag('config', import.meta.env.VITE_GA4_ID, {
    page_path: pagePath,
    page_title: pageTitle || document.title,
  });

  console.log('📊 Page view tracked:', { pagePath, pageTitle });
};

// Track custom events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (!ENABLE_ANALYTICS || !window.gtag) return;

  window.gtag('event', eventName, {
    ...parameters,
    event_category: 'admin_dashboard',
    timestamp: new Date().toISOString(),
  });

  console.log('📊 Event tracked:', { eventName, parameters });
};

// Track waitlist signup
export const trackWaitlistSignup = (email: string, source?: string) => {
  trackEvent('waitlist_signup', {
    email,
    source: source || 'admin_dashboard',
    event_category: 'engagement',
  });
};

// Track form submissions
export const trackFormSubmit = (formName: string, formType?: string) => {
  trackEvent('form_submit', {
    form_name: formName,
    form_type: formType || 'general',
    event_category: 'engagement',
  });
};

// Track scroll depth
export const trackScrollDepth = (depth: number) => {
  // Track at 25%, 50%, 75%, and 100%
  const milestones = [25, 50, 75, 100];
  const milestone = milestones.find(m => depth >= m && depth < (milestones[milestones.indexOf(m) + 1] || 101));
  
  if (milestone) {
    trackEvent('scroll_depth', {
      depth_percentage: milestone,
      event_category: 'engagement',
    });
  }
};

// Track admin actions
export const trackAdminAction = (action: string, target?: string, metadata?: Record<string, any>) => {
  trackEvent('admin_action', {
    action,
    target,
    ...metadata,
    event_category: 'admin',
  });
};

// Track errors
export const trackError = (error: string, errorCode?: string, context?: string) => {
  trackEvent('error', {
    error_message: error,
    error_code: errorCode,
    context,
    event_category: 'error',
  });
};

// Track performance
export const trackPerformance = (metric: string, value: number, unit?: string) => {
  trackEvent('performance', {
    metric_name: metric,
    metric_value: value,
    metric_unit: unit || 'ms',
    event_category: 'performance',
  });
};

// Utility to set up scroll tracking
export const setupScrollTracking = () => {
  let maxScrollDepth = 0;
  let ticking = false;

  const updateScrollDepth = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);

    if (scrollPercent > maxScrollDepth) {
      maxScrollDepth = scrollPercent;
      trackScrollDepth(scrollPercent);
    }

    ticking = false;
  };

  const requestTick = () => {
    if (!ticking) {
      requestAnimationFrame(updateScrollDepth);
      ticking = true;
    }
  };

  window.addEventListener('scroll', requestTick, { passive: true });
  
  return () => {
    window.removeEventListener('scroll', requestTick);
  };
};

export default {
  initializeGA4,
  trackPageView,
  trackEvent,
  trackWaitlistSignup,
  trackFormSubmit,
  trackScrollDepth,
  trackAdminAction,
  trackError,
  trackPerformance,
  setupScrollTracking,
};
