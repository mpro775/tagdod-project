import { Box, Typography, Tab, Tabs, useTheme, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SearchStatsCards } from '../components/SearchStatsCards';
import { TopSearchTermsTable } from '../components/TopSearchTermsTable';
import { useState } from 'react';

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
      id={`search-tabpanel-${index}`}
      aria-labelledby={`search-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box 
          sx={{ 
            py: { xs: 2, sm: 3 },
            px: { xs: 0, sm: 0 }
          }}
        >
          {children}
        </Box>
      )}
    </div>
  );
}

export function SearchDashboardPage() {
  const { t } = useTranslation('search');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: 'background.default',
        minHeight: '100vh',
        px: { xs: 1.5, sm: 2, md: 3 },
        py: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          mb: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Typography 
          variant={isMobile ? 'h5' : 'h4'} 
          component="h1" 
          gutterBottom 
          fontWeight="bold"
          sx={{
            color: 'text.primary',
            mb: { xs: 0.5, sm: 1 },
          }}
        >
          {t('navigation.title')}
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          {t('navigation.subtitle')}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box 
        sx={{ 
          mb: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <SearchStatsCards />
      </Box>

      {/* Tabs */}
      <Box 
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          mb: { xs: 2, sm: 3 },
          overflowX: 'auto',
          '& .MuiTabs-root': {
            minHeight: { xs: 48, sm: 48 },
          },
          '& .MuiTab-root': {
            minWidth: { xs: 120, sm: 160 },
            fontSize: { xs: '0.875rem', sm: '1rem' },
            px: { xs: 1.5, sm: 3 },
            textTransform: 'none',
            fontWeight: 500,
          },
        }}
      >
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons={isMobile ? 'auto' : false}
          allowScrollButtonsMobile={isMobile}
          sx={{
            '& .MuiTabs-indicator': {
              bgcolor: 'primary.main',
              height: 3,
            },
            '& .MuiTab-root': {
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'primary.main',
              },
            },
          }}
        >
          <Tab 
            label={t('tabs.popularTerms')}
            sx={{
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.04)',
              },
            }}
          />
          <Tab 
            label={t('tabs.zeroResults')}
            sx={{
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.04)',
              },
            }}
          />
        </Tabs>
      </Box>

      {/* Tab 1: Top Search Terms */}
      <TabPanel value={currentTab} index={0}>
        <Box sx={{ height: '70vh', minHeight: 400 }}>
          <TopSearchTermsTable />
        </Box>
      </TabPanel>

      {/* Tab 2: Zero Results - Placeholder */}
      <TabPanel value={currentTab} index={1}>
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: { xs: 4, sm: 6, md: 8 },
            px: { xs: 2, sm: 3 },
          }}
        >
          <Typography 
            variant={isMobile ? 'body1' : 'h6'} 
            color="text.secondary"
            sx={{
              fontWeight: 500,
              mb: { xs: 1, sm: 1.5 },
            }}
          >
            {t('placeholders.comingSoon.title')}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              opacity: 0.8,
            }}
          >
            {t('placeholders.comingSoon.subtitle')}
          </Typography>
        </Box>
      </TabPanel>
    </Box>
  );
}

