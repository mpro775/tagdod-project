import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Alert,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import {
  Engineering as EngineeringIcon,
  Store as StoreIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { UserRole, CapabilityStatus } from '../types/user.types';

interface UserCapabilitiesManagerProps {
  role: UserRole;
  capabilities?: {
    customer_capable: boolean;
    engineer_capable: boolean;
    engineer_status: CapabilityStatus;
    wholesale_capable: boolean;
    wholesale_status: CapabilityStatus;
    wholesale_discount_percent: number;
    admin_capable: boolean;
    admin_status: CapabilityStatus;
  } | null;
  onCapabilitiesChange: (capabilities: {
    customer_capable: boolean;
    engineer_capable: boolean;
    engineer_status: CapabilityStatus;
    wholesale_capable: boolean;
    wholesale_status: CapabilityStatus;
    wholesale_discount_percent: number;
    admin_capable: boolean;
    admin_status: CapabilityStatus;
  }) => void;
  disabled?: boolean;
}

const CAPABILITY_STATUS_LABELS: Record<CapabilityStatus, string> = {
  [CapabilityStatus.NONE]: 'غير محدد',
  [CapabilityStatus.PENDING]: 'قيد الانتظار',
  [CapabilityStatus.APPROVED]: 'معتمد',
  [CapabilityStatus.REJECTED]: 'مرفوض',
};

const CAPABILITY_STATUS_COLORS: Record<CapabilityStatus, 'default' | 'warning' | 'success' | 'error'> = {
  [CapabilityStatus.NONE]: 'default',
  [CapabilityStatus.PENDING]: 'warning',
  [CapabilityStatus.APPROVED]: 'success',
  [CapabilityStatus.REJECTED]: 'error',
};

export const UserCapabilitiesManager: React.FC<UserCapabilitiesManagerProps> = ({
  role,
  capabilities,
  onCapabilitiesChange,
  disabled = false,
}) => {
  const [capabilitiesState, setCapabilitiesState] = useState({
    customer_capable: true,
    engineer_capable: false,
    engineer_status: CapabilityStatus.NONE,
    wholesale_capable: false,
    wholesale_status: CapabilityStatus.NONE,
    wholesale_discount_percent: 0,
    admin_capable: false,
    admin_status: CapabilityStatus.NONE,
  });

  useEffect(() => {
    if (capabilities) {
      setCapabilitiesState(capabilities);
    }
  }, [capabilities]);

  useEffect(() => {
    // تحديث القدرات بناءً على الدور
    const newCapabilities = { ...capabilitiesState };
    
    switch (role) {
      case UserRole.USER:
        newCapabilities.customer_capable = true;
        newCapabilities.engineer_capable = false;
        newCapabilities.wholesale_capable = false;
        newCapabilities.admin_capable = false;
        break;
      case UserRole.ENGINEER:
        newCapabilities.customer_capable = true;
        newCapabilities.engineer_capable = true;
        newCapabilities.engineer_status = CapabilityStatus.APPROVED;
        newCapabilities.wholesale_capable = false;
        newCapabilities.admin_capable = false;
        break;
      case UserRole.MERCHANT:
        newCapabilities.customer_capable = true;
        newCapabilities.engineer_capable = false;
        newCapabilities.wholesale_capable = true;
        newCapabilities.wholesale_status = CapabilityStatus.APPROVED;
        newCapabilities.admin_capable = false;
        break;
      case UserRole.ADMIN:
        newCapabilities.customer_capable = true;
        newCapabilities.engineer_capable = false;
        newCapabilities.wholesale_capable = false;
        newCapabilities.admin_capable = true;
        newCapabilities.admin_status = CapabilityStatus.APPROVED;
        break;
      case UserRole.SUPER_ADMIN:
        newCapabilities.customer_capable = true;
        newCapabilities.engineer_capable = true;
        newCapabilities.engineer_status = CapabilityStatus.APPROVED;
        newCapabilities.wholesale_capable = true;
        newCapabilities.wholesale_status = CapabilityStatus.APPROVED;
        newCapabilities.admin_capable = true;
        newCapabilities.admin_status = CapabilityStatus.APPROVED;
        break;
    }
    
    setCapabilitiesState(newCapabilities);
    onCapabilitiesChange(newCapabilities);
  }, [role]);

  const handleCapabilityChange = (capability: string, value: boolean) => {
    const newCapabilities = { ...capabilitiesState, [capability]: value };
    
    // تحديث الحالة بناءً على التغيير
    if (capability === 'engineer_capable' && value) {
      newCapabilities.engineer_status = CapabilityStatus.APPROVED;
    } else if (capability === 'wholesale_capable' && value) {
      newCapabilities.wholesale_status = CapabilityStatus.APPROVED;
    } else if (capability === 'admin_capable' && value) {
      newCapabilities.admin_status = CapabilityStatus.APPROVED;
    }
    
    setCapabilitiesState(newCapabilities);
    onCapabilitiesChange(newCapabilities);
  };

  const handleDiscountChange = (value: number) => {
    const newCapabilities = { ...capabilitiesState, wholesale_discount_percent: value };
    setCapabilitiesState(newCapabilities);
    onCapabilitiesChange(newCapabilities);
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        إدارة القدرات
      </Typography>

      <Grid container spacing={2}>
        {/* قدرة العميل */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  قدرة العميل
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={capabilitiesState.customer_capable}
                    onChange={(e) => handleCapabilityChange('customer_capable', e.target.checked)}
                    disabled={disabled}
                  />
                }
                label="يمكنه التسوق كعميل"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                هذه القدرة متاحة لجميع المستخدمين
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* قدرة المهندس */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EngineeringIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  قدرة المهندس
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={capabilitiesState.engineer_capable}
                    onChange={(e) => handleCapabilityChange('engineer_capable', e.target.checked)}
                    disabled={disabled}
                  />
                }
                label="يمكنه العمل كمهندس"
              />
              {capabilitiesState.engineer_capable && (
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={CAPABILITY_STATUS_LABELS[capabilitiesState.engineer_status]}
                    color={CAPABILITY_STATUS_COLORS[capabilitiesState.engineer_status]}
                    size="small"
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* قدرة التاجر */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StoreIcon sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  قدرة التاجر
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={capabilitiesState.wholesale_capable}
                    onChange={(e) => handleCapabilityChange('wholesale_capable', e.target.checked)}
                    disabled={disabled}
                  />
                }
                label="يمكنه الشراء بالجملة"
              />
              {capabilitiesState.wholesale_capable && (
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={CAPABILITY_STATUS_LABELS[capabilitiesState.wholesale_status]}
                    color={CAPABILITY_STATUS_COLORS[capabilitiesState.wholesale_status]}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="نسبة خصم الجملة (%)"
                    type="number"
                    value={capabilitiesState.wholesale_discount_percent}
                    onChange={(e) => handleDiscountChange(Number(e.target.value))}
                    disabled={disabled}
                    size="small"
                    fullWidth
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* قدرة الأدمن */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AdminIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  قدرة الأدمن
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={capabilitiesState.admin_capable}
                    onChange={(e) => handleCapabilityChange('admin_capable', e.target.checked)}
                    disabled={disabled}
                  />
                }
                label="يمكنه الوصول للوحة التحكم"
              />
              {capabilitiesState.admin_capable && (
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={CAPABILITY_STATUS_LABELS[capabilitiesState.admin_status]}
                    color={CAPABILITY_STATUS_COLORS[capabilitiesState.admin_status]}
                    size="small"
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* تحذير */}
      {role === UserRole.SUPER_ADMIN && (
        <Alert severity="info" sx={{ mt: 2 }}>
          المستخدمون ذوو دور "مدير عام" لديهم جميع القدرات تلقائياً
        </Alert>
      )}
    </Box>
  );
};
