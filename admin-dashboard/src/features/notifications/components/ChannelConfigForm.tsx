import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Stack,
  FormControlLabel,
  Switch,
  Chip,
  Typography,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import {
  NotificationChannelConfig,
  CreateChannelConfigDto,
  UpdateChannelConfigDto,
  NotificationType,
  NotificationChannel,
} from '../types/notification.types';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  MERCHANT = 'merchant',
  ENGINEER = 'engineer',
}

interface ChannelConfigFormProps {
  config?: NotificationChannelConfig | null;
  notificationType: NotificationType;
  onSave: (data: CreateChannelConfigDto | UpdateChannelConfigDto) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const ChannelConfigForm: React.FC<ChannelConfigFormProps> = ({
  config,
  notificationType,
  onSave,
  onCancel,
  isLoading,
}) => {
  const { t } = useTranslation('notifications');
  const { isMobile } = useBreakpoint();
  const [formData, setFormData] = useState<CreateChannelConfigDto | UpdateChannelConfigDto>({
    notificationType: config?.notificationType || notificationType,
    allowedChannels: config?.allowedChannels || [NotificationChannel.IN_APP],
    defaultChannel: config?.defaultChannel || NotificationChannel.IN_APP,
    targetRoles: config?.targetRoles || [UserRole.USER],
    isActive: config?.isActive ?? true,
  });

  useEffect(() => {
    if (config) {
      setFormData({
        notificationType: config.notificationType,
        allowedChannels: config.allowedChannels,
        defaultChannel: config.defaultChannel,
        targetRoles: config.targetRoles as UserRole[],
        isActive: config.isActive,
      });
    }
  }, [config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من أن القناة الافتراضية موجودة في القنوات المسموحة
    if (!formData.allowedChannels.includes(formData.defaultChannel)) {
      return;
    }

    onSave(formData);
  };

  const handleAllowedChannelsChange = (channels: NotificationChannel[]) => {
    setFormData((prev) => {
      const newData = { ...prev, allowedChannels: channels };
      // إذا كانت القناة الافتراضية غير موجودة في القنوات المسموحة، تغييرها
      if (!channels.includes(prev.defaultChannel)) {
        newData.defaultChannel = channels[0] || NotificationChannel.IN_APP;
      }
      return newData;
    });
  };

  const channelOptions = [
    { value: NotificationChannel.IN_APP, label: 'داخل التطبيق (In-App)' },
    { value: NotificationChannel.PUSH, label: 'إشعارات الدفع (Push)' },
    { value: NotificationChannel.SMS, label: 'رسائل نصية (SMS)' },
    { value: NotificationChannel.EMAIL, label: 'بريد إلكتروني (Email)' },
    { value: NotificationChannel.DASHBOARD, label: 'لوحة التحكم (Dashboard)' },
  ];

  const roleOptions = [
    { value: UserRole.USER, label: 'مستخدم عادي' },
    { value: UserRole.ENGINEER, label: 'مهندس' },
    { value: UserRole.MERCHANT, label: 'تاجر' },
    { value: UserRole.ADMIN, label: 'مدير' },
    { value: UserRole.SUPER_ADMIN, label: 'مدير عام' },
  ];

  const isDefaultChannelValid = formData.allowedChannels.includes(formData.defaultChannel);

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        {!isDefaultChannelValid && (
          <Alert severity="warning">
            القناة الافتراضية يجب أن تكون موجودة في القنوات المسموحة
          </Alert>
        )}

        <FormControl fullWidth>
          <InputLabel>نوع الإشعار</InputLabel>
          <Select
            value={formData.notificationType}
            label="نوع الإشعار"
            disabled={!!config || isLoading}
            size={isMobile ? 'small' : 'medium'}
          >
            {Object.values(NotificationType).map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>القنوات المسموحة</InputLabel>
          <Select
            multiple
            value={formData.allowedChannels}
            onChange={(e) =>
              handleAllowedChannelsChange(e.target.value as NotificationChannel[])
            }
            label="القنوات المسموحة"
            disabled={isLoading}
            size={isMobile ? 'small' : 'medium'}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as NotificationChannel[]).map((value) => {
                  const option = channelOptions.find((opt) => opt.value === value);
                  return (
                    <Chip
                      key={value}
                      label={option?.label || value}
                      size="small"
                      color="primary"
                    />
                  );
                })}
              </Box>
            )}
          >
            {channelOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>القناة الافتراضية</InputLabel>
          <Select
            value={formData.defaultChannel}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, defaultChannel: e.target.value as NotificationChannel }))
            }
            label="القناة الافتراضية"
            disabled={isLoading}
            size={isMobile ? 'small' : 'medium'}
            error={!isDefaultChannelValid}
          >
            {formData.allowedChannels.map((channel) => {
              const option = channelOptions.find((opt) => opt.value === channel);
              return (
                <MenuItem key={channel} value={channel}>
                  {option?.label || channel}
                </MenuItem>
              );
            })}
          </Select>
          {!isDefaultChannelValid && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
              يجب اختيار قناة من القنوات المسموحة
            </Typography>
          )}
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>الأدوار المستهدفة</InputLabel>
          <Select
            multiple
            value={formData.targetRoles}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, targetRoles: e.target.value as UserRole[] }))
            }
            label="الأدوار المستهدفة"
            disabled={isLoading}
            size={isMobile ? 'small' : 'medium'}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as UserRole[]).map((value) => {
                  const option = roleOptions.find((opt) => opt.value === value);
                  return (
                    <Chip
                      key={value}
                      label={option?.label || value}
                      size="small"
                      color="secondary"
                    />
                  );
                })}
              </Box>
            )}
          >
            {roleOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={formData.isActive ?? true}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
              }
              disabled={isLoading}
            />
          }
          label="نشط"
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={onCancel} disabled={isLoading} size={isMobile ? 'small' : 'medium'}>
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !isDefaultChannelValid}
            size={isMobile ? 'small' : 'medium'}
          >
            {config ? 'تحديث' : 'إنشاء'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

