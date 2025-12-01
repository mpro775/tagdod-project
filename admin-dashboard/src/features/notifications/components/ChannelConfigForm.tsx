import React, { useState, useEffect } from 'react';
import {
  Box,
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
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import {
  NotificationChannelConfig,
  CreateChannelConfigDto,
  UpdateChannelConfigDto,
  NotificationType,
  NotificationChannel,
} from '../types/notification.types';
import { UserRole } from '@/features/users/types/user.types';

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
  const { isMobile } = useBreakpoint();
  const [formData, setFormData] = useState<CreateChannelConfigDto | UpdateChannelConfigDto>(() => {
    if (config && config._id) {
      // إعداد موجود في قاعدة البيانات
      return {
        allowedChannels: config.allowedChannels.length > 0 ? config.allowedChannels : [NotificationChannel.IN_APP],
        defaultChannel: config.defaultChannel || NotificationChannel.IN_APP,
        targetRoles: config.targetRoles,
        isActive: config.isActive,
      } as UpdateChannelConfigDto;
    }
    // إنشاء إعداد جديد
    return {
      notificationType: notificationType,
      allowedChannels: [NotificationChannel.IN_APP],
      defaultChannel: NotificationChannel.IN_APP,
      targetRoles: [UserRole.USER],
      isActive: true,
    } as CreateChannelConfigDto;
  });

  useEffect(() => {
    if (config && config._id) {
      // إعداد موجود في قاعدة البيانات
      setFormData({
        allowedChannels: config.allowedChannels.length > 0 ? config.allowedChannels : [NotificationChannel.IN_APP],
        defaultChannel: config.defaultChannel || NotificationChannel.IN_APP,
        targetRoles: config.targetRoles as UserRole[],
        isActive: config.isActive,
      } as UpdateChannelConfigDto);
    } else if (notificationType) {
      // إنشاء إعداد جديد
      setFormData({
        notificationType: notificationType,
        allowedChannels: [NotificationChannel.IN_APP],
        defaultChannel: NotificationChannel.IN_APP,
        targetRoles: [UserRole.USER],
        isActive: true,
      } as CreateChannelConfigDto);
    }
  }, [config, notificationType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const allowedChannels = formData.allowedChannels || [];
    const defaultChannel = formData.defaultChannel;

    // التحقق من أن القناة الافتراضية موجودة في القنوات المسموحة
    if (!defaultChannel || !allowedChannels.includes(defaultChannel)) {
      return;
    }

    onSave(formData);
  };

  const handleAllowedChannelsChange = (channels: NotificationChannel[]) => {
    setFormData((prev) => {
      const currentDefaultChannel = prev.defaultChannel;
      const newData = { ...prev, allowedChannels: channels };
      // إذا كانت القناة الافتراضية غير موجودة في القنوات المسموحة، تغييرها
      if (!currentDefaultChannel || !channels.includes(currentDefaultChannel)) {
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

  const allowedChannels = formData.allowedChannels || [];
  const defaultChannel = formData.defaultChannel;
  const isDefaultChannelValid = defaultChannel ? allowedChannels.includes(defaultChannel) : false;

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        {!isDefaultChannelValid && (
          <Alert severity="warning">القناة الافتراضية يجب أن تكون موجودة في القنوات المسموحة</Alert>
        )}

        <FormControl fullWidth>
          <InputLabel>نوع الإشعار</InputLabel>
          <Select
            value={config?.notificationType || notificationType}
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
            value={allowedChannels}
            onChange={(e) => handleAllowedChannelsChange(e.target.value as NotificationChannel[])}
            label="القنوات المسموحة"
            disabled={isLoading}
            size={isMobile ? 'small' : 'medium'}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as NotificationChannel[]).map((value) => {
                  const option = channelOptions.find((opt) => opt.value === value);
                  return (
                    <Chip key={value} label={option?.label || value} size="small" color="primary" />
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
            value={defaultChannel || NotificationChannel.IN_APP}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                defaultChannel: e.target.value as NotificationChannel,
              }))
            }
            label="القناة الافتراضية"
            disabled={isLoading}
            size={isMobile ? 'small' : 'medium'}
            error={!isDefaultChannelValid}
          >
            {allowedChannels.map((channel) => {
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
            value={formData.targetRoles || []}
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
              onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
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
            {config && config._id ? 'تحديث' : 'إنشاء'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};
