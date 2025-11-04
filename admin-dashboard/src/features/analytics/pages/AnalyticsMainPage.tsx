import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  useTheme,
  Container,
  Stack,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { getCardSpacing } from '../utils/responsive';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import { AdvancedAnalyticsDashboard } from '../components/AdvancedAnalyticsDashboard';
import { ReportsManagementPage } from './ReportsManagementPage';
import { DataExportPage } from './DataExportPage';
import { AnalyticsErrorBoundary } from '../components/AnalyticsErrorBoundary';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-main-tabpanel-${index}`}
      aria-labelledby={`analytics-main-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: { xs: 1, sm: 0 } }}>{children}</Box>}
    </div>
  );
}

export const AnalyticsMainPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation('analytics');
  const breakpoint = useBreakpoint();
  const cardSpacing = getCardSpacing(breakpoint);

  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const tabs = [
    {
      label: t('mainPage.tabs.dashboard.label'),
      icon: <DashboardIcon sx={{ fontSize: breakpoint.isXs ? 16 : breakpoint.isSm ? 18 : 20 }} />,
      value: 0,
      description: t('mainPage.tabs.dashboard.description'),
    },
    {
      label: t('mainPage.tabs.advanced.label'),
      icon: <AnalyticsIcon sx={{ fontSize: breakpoint.isXs ? 16 : breakpoint.isSm ? 18 : 20 }} />,
      value: 1,
      description: t('mainPage.tabs.advanced.description'),
    },
    {
      label: t('mainPage.tabs.reports.label'),
      icon: <AssessmentIcon sx={{ fontSize: breakpoint.isXs ? 16 : breakpoint.isSm ? 18 : 20 }} />,
      value: 2,
      description: t('mainPage.tabs.reports.description'),
    },
    {
      label: t('mainPage.tabs.export.label'),
      icon: <FileDownloadIcon sx={{ fontSize: breakpoint.isXs ? 16 : breakpoint.isSm ? 18 : 20 }} />,
      value: 3,
      description: t('mainPage.tabs.export.description'),
    },
  ];

  return (
    <AnalyticsErrorBoundary>
      <Container 
        maxWidth="xl" 
        sx={{ 
          py: { xs: 2, sm: 3 },
          px: { xs: 1, sm: 3 },
        }}
      >
        {/* Header */}
        <Paper
          elevation={1}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: { xs: 2, sm: 3 },
            background: theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
              : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            backgroundImage: theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
              : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          }}
        >
          <Stack
            direction={breakpoint.isMobile ? 'column' : 'row'}
            spacing={breakpoint.isMobile ? cardSpacing : 0}
            sx={{
              justifyContent: 'space-between',
              alignItems: breakpoint.isMobile ? 'flex-start' : 'center',
              gap: breakpoint.isMobile ? cardSpacing : 2,
            }}
          >
            <Box>
              <Typography 
                variant={breakpoint.isXs ? 'h5' : breakpoint.isSm ? 'h4' : 'h3'} 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontSize: breakpoint.isXs ? '1.5rem' : breakpoint.isSm ? '1.75rem' : undefined,
                  fontWeight: 'bold',
                }}
              >
                {t('mainPage.title')}
              </Typography>
              <Typography 
                variant={breakpoint.isXs ? 'body2' : breakpoint.isSm ? 'body1' : 'h6'} 
                sx={{ 
                  opacity: 0.9,
                  fontSize: breakpoint.isXs ? '0.8125rem' : breakpoint.isSm ? '0.9375rem' : undefined,
                }}
              >
                {t('mainPage.subtitle')}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.8,
                  fontSize: breakpoint.isXs ? '0.6875rem' : breakpoint.isSm ? '0.75rem' : undefined,
                }}
              >
                {t('mainPage.lastUpdate')}: {new Date().toLocaleString('en-US')}
              </Typography>
            </Box>
          </Stack>
        </Paper>


        {/* Navigation Tabs */}
        <Paper 
          elevation={1} 
          sx={{ 
            mb: { xs: 2, sm: 3 },
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : undefined,
          }}
        >
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant={breakpoint.isMobile ? 'scrollable' : 'standard'}
            scrollButtons={breakpoint.isMobile ? 'auto' : false}
            sx={{
              '& .MuiTab-root': {
                minHeight: breakpoint.isXs ? 64 : breakpoint.isSm ? 68 : 64,
                textTransform: 'none',
                fontWeight: 600,
                px: breakpoint.isXs ? 1 : breakpoint.isSm ? 1.5 : 2,
                color: theme.palette.mode === 'dark' ? theme.palette.text.primary : undefined,
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: theme.palette.primary.main,
              },
            }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.value}
                label={
                  <Stack
                    direction={breakpoint.isMobile ? 'column' : 'row'}
                    spacing={breakpoint.isMobile ? 0.5 : 1}
                    sx={{
                      alignItems: breakpoint.isMobile ? 'center' : 'flex-start',
                      textAlign: breakpoint.isMobile ? 'center' : 'left',
                      width: '100%',
                    }}
                  >
                    {tab.icon}
                    <Box sx={{ textAlign: breakpoint.isMobile ? 'center' : 'left' }}>
                      <Typography 
                        variant={breakpoint.isXs ? 'body2' : 'body1'}
                        sx={{ 
                          fontSize: breakpoint.isXs ? '0.8125rem' : breakpoint.isSm ? '0.875rem' : undefined,
                          fontWeight: 600,
                        }}
                      >
                        {tab.label}
                      </Typography>
                      {!breakpoint.isMobile && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            opacity: 0.7,
                            fontSize: breakpoint.isSm ? '0.6875rem' : '0.75rem',
                            display: 'block',
                          }}
                        >
                          {tab.description}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                }
                sx={{
                  minWidth: breakpoint.isXs ? 100 : breakpoint.isSm ? 120 : 250,
                  textAlign: breakpoint.isMobile ? 'center' : 'left',
                  alignItems: breakpoint.isMobile ? 'center' : 'flex-start',
                  py: breakpoint.isXs ? 1 : breakpoint.isSm ? 1.5 : 2,
                }}
              />
            ))}
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <TabPanel value={selectedTab} index={0}>
          <AnalyticsDashboard />
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          <AdvancedAnalyticsDashboard />
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          <ReportsManagementPage />
        </TabPanel>

        <TabPanel value={selectedTab} index={3}>
          <DataExportPage />
        </TabPanel>
      </Container>
    </AnalyticsErrorBoundary>
  );
};
