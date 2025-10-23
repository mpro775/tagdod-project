import React from 'react';
import {
  Box,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  Typography,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { User, UserRole, UserStatus } from '../types/user.types';

interface ValidationRule {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  validator: (user: Partial<User>) => boolean;
}

const validationRules: ValidationRule[] = [
  {
    field: 'phone',
    message: 'رقم الهاتف مطلوب',
    severity: 'error',
    validator: (user) => !!user.phone && user.phone.length >= 9,
  },
  {
    field: 'phone',
    message: 'رقم الهاتف يجب أن يحتوي على أرقام فقط',
    severity: 'error',
    validator: (user) => !user.phone || /^[0-9]+$/.test(user.phone),
  },
  {
    field: 'firstName',
    message: 'الاسم الأول مطلوب',
    severity: 'warning',
    validator: (user) => !!user.firstName && user.firstName.length >= 2,
  },
  {
    field: 'roles',
    message: 'يجب تحديد دور واحد على الأقل',
    severity: 'error',
    validator: (user) => !!user.roles && user.roles.length > 0,
  },
  {
    field: 'status',
    message: 'حالة المستخدم مطلوبة',
    severity: 'error',
    validator: (user) => !!user.status,
  },
  {
    field: 'jobTitle',
    message: 'المسمى الوظيفي مطلوب للمهندسين',
    severity: 'warning',
    validator: (user) => {
      if (!user.roles?.includes(UserRole.ENGINEER)) return true;
      return !!user.jobTitle && user.jobTitle.length >= 2;
    },
  },
  {
    field: 'wholesaleDiscountPercent',
    message: 'نسبة خصم الجملة يجب أن تكون بين 0 و 100',
    severity: 'warning',
    validator: (user) => {
      if (!user.roles?.includes(UserRole.MERCHANT)) return true;
      const discount = user.capabilities?.wholesale_discount_percent;
      return discount === undefined || (discount >= 0 && discount <= 100);
    },
  },
];

interface UserValidationProps {
  user: Partial<User>;
  showWarnings?: boolean;
  showInfo?: boolean;
}

export const UserValidation: React.FC<UserValidationProps> = ({
  user,
  showWarnings = true,
  showInfo = false,
}) => {
  const errors = validationRules.filter(rule => 
    rule.severity === 'error' && !rule.validator(user)
  );
  
  const warnings = validationRules.filter(rule => 
    rule.severity === 'warning' && !rule.validator(user) && showWarnings
  );
  
  const infos = validationRules.filter(rule => 
    rule.severity === 'info' && !rule.validator(user) && showInfo
  );

  const isValid = errors.length === 0;
  const hasWarnings = warnings.length > 0;

  if (isValid && !hasWarnings && infos.length === 0) {
    return (
      <Alert severity="success" sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CheckCircleIcon sx={{ mr: 1 }} />
          <Typography variant="body2">
            جميع البيانات صحيحة ومكتملة
          </Typography>
        </Box>
      </Alert>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      {/* Errors */}
      {errors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>أخطاء يجب إصلاحها</AlertTitle>
          <List dense>
            {errors.map((error, index) => (
              <ListItem key={index} sx={{ py: 0 }}>
                <ErrorIcon color="error" sx={{ mr: 1, fontSize: '1rem' }} />
                <ListItemText
                  primary={error.message}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>تحذيرات</AlertTitle>
          <List dense>
            {warnings.map((warning, index) => (
              <ListItem key={index} sx={{ py: 0 }}>
                <WarningIcon color="warning" sx={{ mr: 1, fontSize: '1rem' }} />
                <ListItemText
                  primary={warning.message}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      {/* Info */}
      {infos.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>ملاحظات</AlertTitle>
          <List dense>
            {infos.map((info, index) => (
              <ListItem key={index} sx={{ py: 0 }}>
                <ListItemText
                  primary={info.message}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}
    </Box>
  );
};

// Hook for validation
export const useUserValidation = (user: Partial<User>) => {
  const errors = validationRules.filter(rule => 
    rule.severity === 'error' && !rule.validator(user)
  );
  
  const warnings = validationRules.filter(rule => 
    rule.severity === 'warning' && !rule.validator(user)
  );

  return {
    isValid: errors.length === 0,
    hasWarnings: warnings.length > 0,
    errors: errors.map(error => error.message),
    warnings: warnings.map(warning => warning.message),
    errorCount: errors.length,
    warningCount: warnings.length,
  };
};

// Component for showing validation status
export const UserValidationStatus: React.FC<{
  user: Partial<User>;
  compact?: boolean;
}> = ({ user, compact = false }) => {
  const { isValid, hasWarnings, errorCount, warningCount } = useUserValidation(user);

  if (compact) {
    return (
      <Box sx={{ display: 'flex', gap: 1 }}>
        {isValid ? (
          <Chip
            icon={<CheckCircleIcon />}
            label="صحيح"
            color="success"
            size="small"
          />
        ) : (
          <Chip
            icon={<ErrorIcon />}
            label={`${errorCount} خطأ`}
            color="error"
            size="small"
          />
        )}
        {hasWarnings && (
          <Chip
            icon={<WarningIcon />}
            label={`${warningCount} تحذير`}
            color="warning"
            size="small"
          />
        )}
      </Box>
    );
  }

  return <UserValidation user={user} />;
};
