import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Stack,
  Chip,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Person,
  AdminPanelSettings,
  SystemUpdate,
  Attachment,
  VisibilityOff,
  SmartToy,
  Handshake,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { MessageType, SupportMessage } from '../types/support.types';

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
    case MessageType.AI_REPLY:
    case MessageType.AI_ACTION:
      return <SmartToy />;
    case MessageType.AI_HANDOFF:
      return <Handshake />;
    default:
      return <Person />;
  }
};

const getMessageTypeLabel = (messageType: MessageType): string => {
  switch (messageType) {
    case MessageType.USER_MESSAGE:
      return 'User Message';
    case MessageType.ADMIN_REPLY:
      return 'Admin Reply';
    case MessageType.SYSTEM_MESSAGE:
      return 'System Message';
    case MessageType.AI_REPLY:
      return 'Tejo Reply';
    case MessageType.AI_ACTION:
      return 'Tejo Action';
    case MessageType.AI_HANDOFF:
      return 'Tejo Handoff';
    default:
      return 'Message';
  }
};

const getMessageTypeColor = (
  messageType: MessageType,
): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' => {
  switch (messageType) {
    case MessageType.USER_MESSAGE:
      return 'primary';
    case MessageType.ADMIN_REPLY:
      return 'success';
    case MessageType.SYSTEM_MESSAGE:
      return 'warning';
    case MessageType.AI_REPLY:
      return 'info';
    case MessageType.AI_ACTION:
      return 'secondary';
    case MessageType.AI_HANDOFF:
      return 'error';
    default:
      return 'primary';
  }
};

export const SupportMessageBubble: React.FC<SupportMessageBubbleProps> = ({
  message,
  isCurrentUser = false,
  showSenderInfo = true,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const isInternal = message.isInternal;
  const hasAttachments = message.attachments && message.attachments.length > 0;

  const getBubbleBackgroundColor = () => {
    if (isCurrentUser) {
      return isDarkMode ? theme.palette.primary.dark : theme.palette.primary.main;
    }

    if (isInternal) {
      return isDarkMode ? alpha(theme.palette.warning.dark, 0.3) : theme.palette.warning.light;
    }

    return isDarkMode ? theme.palette.grey[800] : theme.palette.grey[100];
  };

  const getTextColor = () => {
    if (isCurrentUser) {
      return theme.palette.primary.contrastText;
    }

    return theme.palette.text.primary;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isCurrentUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        gap: 2,
        mb: 2,
        opacity: isInternal ? 0.85 : 1,
      }}
    >
      <Avatar
        sx={{
          bgcolor: `${getMessageTypeColor(message.messageType)}.main`,
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
              sx={{
                borderColor: isDarkMode
                  ? alpha(theme.palette[getMessageTypeColor(message.messageType)].main, 0.5)
                  : undefined,
              }}
            />
            {isInternal && (
              <Chip
                label="Internal"
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
          elevation={isDarkMode ? 0 : 1}
          sx={{
            p: 2,
            bgcolor: getBubbleBackgroundColor(),
            color: getTextColor(),
            borderRadius: 2,
            border: isInternal
              ? `1px dashed ${isDarkMode ? theme.palette.warning.dark : theme.palette.warning.main}`
              : isDarkMode
                ? `1px solid ${theme.palette.divider}`
                : 'none',
          }}
        >
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {message.content}
          </Typography>

          {message.payload && (
            <Box mt={1}>
              <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mb: 0.5 }}>
                Payload
              </Typography>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: isCurrentUser
                    ? alpha(theme.palette.primary.contrastText, 0.12)
                    : alpha(theme.palette.text.primary, 0.06),
                  fontSize: '0.7rem',
                  whiteSpace: 'pre-wrap',
                  direction: 'ltr',
                }}
              >
                {JSON.stringify(message.payload, null, 2)}
              </Box>
            </Box>
          )}

          {hasAttachments && (
            <>
              <Divider
                sx={{
                  my: 1,
                  opacity: 0.5,
                  borderColor: isCurrentUser
                    ? alpha(theme.palette.primary.contrastText, 0.3)
                    : theme.palette.divider,
                }}
              />
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                <Attachment fontSize="small" />
                <Typography variant="caption">{message.attachments.length} attachments</Typography>
                {message.attachments.map((attachment, index) => (
                  <Chip
                    key={index}
                    label={`Attachment ${index + 1}`}
                    size="small"
                    variant="outlined"
                    clickable
                    onClick={() => window.open(attachment, '_blank')}
                    sx={{
                      borderColor: isCurrentUser
                        ? alpha(theme.palette.primary.contrastText, 0.5)
                        : theme.palette.divider,
                      color: isCurrentUser
                        ? theme.palette.primary.contrastText
                        : theme.palette.text.primary,
                      '&:hover': {
                        bgcolor: isCurrentUser
                          ? alpha(theme.palette.primary.contrastText, 0.1)
                          : theme.palette.action.hover,
                      },
                    }}
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
            Edited: {format(new Date(message.updatedAt), 'dd/MM/yyyy HH:mm')}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default SupportMessageBubble;
