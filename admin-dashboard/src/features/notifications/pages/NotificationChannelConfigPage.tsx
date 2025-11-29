import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  InputAdornment,
  Alert,
  LinearProgress,
  Stack,
  Tooltip,
} from '@mui/material';
import { Edit, Refresh, Settings, CheckCircle, Cancel, Search } from '@mui/icons-material';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import {
  useChannelConfigs,
  useCreateChannelConfig,
  useUpdateChannelConfig,
  useDeleteChannelConfig,
  useInitializeChannelConfigs,
} from '../hooks/useNotifications';
import { ChannelConfigForm } from '../components/ChannelConfigForm';
import type {
  NotificationChannelConfig,
  CreateChannelConfigDto,
  UpdateChannelConfigDto,
} from '../types/notification.types';
import { NotificationChannel, NotificationType } from '../types/notification.types';
import { UserRole } from '@/features/users/types/user.types';

// Helper function to get role label
const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    [UserRole.USER]: 'مستخدم',
    [UserRole.ENGINEER]: 'مهندس',
    [UserRole.MERCHANT]: 'تاجر',
    [UserRole.ADMIN]: 'مدير',
    [UserRole.SUPER_ADMIN]: 'مدير عام',
  };
  return labels[role] || role;
};

export const NotificationChannelConfigPage: React.FC = () => {
  const { isMobile } = useBreakpoint();
  const [searchTerm, setSearchTerm] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<NotificationChannelConfig | null>(null);
  const [selectedType, setSelectedType] = useState<NotificationType | null>(null);

  const { data: configs = [], isLoading, refetch } = useChannelConfigs();
  const { mutate: createConfig, isPending: isCreating } = useCreateChannelConfig();
  const { mutate: updateConfig, isPending: isUpdating } = useUpdateChannelConfig();
  const { isPending: isDeleting } = useDeleteChannelConfig();
  const { mutate: initializeConfigs, isPending: isInitializing } = useInitializeChannelConfigs();

  // جلب جميع أنواع الإشعارات المتاحة
  const allNotificationTypes = Object.values(NotificationType);

  // دمج الإعدادات الموجودة مع الأنواع غير المكونة
  const allConfigs = allNotificationTypes.map((type) => {
    const existingConfig = configs.find((c) => c.notificationType === type);
    return (
      existingConfig ||
      ({
        notificationType: type,
        allowedChannels: [],
        defaultChannel: NotificationChannel.IN_APP,
        targetRoles: [],
        isActive: false,
        _id: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as NotificationChannelConfig)
    );
  });

  // فلترة حسب البحث
  const filteredConfigs = allConfigs.filter((config) =>
    config.notificationType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (config: NotificationChannelConfig | null, type?: NotificationType) => {
    if (config && config._id) {
      setSelectedConfig(config);
      setSelectedType(null);
    } else if (type) {
      setSelectedConfig(null);
      setSelectedType(type);
    }
    setEditDialogOpen(true);
  };

  const handleSave = (data: CreateChannelConfigDto | UpdateChannelConfigDto) => {
    if (selectedConfig) {
      // تحديث إعدادات موجودة
      updateConfig(
        {
          type: selectedConfig.notificationType,
          data: data as UpdateChannelConfigDto,
        },
        {
          onSuccess: () => {
            setEditDialogOpen(false);
            setSelectedConfig(null);
            setSelectedType(null);
          },
        }
      );
    } else if (selectedType) {
      // إنشاء إعدادات جديدة
      createConfig(data as CreateChannelConfigDto, {
        onSuccess: () => {
          setEditDialogOpen(false);
          setSelectedConfig(null);
          setSelectedType(null);
        },
      });
    }
  };

  const handleInitialize = () => {
    if (window.confirm('هل تريد تهيئة جميع الإعدادات بالقيم الافتراضية؟')) {
      initializeConfigs(undefined, {
        onSuccess: () => {
          refetch();
        },
      });
    }
  };

  const getChannelLabel = (channel: NotificationChannel): string => {
    const labels: Record<NotificationChannel, string> = {
      [NotificationChannel.IN_APP]: 'داخل التطبيق',
      [NotificationChannel.PUSH]: 'إشعارات الدفع',
      [NotificationChannel.SMS]: 'رسائل نصية',
      [NotificationChannel.EMAIL]: 'بريد إلكتروني',
      [NotificationChannel.DASHBOARD]: 'لوحة التحكم',
    };
    return labels[channel] || channel;
  };

  if (isLoading) {
    return (
      <Box sx={{ p: isMobile ? 1.5 : 3 }}>
        <LinearProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          جاري التحميل...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 1.5 : 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          mb: isMobile ? 2 : 3,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 2 : 0,
        }}
      >
        <Typography variant={isMobile ? 'h5' : 'h4'}>إعدادات قنوات الإشعارات</Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => refetch()}
            size={isMobile ? 'small' : 'medium'}
          >
            تحديث
          </Button>
          <Button
            variant="contained"
            startIcon={<Settings />}
            onClick={handleInitialize}
            disabled={isInitializing}
            size={isMobile ? 'small' : 'medium'}
          >
            تهيئة القيم الافتراضية
          </Button>
        </Stack>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        يمكنك تعديل القنوات المسموحة والقناة الافتراضية والأدوار المستهدفة لكل نوع إشعار. الإعدادات
        في قاعدة البيانات لها أولوية على القيم الثابتة.
      </Alert>

      <Card>
        <CardContent>
          <TextField
            fullWidth
            placeholder="البحث في أنواع الإشعارات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
            size={isMobile ? 'small' : 'medium'}
          />

          <TableContainer component={Paper} sx={{ maxHeight: '70vh' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>نوع الإشعار</TableCell>
                  <TableCell>القنوات المسموحة</TableCell>
                  <TableCell>القناة الافتراضية</TableCell>
                  <TableCell>الأدوار المستهدفة</TableCell>
                  <TableCell>الحالة</TableCell>
                  <TableCell>الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredConfigs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        لا توجد نتائج
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredConfigs.map((config) => (
                    <TableRow key={config.notificationType}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {config.notificationType}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {config.allowedChannels.length > 0 ? (
                            config.allowedChannels.map((channel) => (
                              <Chip
                                key={channel}
                                label={getChannelLabel(channel)}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            ))
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              غير محدد
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getChannelLabel(config.defaultChannel)}
                          size="small"
                          color="secondary"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {config.targetRoles.length > 0 ? (
                            config.targetRoles.map((role) => (
                              <Chip
                                key={role}
                                label={getRoleLabel(role)}
                                size="small"
                                color="default"
                                variant="outlined"
                              />
                            ))
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              غير محدد
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {config.isActive ? (
                          <Chip icon={<CheckCircle />} label="نشط" size="small" color="success" />
                        ) : (
                          <Chip icon={<Cancel />} label="غير نشط" size="small" color="default" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="تعديل">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(config)}
                            disabled={isCreating || isUpdating || isDeleting}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedConfig(null);
          setSelectedType(null);
        }}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {selectedConfig ? 'تعديل إعدادات القناة' : 'إنشاء إعدادات قناة جديدة'}
        </DialogTitle>
        <DialogContent>
          <ChannelConfigForm
            config={selectedConfig || undefined}
            notificationType={
              selectedType || selectedConfig?.notificationType || NotificationType.ORDER_CREATED
            }
            onSave={handleSave}
            onCancel={() => {
              setEditDialogOpen(false);
              setSelectedConfig(null);
              setSelectedType(null);
            }}
            isLoading={isCreating || isUpdating}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};
