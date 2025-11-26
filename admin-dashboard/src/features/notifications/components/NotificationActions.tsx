import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Send, Delete, Edit, Visibility } from '@mui/icons-material';
import { Notification } from '../types/notification.types';
import { canEditNotification, canSendNotification } from './notificationHelpers';
import { useTranslation } from 'react-i18next';

interface NotificationActionsProps {
  notification: Notification;
  onView: (notification: Notification) => void;
  onEdit: (notification: Notification) => void;
  onSend: (notification: Notification) => void;
  onDelete: (notification: Notification) => void;
  isSending?: boolean;
  isDeleting?: boolean;
}

export const NotificationActions: React.FC<NotificationActionsProps> = ({
  notification,
  onView,
  onEdit,
  onSend,
  onDelete,
  isSending = false,
  isDeleting = false,
}) => {
  const { t } = useTranslation('notifications');
  const canSend = canSendNotification(notification.status);
  const canEdit = canEditNotification(notification.status);

  return (
    <Box display="flex" gap={0.5}>
      <Tooltip title={t('actions.viewDetails')}>
        <IconButton
          size="small"
          color="info"
          onClick={(e) => {
            e.stopPropagation();
            onView(notification);
          }}
          aria-label={t('actions.viewDetails')}
        >
          <Visibility fontSize="small" />
        </IconButton>
      </Tooltip>

      {canEdit && (
        <Tooltip title={t('actions.edit')}>
          <IconButton
            size="small"
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(notification);
            }}
            aria-label={t('actions.edit')}
          >
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {canSend && (
        <Tooltip title={t('actions.send')}>
          <IconButton
            size="small"
            color="success"
            onClick={(e) => {
              e.stopPropagation();
              onSend(notification);
            }}
            disabled={isSending}
            aria-label={t('actions.send')}
          >
            <Send fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      <Tooltip title={t('actions.delete')}>
        <IconButton
          size="small"
          color="error"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification);
          }}
          disabled={isDeleting}
          aria-label={t('actions.delete')}
        >
          <Delete fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};
