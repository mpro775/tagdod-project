import React, { useMemo, useState } from 'react';
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
  TextField,
  Typography,
} from '@mui/material';
import { Add, RocketLaunch } from '@mui/icons-material';
import {
  useCreateTejoPrompt,
  useTejoPrompts,
  useTejoTriggerReindex,
  useUpdateTejoPrompt,
} from '../hooks/useTejo';
import type { TejoPrompt } from '../types/tejo.types';

const statusColor = (status: string): 'default' | 'success' | 'warning' => {
  if (status === 'active') return 'success';
  if (status === 'draft') return 'warning';
  return 'default';
};

export const TejoPromptsPage: React.FC = () => {
  const { data: prompts = [], isLoading } = useTejoPrompts();
  const createPrompt = useCreateTejoPrompt();
  const updatePrompt = useUpdateTejoPrompt();
  const triggerReindex = useTejoTriggerReindex();

  const [name, setName] = useState('tejo-v1');
  const [body, setBody] = useState('You are Tejo assistant. Keep responses concise and factual.');
  const [modelHint, setModelHint] = useState('gemini-2.0-flash');

  const activePromptId = useMemo(
    () => prompts.find((prompt) => prompt.status === 'active')?._id,
    [prompts],
  );

  const handleCreate = () => {
    createPrompt.mutate({
      name,
      body,
      modelHint,
      activate: true,
    });
  };

  const handleActivate = (prompt: TejoPrompt) => {
    if (prompt._id === activePromptId) {
      return;
    }

    updatePrompt.mutate({
      id: prompt._id,
      payload: { activate: true },
    });
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Tejo Prompts
        </Typography>

        <Button
          variant="outlined"
          startIcon={<RocketLaunch />}
          onClick={() => triggerReindex.mutate({ scope: 'all', full: false })}
          disabled={triggerReindex.isPending}
        >
          Reindex Embeddings
        </Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Create Prompt Version
        </Typography>

        <Stack spacing={2}>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <TextField
            label="Model Hint"
            value={modelHint}
            onChange={(e) => setModelHint(e.target.value)}
            fullWidth
          />
          <TextField
            label="Prompt Body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            fullWidth
            multiline
            minRows={4}
          />
          <Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreate}
              disabled={createPrompt.isPending}
            >
              Create & Activate
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Prompt Versions
        </Typography>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6}>Loading...</TableCell>
              </TableRow>
            )}
            {!isLoading && prompts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>No prompt versions found.</TableCell>
              </TableRow>
            )}
            {prompts.map((prompt) => (
              <TableRow key={prompt._id}>
                <TableCell>{prompt.name}</TableCell>
                <TableCell>{prompt.version}</TableCell>
                <TableCell>
                  <Chip size="small" label={prompt.status} color={statusColor(prompt.status)} />
                </TableCell>
                <TableCell>{prompt.modelHint || '-'}</TableCell>
                <TableCell>{new Date(prompt.updatedAt).toLocaleString()}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant={prompt._id === activePromptId ? 'contained' : 'outlined'}
                    onClick={() => handleActivate(prompt)}
                  >
                    {prompt._id === activePromptId ? 'Active' : 'Activate'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};
