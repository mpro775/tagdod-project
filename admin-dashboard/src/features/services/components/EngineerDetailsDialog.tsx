import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useEngineerProfileAdmin } from '@/features/users/hooks/useEngineerProfileAdmin';
import { EngineerProfileHeader } from './EngineerProfileHeader';
import { EngineerProfileInfo } from './EngineerProfileInfo';
import { EngineerRatingsSection } from './EngineerRatingsSection';
import { EngineerWalletSection } from './EngineerWalletSection';
import { EngineerStatsSection } from './EngineerStatsSection';
import { EngineerCouponsSection } from './EngineerCouponsSection';

interface EngineerDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  engineerId: string;
  engineerData?: any; // البيانات الأساسية للمهندس من الجدول
  onEdit?: () => void;
}

export const EngineerDetailsDialog: React.FC<EngineerDetailsDialogProps> = ({
  open,
  onClose,
  engineerId,
  engineerData,
  onEdit,
}) => {
  const { t } = useTranslation(['services', 'common']);
  const [activeTab, setActiveTab] = useState(0);

  const {
    data: profile,
    isLoading,
    error,
  } = useEngineerProfileAdmin(engineerId);

  if (isLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('common:actions.close', 'إغلاق')}</Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (error || !profile) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogContent>
          <Alert severity="error">
            {t('services:engineers.profileLoadError', 'فشل تحميل بروفايل المهندس')}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('common:actions.close', 'إغلاق')}</Button>
        </DialogActions>
      </Dialog>
    );
  }

  const userData = engineerData
    ? {
        firstName: engineerData.firstName || engineerData.engineerName?.split(' ')[0],
        lastName: engineerData.lastName || engineerData.engineerName?.split(' ').slice(1).join(' '),
        phone: engineerData.phone || engineerData.engineerPhone,
        city: engineerData.city,
      }
    : profile.userId && typeof profile.userId === 'object'
      ? {
          firstName: (profile.userId as any).firstName,
          lastName: (profile.userId as any).lastName,
          phone: (profile.userId as any).phone,
          city: (profile.userId as any).city,
        }
      : undefined;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { height: '90vh' } }}>
      <DialogTitle>{t('services:engineers.detailsTitle', 'تفاصيل المهندس')}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <EngineerProfileHeader profile={profile} user={userData} onEdit={onEdit} />
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label={t('services:engineers.info', 'المعلومات')} />
            <Tab label={t('services:engineers.ratings', 'التقييمات')} />
            <Tab label={t('services:engineers.wallet', 'المحفظة')} />
            <Tab label={t('services:engineers.coupons', 'الكوبونات')} />
            <Tab label={t('services:engineers.statistics', 'الإحصائيات')} />
          </Tabs>
        </Box>

        <Box sx={{ mt: 2 }}>
          {activeTab === 0 && <EngineerProfileInfo profile={profile} />}
          {activeTab === 1 && <EngineerRatingsSection profile={profile} userId={engineerId} />}
          {activeTab === 2 && <EngineerWalletSection profile={profile} userId={engineerId} />}
          {activeTab === 3 && <EngineerCouponsSection engineerId={engineerId} />}
          {activeTab === 4 && <EngineerStatsSection profile={profile} userId={engineerId} />}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common:actions.close', 'إغلاق')}</Button>
      </DialogActions>
    </Dialog>
  );
};

