import { Box, Typography, Tab, Tabs } from '@mui/material';
import { Grid } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AddressStatsCards } from '../components/AddressStatsCards';
import { TopCitiesChart } from '../components/TopCitiesChart';
import { AddressListTable } from '../components/AddressListTable';

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
      id={`addresses-tabpanel-${index}`}
      aria-labelledby={`addresses-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export function AddressesDashboardPage() {
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
          {t('addresses.navigation.title', { defaultValue: 'إحصائيات العناوين' })}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('addresses.navigation.subtitle', { defaultValue: 'إحصائيات العناوين المختلفة' })}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ mb: 4 }}>
        <AddressStatsCards />
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label={t('addresses.tabs.statistics', { defaultValue: 'إحصائيات العناوين' })} />
          <Tab label={t('addresses.tabs.list', { defaultValue: 'قائمة العناوين' }   )} />
        </Tabs>
      </Box>

      {/* Tab 1: Statistics */}
      <TabPanel value={currentTab} index={0}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <TopCitiesChart />
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 2: Address List */}
      <TabPanel value={currentTab} index={1}>
        <AddressListTable />
      </TabPanel>
    </Box>
  );
}

