import React, { useState } from 'react';
import {
  Box,
  Button,
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
import { Delete, Save } from '@mui/icons-material';
import {
  useCreateTejoKnowledge,
  useDeleteTejoKnowledge,
  useTejoKnowledge,
  useUpdateTejoKnowledge,
} from '../hooks/useTejo';

export const TejoKnowledgePage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newText, setNewText] = useState('');
  const [newLocale, setNewLocale] = useState('ar,en');
  const [editTextByKey, setEditTextByKey] = useState<Record<string, string>>({});

  const { data, isLoading } = useTejoKnowledge(1, 100, query.trim() || undefined);
  const createKnowledge = useCreateTejoKnowledge();
  const updateKnowledge = useUpdateTejoKnowledge();
  const deleteKnowledge = useDeleteTejoKnowledge();

  const handleCreate = () => {
    if (!newKey.trim() || !newText.trim()) {
      return;
    }

    createKnowledge.mutate(
      {
        key: newKey.trim(),
        text: newText.trim(),
        locale: newLocale.trim() || 'ar,en',
      },
      {
        onSuccess: () => {
          setNewKey('');
          setNewText('');
        },
      },
    );
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Tejo Knowledge Base
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add Knowledge Entry
        </Typography>
        <Stack spacing={2}>
          <TextField label="Key" value={newKey} onChange={(e) => setNewKey(e.target.value)} fullWidth />
          <TextField
            label="Text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            multiline
            minRows={3}
            fullWidth
          />
          <TextField
            label="Locale"
            value={newLocale}
            onChange={(e) => setNewLocale(e.target.value)}
            fullWidth
          />
          <Box>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleCreate}
              disabled={createKnowledge.isPending}
            >
              Save Entry
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Knowledge Entries</Typography>
          <TextField
            size="small"
            label="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ minWidth: 280 }}
          />
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Key</TableCell>
              <TableCell>Locale</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Text</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5}>Loading...</TableCell>
              </TableRow>
            )}
            {!isLoading && (data?.data || []).length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>No knowledge entries found.</TableCell>
              </TableRow>
            )}
            {(data?.data || []).map((entry) => {
              const editText = editTextByKey[entry.key] ?? entry.text;
              return (
                <TableRow key={entry._id}>
                  <TableCell>{entry.key}</TableCell>
                  <TableCell>{entry.locale || '-'}</TableCell>
                  <TableCell>{entry.model || '-'}</TableCell>
                  <TableCell sx={{ minWidth: 380 }}>
                    <TextField
                      value={editText}
                      onChange={(e) =>
                        setEditTextByKey((prev) => ({
                          ...prev,
                          [entry.key]: e.target.value,
                        }))
                      }
                      multiline
                      minRows={2}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Save />}
                        onClick={() =>
                          updateKnowledge.mutate({
                            key: entry.key,
                            payload: { text: editText },
                          })
                        }
                        disabled={updateKnowledge.isPending}
                      >
                        Update
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<Delete />}
                        onClick={() => deleteKnowledge.mutate(entry.key)}
                        disabled={deleteKnowledge.isPending}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};
