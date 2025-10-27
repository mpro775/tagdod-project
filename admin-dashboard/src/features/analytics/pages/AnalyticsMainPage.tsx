import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  useTheme,
  useMediaQuery,
  Container,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
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
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export const AnalyticsMainPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const tabs = [
    {
      label: 'لوحة التحليلات',
      icon: <DashboardIcon />,
      value: 0,
      description: 'نظرة عامة على المؤشرات الرئيسية والأداء',
    },
    {
      label: 'التحليلات المتقدمة',
      icon: <AnalyticsIcon />,
      value: 1,
      description: 'تحليلات متخصصة وتقارير مفصلة',
    },
    {
      label: 'إدارة التقارير',
      icon: <AssessmentIcon />,
      value: 2,
      description: 'إنشاء وإدارة التقارير التحليلية',
    },
    {
      label: 'تصدير البيانات',
      icon: <FileDownloadIcon />,
      value: 3,
      description: 'تصدير البيانات بصيغ مختلفة',
    },
  ];

  return (
    <AnalyticsErrorBoundary>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Paper
          elevation={1}
          sx={{
            p: 3,
            mb: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h3" component="h1" gutterBottom>
                نظام التحليلات المتقدم
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                تحليلات شاملة ومؤشرات أداء متقدمة لإدارة أفضل
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                آخر تحديث: {new Date().toLocaleString('ar-SA')}
              </Typography>
            </Box>
          </Box>
        </Paper>


        {/* Navigation Tabs */}
        <Paper elevation={1} sx={{ mb: 3 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontWeight: 600,
              },
            }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.value}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {tab.icon}
                    <Box>
                      <Typography variant="body1">{tab.label}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {tab.description}
                      </Typography>
                    </Box>
                  </Box>
                }
                sx={{
                  minWidth: isMobile ? 200 : 250,
                  textAlign: 'left',
                  alignItems: 'flex-start',
                  py: 2,
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
