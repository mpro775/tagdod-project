import React, { useState } from 'react';
import { Drawer, Box, Typography, IconButton, Tabs, Tab } from '@mui/material';
import { Add, Send, Analytics, Close } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { NotificationCreateWizard } from './NotificationCreateWizard';
import { BulkSendForm } from './BulkSendForm';
import { TestNotificationForm } from './TestNotificationForm';
import type {
  CreateNotificationDto,
  BulkSendNotificationDto,
  NotificationTemplate,
} from '../types/notification.types';

export type NotificationActionTab = 'create' | 'bulkSend' | 'test';

interface NotificationActionsDrawerProps {
  open: boolean;
  onClose: () => void;
  initialTab?: NotificationActionTab;
  templates: NotificationTemplate[];
  onCreate: (data: CreateNotificationDto) => void;
  onBulkSend: (data: BulkSendNotificationDto) => void;
  onTest: (userId: string, templateKey: string, payload: Record<string, unknown>) => void;
  isCreating: boolean;
  isBulkSending: boolean;
  isTesting: boolean;
}

const TAB_VALUES: NotificationActionTab[] = ['create', 'bulkSend', 'test'];

export const NotificationActionsDrawer: React.FC<NotificationActionsDrawerProps> = ({
  open,
  onClose,
  initialTab = 'create',
  templates,
  onCreate,
  onBulkSend,
  onTest,
  isCreating,
  isBulkSending,
  isTesting,
}) => {
  const { t } = useTranslation('notifications');
  const { isMobile } = useBreakpoint();
  const [activeTab, setActiveTab] = useState<NotificationActionTab>(initialTab);

  React.useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(TAB_VALUES[newValue]);
  };

  const tabIndex = TAB_VALUES.indexOf(activeTab);

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        },
      }}
    >
      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" sx={{ fontSize: isMobile ? '1.125rem' : undefined }}>
            {t('mobile.actionsDrawer')}
          </Typography>
          <IconButton onClick={onClose} size="small" aria-label={t('dialogs.close')}>
            <Close />
          </IconButton>
        </Box>

        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={<Add fontSize="small" />}
            iconPosition="start"
            label={t('mobile.tabCreate')}
            sx={{ minHeight: 48, fontSize: '0.875rem' }}
          />
          <Tab
            icon={<Send fontSize="small" />}
            iconPosition="start"
            label={t('mobile.tabBulkSend')}
            sx={{ minHeight: 48, fontSize: '0.875rem' }}
          />
          <Tab
            icon={<Analytics fontSize="small" />}
            iconPosition="start"
            label={t('mobile.tabTest')}
            sx={{ minHeight: 48, fontSize: '0.875rem' }}
          />
        </Tabs>

        <Box sx={{ overflow: 'auto', maxHeight: 'calc(90vh - 120px)', p: 2 }}>
          {activeTab === 'create' && (
            <NotificationCreateWizard
              templates={templates}
              onSave={onCreate}
              onCancel={onClose}
              isLoading={isCreating}
            />
          )}
          {activeTab === 'bulkSend' && (
            <BulkSendForm onSave={onBulkSend} onCancel={onClose} isLoading={isBulkSending} />
          )}
          {activeTab === 'test' && (
            <TestNotificationForm
              templates={templates}
              onTest={onTest}
              onCancel={onClose}
              isLoading={isTesting}
            />
          )}
        </Box>
      </Box>
    </Drawer>
  );
};
