import React from 'react';
import { Box, Avatar, Typography, Stack, Chip, Button } from '@mui/material';
import { Edit, Phone, WhatsApp, LocationCity } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getCityEmoji } from '@/shared/constants/yemeni-cities';
import type { EngineerProfileAdmin } from '@/features/users/types/user.types';

interface EngineerProfileHeaderProps {
  profile: EngineerProfileAdmin;
  user?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    city?: string;
  };
  onEdit?: () => void;
}

export const EngineerProfileHeader: React.FC<EngineerProfileHeaderProps> = ({
  profile,
  user,
  onEdit,
}) => {
  const { t } = useTranslation(['services', 'common']);

  const fullName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'غير محدد'
    : 'غير محدد';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Avatar
        src={profile.avatarUrl}
        sx={{
          width: 80,
          height: 80,
          bgcolor: 'primary.main',
          fontSize: '2rem',
        }}
      >
        {fullName.charAt(0)}
      </Avatar>

      <Box sx={{ flex: 1 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {fullName}
        </Typography>

        {profile.jobTitle && (
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {profile.jobTitle}
          </Typography>
        )}

        <Stack direction="row" spacing={2} flexWrap="wrap" gap={1} mt={1}>
          {user?.phone && (
            <Chip
              icon={<Phone fontSize="small" />}
              label={user.phone}
              size="small"
              variant="outlined"
            />
          )}

          {profile.whatsappNumber && (
            <Chip
              icon={<WhatsApp fontSize="small" />}
              label={profile.whatsappNumber}
              size="small"
              variant="outlined"
              color="success"
            />
          )}

          {user?.city && (
            <Chip
              icon={<LocationCity fontSize="small" />}
              label={`${getCityEmoji(user.city)} ${user.city}`}
              size="small"
              variant="outlined"
            />
          )}
        </Stack>
      </Box>

      {onEdit && (
        <Button variant="outlined" startIcon={<Edit />} onClick={onEdit}>
          {t('common:actions.edit')}
        </Button>
      )}
    </Box>
  );
};

