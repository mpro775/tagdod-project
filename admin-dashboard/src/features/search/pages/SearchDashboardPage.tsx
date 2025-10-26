import { Box, Typography, Tab, Tabs } from '@mui/material';
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
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          🔍 إدارة البحث والتحليلات
        </Typography>
        <Typography variant="body1" color="text.secondary">
          تحليل شامل لعمليات البحث وسلوك المستخدمين
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ mb: 4 }}>
        <SearchStatsCards />
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="📊 الكلمات الشائعة" />
          <Tab label="⚠️ بحث بدون نتائج" />
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
            قريباً: عمليات البحث بدون نتائج
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            سيتم إضافة هذه الميزة عند تفعيل Search Logs
          </Typography>
        </Box>
      </TabPanel>
    </Box>
  );
}

