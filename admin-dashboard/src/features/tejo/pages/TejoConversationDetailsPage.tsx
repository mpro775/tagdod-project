import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useTejoConversation } from '../hooks/useTejo';

export const TejoConversationDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: conversation, isLoading } = useTejoConversation(id || '');

  if (isLoading || !conversation) {
    return <Typography>Loading conversation...</Typography>;
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/support/tejo/conversations')}>
          Back
        </Button>
        <Typography variant="h4" fontWeight="bold">
          Tejo Conversation
        </Typography>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {new Date(conversation.createdAt).toLocaleString()}
          </Typography>

          <Stack direction="row" spacing={1}>
            <Chip label={`Intent: ${conversation.intent}`} size="small" />
            <Chip label={`Confidence: ${conversation.confidence.toFixed(3)}`} size="small" />
            <Chip label={`Provider: ${conversation.provider}`} size="small" />
            <Chip
              label={conversation.handoffTriggered ? 'Handoff Triggered' : 'No Handoff'}
              size="small"
              color={conversation.handoffTriggered ? 'warning' : 'default'}
            />
          </Stack>

          <Divider />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              User Message
            </Typography>
            <Typography variant="body1">{conversation.userMessage}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Tejo Reply
            </Typography>
            <Typography variant="body1">{conversation.reply}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Suggestions
            </Typography>
            <Typography variant="body2">{conversation.suggestions.join(' | ') || '-'}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Cards Payload
            </Typography>
            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'background.default' }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(conversation.cards, null, 2)}
              </pre>
            </Paper>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};
