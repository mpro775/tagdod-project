import { Box, Typography, Tab, Tabs } from '@mui/material';
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
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export function SearchDashboardPage() {
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          {t('search.navigation.title', { defaultValue: 'إحصائيات البحث' })}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('search.navigation.subtitle', { defaultValue: 'إحصائيات البحث المختلفة' })}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ mb: 4 }}>
        <SearchStatsCards />
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label={t('search.tabs.popularTerms', { defaultValue: 'المصطلحات الشائعة' })} />
          <Tab label={t('search.tabs.zeroResults', { defaultValue: 'النتائج الصفرية' })} />
        </Tabs>
      </Box>

      {/* Tab 1: Top Search Terms */}
      <TabPanel value={currentTab} index={0}>
        <TopSearchTermsTable />
      </TabPanel>

      {/* Tab 2: Zero Results - Placeholder */}
      <TabPanel value={currentTab} index={1}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            {t('search.placeholders.comingSoon.title', { defaultValue: 'قيد التطوير...' })}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t('search.placeholders.comingSoon.subtitle', { defaultValue: 'قيد التطوير...' }    )}
          </Typography>
        </Box>
      </TabPanel>
    </Box>
  );
}

