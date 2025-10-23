import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Box,
  Stack,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  Copy,
  Visibility,
  VisibilityOff,
  ContentCopy,
  TrendingUp,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { CannedResponse, SupportCategory } from '../types/support.types';

interface CannedResponseCardProps {
  response: CannedResponse;
  onEdit?: (response: CannedResponse) => void;
  onDelete?: (response: CannedResponse) => void;
  onUse?: (response: CannedResponse) => void;
  onCopy?: (response: CannedResponse) => void;
}

const getCategoryLabel = (category: SupportCategory): string => {
  switch (category) {
    case SupportCategory.TECHNICAL:
      return 'تقني';
    case SupportCategory.BILLING:
      return 'الفواتير';
    case SupportCategory.PRODUCTS:
      return 'المنتجات';
    case SupportCategory.SERVICES:
      return 'الخدمات';
    case SupportCategory.ACCOUNT:
      return 'الحساب';
    case SupportCategory.OTHER:
      return 'أخرى';
    default:
      return 'عام';
  }
};

const getCategoryColor = (category: SupportCategory): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (category) {
    case SupportCategory.TECHNICAL:
      return 'primary';
    case SupportCategory.BILLING:
      return 'success';
    case SupportCategory.PRODUCTS:
      return 'info';
    case SupportCategory.SERVICES:
      return 'warning';
    case SupportCategory.ACCOUNT:
      return 'secondary';
    case SupportCategory.OTHER:
      return 'default';
    default:
      return 'default';
  }
};

export const CannedResponseCard: React.FC<CannedResponseCardProps> = ({
  response,
  onEdit,
  onDelete,
  onUse,
  onCopy,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: () => void) => {
    action();
    handleMenuClose();
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(response.content);
    handleAction(() => onCopy?.(response));
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
        opacity: response.isActive ? 1 : 0.7,
        border: response.isActive ? '1px solid' : '2px dashed',
        borderColor: response.isActive ? 'divider' : 'warning.main',
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {response.isActive ? <Visibility /> : <VisibilityOff />}
          </Avatar>
        }
        title={
          <Typography variant="h6" component="div" noWrap>
            {response.title}
          </Typography>
        }
        subheader={
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip
              label={getCategoryLabel(response.category || SupportCategory.OTHER)}
              color={getCategoryColor(response.category || SupportCategory.OTHER)}
              size="small"
              variant="outlined"
            />
            {response.shortcut && (
              <Chip
                label={`/${response.shortcut}`}
                size="small"
                variant="outlined"
                color="secondary"
              />
            )}
            <Chip
              label={`استخدام ${response.usageCount}`}
              size="small"
              variant="outlined"
              color="info"
              icon={<TrendingUp />}
            />
          </Stack>
        }
        action={
          <IconButton onClick={handleMenuClick}>
            <MoreVert />
          </IconButton>
        }
      />

      <CardContent sx={{ flexGrow: 1 }}>
        <Stack spacing={2}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '3.6em', // 3 lines height
            }}
          >
            {response.content}
          </Typography>

          {response.tags.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {response.tags.slice(0, 3).map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                  color="secondary"
                />
              ))}
              {response.tags.length > 3 && (
                <Chip
                  label={`+${response.tags.length - 3}`}
                  size="small"
                  variant="outlined"
                  color="secondary"
                />
              )}
            </Stack>
          )}

          <Box>
            <Typography variant="caption" color="text.secondary">
              تم الإنشاء: {format(new Date(response.createdAt), 'dd/MM/yyyy')}
            </Typography>
            {response.updatedAt && response.updatedAt !== response.createdAt && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                آخر تحديث: {format(new Date(response.updatedAt), 'dd/MM/yyyy')}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleCopyContent}>
          <ContentCopy sx={{ mr: 1 }} />
          نسخ المحتوى
        </MenuItem>
        <MenuItem onClick={() => handleAction(() => onUse?.(response))}>
          <TrendingUp sx={{ mr: 1 }} />
          استخدام الرد
        </MenuItem>
        <MenuItem onClick={() => handleAction(() => onEdit?.(response))}>
          <Edit sx={{ mr: 1 }} />
          تعديل
        </MenuItem>
        <MenuItem 
          onClick={() => handleAction(() => onDelete?.(response))}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} />
          حذف
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default CannedResponseCard;
