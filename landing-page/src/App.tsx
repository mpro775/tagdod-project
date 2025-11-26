import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import DeletedAccountPage from './pages/DeletedAccountPage';

const App: React.FC = () => {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Navbar />
      <Box component="main" flexGrow={1}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/deleted-account" element={<DeletedAccountPage />} />
        </Routes>
      </Box>
      <Footer />
    </Box>
  );
};

export default App;
