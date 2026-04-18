import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useTejoSettings, useUpdateTejoSettings } from '../hooks/useTejo';

export const TejoSettingsPage: React.FC = () => {
  const { data: settings, isLoading } = useTejoSettings();
  const updateSettings = useUpdateTejoSettings();

  const initialOrder = useMemo(
    () => (settings?.providerOrder || ['gemini', 'provider-a', 'provider-b']).join(', '),
    [settings],
  );

  const [enabled, setEnabled] = useState<boolean>(settings?.enabled || false);
  const [webPilotEnabled, setWebPilotEnabled] = useState<boolean>(settings?.webPilotEnabled || false);
  const [providerOrder, setProviderOrder] = useState<string>(initialOrder);
  const [threshold, setThreshold] = useState<string>(String(settings?.threshold ?? 0.55));
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [geminiChatModel, setGeminiChatModel] = useState<string>(settings?.geminiChatModel || 'gemini-2.0-flash');
  const [geminiEmbeddingModel, setGeminiEmbeddingModel] = useState<string>(
    settings?.geminiEmbeddingModel || 'gemini-embedding-001',
  );
  const [geminiBaseUrl, setGeminiBaseUrl] = useState<string>('https://generativelanguage.googleapis.com/v1beta');

  React.useEffect(() => {
    if (!settings) return;
    setEnabled(settings.enabled);
    setWebPilotEnabled(settings.webPilotEnabled);
    setProviderOrder((settings.providerOrder || ['gemini', 'provider-a', 'provider-b']).join(', '));
    setThreshold(String(settings.threshold ?? 0.55));
    setGeminiApiKey('');
    setGeminiChatModel(settings.geminiChatModel || 'gemini-2.0-flash');
    setGeminiEmbeddingModel(settings.geminiEmbeddingModel || 'gemini-embedding-001');
    setGeminiBaseUrl(settings.geminiBaseUrl || 'https://generativelanguage.googleapis.com/v1beta');
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate({
      enabled,
      webPilotEnabled,
      providerOrder: providerOrder
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      threshold: Number(threshold),
      geminiApiKey: geminiApiKey.trim().length > 0 ? geminiApiKey.trim() : undefined,
      geminiChatModel: geminiChatModel.trim(),
      geminiEmbeddingModel: geminiEmbeddingModel.trim(),
      geminiBaseUrl: geminiBaseUrl.trim(),
    });
  };

  if (isLoading || !settings) {
    return <Typography>Loading Tejo settings...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Tejo Settings
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack spacing={2}>
          <FormControlLabel
            control={<Switch checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />}
            label="Enable Tejo"
          />

          <FormControlLabel
            control={
              <Switch
                checked={webPilotEnabled}
                onChange={(e) => setWebPilotEnabled(e.target.checked)}
              />
            }
            label="Enable Web Pilot"
          />

          <TextField
            label="Provider Order (comma separated)"
            value={providerOrder}
            onChange={(e) => setProviderOrder(e.target.value)}
            fullWidth
          />

          <TextField
            label="Gemini API Key"
            value={geminiApiKey}
            onChange={(e) => setGeminiApiKey(e.target.value)}
            placeholder={settings.hasGeminiApiKey ? 'Configured (leave empty to keep)' : 'AIza...'}
            type="password"
            fullWidth
            helperText={
              settings.hasGeminiApiKey
                ? 'Gemini API key already configured on server'
                : 'Set Gemini API key to enable real provider calls'
            }
          />

          <TextField
            label="Gemini Chat Model"
            value={geminiChatModel}
            onChange={(e) => setGeminiChatModel(e.target.value)}
            fullWidth
          />

          <TextField
            label="Gemini Embedding Model"
            value={geminiEmbeddingModel}
            onChange={(e) => setGeminiEmbeddingModel(e.target.value)}
            fullWidth
          />

          <TextField
            label="Gemini Base URL"
            value={geminiBaseUrl}
            onChange={(e) => setGeminiBaseUrl(e.target.value)}
            fullWidth
          />

          <TextField
            label="Handoff Threshold"
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            inputProps={{ min: 0, max: 1, step: 0.01 }}
          />

          <Button variant="contained" onClick={handleSave} disabled={updateSettings.isPending}>
            Save Settings
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Queue Snapshot
        </Typography>
        <pre style={{ margin: 0 }}>{JSON.stringify(settings.queue || {}, null, 2)}</pre>
      </Paper>
    </Box>
  );
};
