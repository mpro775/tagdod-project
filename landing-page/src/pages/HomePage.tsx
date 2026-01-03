import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Stats from '../components/Stats';
import AppShowcase from '../components/AppShowcase';
import DownloadCTA from '../components/DownloadCTA';

const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      <Features />
      <Stats />
      <AppShowcase />
      <DownloadCTA />
    </>
  );
};

export default HomePage;
