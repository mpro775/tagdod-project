import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Box,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Edit,
  Delete,
  ToggleOn,
  ToggleOff,
  Visibility,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { LocalOffer } from '@mui/icons-material';

interface PriceRule {
  _id: string;
  active: boolean;
  priority: number;
  startAt: string | Date;
  endAt: string | Date;
  metadata?: {
    title?: string;
    description?: string;
  };
  stats?: {
    views: number;
    appliedCount: number;
  };
}

interface PriceRuleCardProps {
  rule: PriceRule;
  onView: (rule: PriceRule) => void;
  onEdit: (rule: PriceRule) => void;
  onDelete: (rule: PriceRule) => void;
  onToggle: (rule: PriceRule) => void;
}

export const PriceRuleCard: React.FC<PriceRuleCardProps> = ({
  rule,
  onView,
  onEdit,
  onDelete,
  onToggle,
}) => {
  const { t } = useTranslation('marketing');
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        bgcolor: 'background.paper',
        '&:hover': {
          boxShadow: theme.palette.mode === 'dark' ? 8 : 4,
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 80, sm: 100 },
          bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 1.5,
        }}
      >
        <LocalOffer sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, color: 'primary.main' }} />
        <Chip
          label={rule.active ? t('status.active') : t('status.inactive')}
          color={rule.active ? 'success' : 'default'}
          size="small"
          sx={{
            position: 'absolute',
            top: 6,
            right: 6,
            fontSize: { xs: '0.65rem', sm: '0.75rem' },
            height: { xs: 20, sm: 24 },
          }}
        />
      </Box>

      <CardContent sx={{ flex: 1, p: { xs: 1, sm: 1.5 }, pb: { xs: 0.5, sm: 1 } }}>
        {/* Title */}
        <Typography
          variant="subtitle1"
          component="h3"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '0.875rem', sm: '1rem' },
            mb: 0.5,
            lineHeight: 1.3,
          }}
          noWrap
        >
          {rule.metadata?.title || t('priceRules.noTitle')}
        </Typography>

        {/* Description */}
        {rule.metadata?.description && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {rule.metadata.description}
          </Typography>
        )}

        {/* Priority */}
        <Box display="flex" alignItems="center" gap={1} mt={1}>
          <Chip
            label={t('fields.priority') + ': ' + rule.priority}
            size="small"
            color="primary"
            variant="outlined"
            sx={{
              fontSize: { xs: '0.65rem', sm: '0.7rem' },
              height: { xs: 20, sm: 22 },
            }}
          />
        </Box>

        {/* Dates */}
        <Box display="flex" flexDirection="column" gap={0.5} mt={1}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
          >
            {t('fields.startDate')}: {format(new Date(rule.startAt), 'dd/MM/yyyy')}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
          >
            {t('fields.endDate')}: {format(new Date(rule.endAt), 'dd/MM/yyyy')}
          </Typography>
        </Box>

        {/* Stats */}
        {rule.stats && (
          <Box display="flex" gap={1} mt={1}>
            <Typography
              variant="caption"
              sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
            >
              {t('fields.views')}: {rule.stats.views || 0}
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
            >
              {t('fields.applications')}: {rule.stats.appliedCount || 0}
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* Actions */}
      <CardActions
        sx={{
          p: { xs: 0.75, sm: 1 },
          pt: 0,
          justifyContent: 'center',
          gap: 0.5,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Tooltip title={t('tooltips.view')}>
          <IconButton
            size="small"
            color="info"
            onClick={() => onView(rule)}
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            <Visibility fontSize="inherit" />
          </IconButton>
        </Tooltip>

        <Tooltip title={t('tooltips.edit')}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => onEdit(rule)}
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            <Edit fontSize="inherit" />
          </IconButton>
        </Tooltip>

        <Tooltip title={rule.active ? t('tooltips.deactivate') : t('tooltips.activate')}>
          <IconButton
            size="small"
            color={rule.active ? 'warning' : 'success'}
            onClick={() => onToggle(rule)}
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            {rule.active ? <ToggleOff fontSize="inherit" /> : <ToggleOn fontSize="inherit" />}
          </IconButton>
        </Tooltip>

        <Tooltip title={t('tooltips.delete')}>
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(rule)}
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            <Delete fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

