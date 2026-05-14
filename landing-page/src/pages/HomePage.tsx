import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Stats from '../components/Stats';
import AppShowcase from '../components/AppShowcase';
import DownloadCTA from '../components/DownloadCTA';
import AboutCompany from '../components/AboutCompany';
import ProductShowcase from '../components/ProductShowcase';
import ProjectsShowcase from '../components/ProjectsShowcase';
import BrandsShowcase from '../components/BrandsShowcase';
import NewsArticles from '../components/NewsArticles';
import ServiceCenter from '../components/ServiceCenter';
import ContactSupport from '../components/ContactSupport';
import { landingService } from '../services/landing.service';
import type { LandingHomeResponse } from '../types/landing';
import { setSEO } from '../lib/seo';

const HomePage: React.FC = () => {
  const [data, setData] = useState<LandingHomeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await landingService.getLandingHome();
        setData(response);
        setError(null);

        const settings = response.settings;
        setSEO({
          title: settings?.heroTitleAr || 'تجدد - حلول ذكية للطاقة والخدمات',
          description: settings?.heroSubtitleAr || 'نقدم منظومة متكاملة تجمع بين المنتجات، الصيانة، الدعم الفني، وتنفيذ المشاريع باحترافية.',
          image: settings?.heroImage,
        });
      } catch (err) {
        console.error('Failed to fetch landing data:', err);
        setError(err instanceof Error ? err.message : 'فشل في تحميل البيانات');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress size={60} sx={{ color: '#1A8BC2', mb: 3 }} />
        <Typography variant="h6" color="text.secondary">
          جاري تحميل الصفحة...
        </Typography>
      </Box>
    );
  }

  if (error && !data) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 4,
        }}
      >
        <Typography variant="h4" color="error.main" gutterBottom>
          عذرًا
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ maxWidth: 400 }}>
          حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى لاحقًا.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontSize: '0.85rem' }}>
          {error}
        </Typography>
      </Box>
    );
  }

  const settings = data?.settings || null;
  const sectionOrder = settings?.sectionOrder || [
    'hero',
    'about',
    'stats',
    'features',
    'products',
    'projects',
    'brands',
    'articles',
    'serviceCenter',
    'contact',
    'appShowcase',
    'downloadCta',
  ];

  const sectionComponents: Record<string, React.ReactNode> = {
    hero: <Hero settings={settings} />,
    about: settings?.enableAboutSection !== false && <AboutCompany about={data?.about || null} />,
    stats: settings?.enableStatsSection !== false && <Stats stats={data?.stats} />,
    features: settings?.enableFeaturesSection !== false && <Features />,
    products: settings?.enableProductsSection !== false && <ProductShowcase products={data?.products || []} />,
    projects: settings?.enableProjectsSection !== false && <ProjectsShowcase projects={data?.projects || []} />,
    brands: settings?.enableBrandsSection !== false && <BrandsShowcase brands={data?.brands || []} />,
    articles: settings?.enableArticlesSection !== false && <NewsArticles articles={data?.articles || []} />,
    serviceCenter: settings?.enableServiceCenterSection !== false && <ServiceCenter serviceCenter={data?.serviceCenter || null} />,
    contact: settings?.enableContactSection !== false && <ContactSupport contactInfo={data?.contactInfo || null} />,
    appShowcase: <AppShowcase />,
    downloadCta: <DownloadCTA />,
  };

  return (
    <>
      {sectionOrder.map((section) => sectionComponents[section]).filter(Boolean)}
    </>
  );
};

export default HomePage;
