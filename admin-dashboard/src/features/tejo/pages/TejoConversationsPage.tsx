import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTejoConversations } from '../hooks/useTejo';

export const TejoConversationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useTejoConversations(page, limit);

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Tejo Conversations
      </Typography>

      <Paper sx={{ p: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Created</TableCell>
              <TableCell>Intent</TableCell>
              <TableCell>Confidence</TableCell>
              <TableCell>Handoff</TableCell>
              <TableCell>Latency</TableCell>
              <TableCell>Provider</TableCell>
              <TableCell>Message</TableCell>
              <TableCell align="right">Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8}>Loading conversations...</TableCell>
              </TableRow>
            )}
            {!isLoading && data?.data?.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>No Tejo conversations found.</TableCell>
              </TableRow>
            )}
            {data?.data?.map((conversation) => (
              <TableRow key={conversation._id}>
                <TableCell>{new Date(conversation.createdAt).toLocaleString()}</TableCell>
                <TableCell>{conversation.intent}</TableCell>
                <TableCell>{conversation.confidence.toFixed(3)}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={conversation.handoffTriggered ? 'Yes' : 'No'}
                    color={conversation.handoffTriggered ? 'warning' : 'default'}
                  />
                </TableCell>
                <TableCell>{conversation.latencyMs} ms</TableCell>
                <TableCell>{conversation.provider}</TableCell>
                <TableCell>{conversation.userMessage.slice(0, 55)}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`/support/tejo/conversations/${conversation._id}`)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Stack direction="row" justifyContent="space-between" mt={2}>
          <Button onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1}>
            Previous
          </Button>
          <Typography>
            Page {data?.page || page} / {data?.totalPages || 1}
          </Typography>
          <Button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={!data || page >= (data.totalPages || 1)}
          >
            Next
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
