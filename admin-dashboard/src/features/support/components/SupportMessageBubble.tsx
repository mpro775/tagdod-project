import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Person,
  AdminPanelSettings,
  SystemUpdate,
  Attachment,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { SupportMessage, MessageType } from '../types/support.types';

interface SupportMessageBubbleProps {
  message: SupportMessage;
  isCurrentUser?: boolean;
  showSenderInfo?: boolean;
}

const getMessageTypeIcon = (messageType: MessageType) => {
  switch (messageType) {
    case MessageType.USER_MESSAGE:
      return <Person />;
    case MessageType.ADMIN_REPLY:
      return <AdminPanelSettings />;
    case MessageType.SYSTEM_MESSAGE:
      return <SystemUpdate />;
    default:
      return <Person />;
  }
};

const getMessageTypeLabel = (messageType: MessageType): string => {
  switch (messageType) {
    case MessageType.USER_MESSAGE:
      return 'رسالة من المستخدم';
    case MessageType.ADMIN_REPLY:
      return 'رد من الدعم';
    case MessageType.SYSTEM_MESSAGE:
      return 'رسالة النظام';
    default:
      return 'رسالة';
  }
};

const getMessageTypeColor = (messageType: MessageType): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' => {
  switch (messageType) {
    case MessageType.USER_MESSAGE:
      return 'primary';
    case MessageType.ADMIN_REPLY:
      return 'success';
    case MessageType.SYSTEM_MESSAGE:
      return 'warning';
    default:
      return 'primary';
  }
};

export const SupportMessageBubble: React.FC<SupportMessageBubbleProps> = ({
  message,
  isCurrentUser = false,
  showSenderInfo = true,
}) => {
  const isInternal = message.isInternal;
  const hasAttachments = message.attachments && message.attachments.length > 0;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isCurrentUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        gap: 2,
        mb: 2,
        opacity: isInternal ? 0.7 : 1,
      }}
    >
      <Avatar
        sx={{
          bgcolor: getMessageTypeColor(message.messageType) + '.main',
          width: 40,
          height: 40,
        }}
      >
        {getMessageTypeIcon(message.messageType)}
      </Avatar>

      <Box
        sx={{
          flex: 1,
          maxWidth: '70%',
        }}
      >
        {showSenderInfo && (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            mb={1}
            sx={{
              justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
            }}
          >
            <Chip
              label={getMessageTypeLabel(message.messageType)}
              size="small"
              color={getMessageTypeColor(message.messageType)}
              variant="outlined"
            />
            {isInternal && (
              <Chip
                label="داخلي"
                size="small"
                color="warning"
                variant="outlined"
                icon={<VisibilityOff />}
              />
            )}
            <Typography variant="caption" color="text.secondary">
              {format(new Date(message.createdAt), 'dd/MM/yyyy HH:mm')}
            </Typography>
          </Stack>
        )}

        <Paper
          elevation={1}
          sx={{
            p: 2,
            bgcolor: isCurrentUser 
              ? 'primary.main' 
              : isInternal 
                ? 'warning.light' 
                : 'grey.100',
            color: isCurrentUser ? 'primary.contrastText' : 'text.primary',
            borderRadius: 2,
            border: isInternal ? '1px dashed' : 'none',
            borderColor: 'warning.main',
          }}
        >
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {message.content}
          </Typography>

          {hasAttachments && (
            <>
              <Divider sx={{ my: 1, opacity: 0.5 }} />
              <Stack direction="row" alignItems="center" spacing={1}>
                <Attachment fontSize="small" />
                <Typography variant="caption">
                  {message.attachments.length} مرفق
                </Typography>
                {message.attachments.map((attachment, index) => (
                  <Chip
                    key={index}
                    label={`مرفق ${index + 1}`}
                    size="small"
                    variant="outlined"
                    clickable
                    onClick={() => window.open(attachment, '_blank')}
                  />
                ))}
              </Stack>
            </>
          )}
        </Paper>

        {message.updatedAt && message.updatedAt !== message.createdAt && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              mt: 0.5,
              textAlign: isCurrentUser ? 'right' : 'left',
            }}
          >
            تم التعديل: {format(new Date(message.updatedAt), 'dd/MM/yyyy HH:mm')}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default SupportMessageBubble;
