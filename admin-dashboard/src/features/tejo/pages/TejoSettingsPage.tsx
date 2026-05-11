import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  useRebuildQdrant,
  useTejoDiagnostics,
  useTejoSettings,
  useTejoTriggerReindex,
  useUpdateTejoSettings,
} from '../hooks/useTejo';
import type { TejoDiagnosticsResult } from '../types/tejo.types';

const splitOrder = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const SettingsSection: React.FC<{
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}> = ({ title, children, action }) => (
  <Paper sx={{ p: 2.5, borderRadius: 1 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
      <Typography variant="h6" fontWeight={700}>
        {title}
      </Typography>
      {action}
    </Stack>
    <Stack spacing={2}>{children}</Stack>
  </Paper>
);

const StatusChip: React.FC<{ configured: boolean }> = ({ configured }) => (
  <Chip
    size="small"
    color={configured ? 'success' : 'error'}
    label={configured ? 'Configured' : 'Not configured'}
  />
);

const DiagnosticsPanel: React.FC<{ result?: TejoDiagnosticsResult }> = ({ result }) => {
  if (!result) {
    return <Alert severity="info">Run a diagnostic test to see the latest result.</Alert>;
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
      <Stack spacing={1}>
        <Typography variant="subtitle2">Status: {result.status}</Typography>
        {result.provider && <Typography variant="body2">Provider: {result.provider}</Typography>}
        {result.model && <Typography variant="body2">Model: {result.model}</Typography>}
        {result.dimension !== undefined && (
          <Typography variant="body2">Dimension: {result.dimension}</Typography>
        )}
        {result.collection && (
          <Typography variant="body2">Collection: {result.collection}</Typography>
        )}
        {result.exists !== undefined && (
          <Typography variant="body2">Exists: {result.exists ? 'yes' : 'no'}</Typography>
        )}
        {result.vectorSize !== undefined && (
          <Typography variant="body2">Vector Size: {result.vectorSize}</Typography>
        )}
        {result.latencyMs !== undefined && (
          <Typography variant="body2">Latency: {result.latencyMs}ms</Typography>
        )}
        {result.results && result.results.length > 0 && (
          <Box>
            <Typography variant="subtitle2" mt={1}>
              Top Results
            </Typography>
            <Stack spacing={1} mt={1}>
              {result.results.map((item, index) => (
                <Paper key={`${item.sourceId || index}`} variant="outlined" sx={{ p: 1.5 }}>
                  <Typography variant="body2">
                    #{index + 1} score: {item.score.toFixed(4)}
                  </Typography>
                  <Typography variant="body2">
                    sourceType: {String(item.sourceType || '')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.text}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export const TejoSettingsPage: React.FC = () => {
  const { data: settings, isLoading } = useTejoSettings();
  const updateSettings = useUpdateTejoSettings();
  const reindex = useTejoTriggerReindex();
  const rebuildQdrant = useRebuildQdrant();
  const diagnostics = useTejoDiagnostics();

  const [enabled, setEnabled] = useState(false);
  const [webPilotEnabled, setWebPilotEnabled] = useState(false);
  const [tenantId, setTenantId] = useState('tajaddod');
  const [chatProviderOrder, setChatProviderOrder] = useState('gemini, provider-a, provider-b');
  const [embeddingProviderOrder, setEmbeddingProviderOrder] = useState('external-embedding');
  const [threshold, setThreshold] = useState('0.55');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [geminiChatModel, setGeminiChatModel] = useState('gemini-2.0-flash');
  const [geminiEmbeddingModel, setGeminiEmbeddingModel] = useState('gemini-embedding-001');
  const [geminiBaseUrl, setGeminiBaseUrl] = useState(
    'https://generativelanguage.googleapis.com/v1beta'
  );
  const [retrievalTopK, setRetrievalTopK] = useState('8');
  const [retrievalMinScore, setRetrievalMinScore] = useState('0.45');
  const [contextMaxChars, setContextMaxChars] = useState('6000');
  const [includeProducts, setIncludeProducts] = useState(true);
  const [includeKb, setIncludeKb] = useState(true);
  const [reindexScope, setReindexScope] = useState<'kb' | 'products' | 'all'>('all');
  const [reindexFull, setReindexFull] = useState(true);
  const [testQuestion, setTestQuestion] = useState('كيف يتم توزيع طلبات الصيانة؟');
  const [diagnosticResult, setDiagnosticResult] = useState<TejoDiagnosticsResult | undefined>();

  React.useEffect(() => {
    if (!settings) return;
    setEnabled(settings.enabled);
    setWebPilotEnabled(settings.webPilotEnabled);
    setTenantId(settings.tenantId || 'tajaddod');
    setChatProviderOrder(
      (
        settings.chatProviderOrder ||
        settings.providerOrder || ['gemini', 'provider-a', 'provider-b']
      ).join(', ')
    );
    setEmbeddingProviderOrder(
      (settings.embeddingProviderOrder || ['external-embedding']).join(', ')
    );
    setThreshold(String(settings.threshold ?? 0.55));
    setGeminiApiKey('');
    setGeminiChatModel(settings.geminiChatModel || 'gemini-2.0-flash');
    setGeminiEmbeddingModel(settings.geminiEmbeddingModel || 'gemini-embedding-001');
    setGeminiBaseUrl(settings.geminiBaseUrl || 'https://generativelanguage.googleapis.com/v1beta');
    setRetrievalTopK(String(settings.retrieval?.topK ?? 8));
    setRetrievalMinScore(String(settings.retrieval?.minScore ?? 0.45));
    setContextMaxChars(String(settings.retrieval?.contextMaxChars ?? 6000));
    setIncludeProducts(settings.retrieval?.includeProducts ?? true);
    setIncludeKb(settings.retrieval?.includeKb ?? true);
  }, [settings]);

  const embeddingProvider = splitOrder(embeddingProviderOrder)[0] || 'external-embedding';

  const handleSave = () => {
    updateSettings.mutate({
      enabled,
      webPilotEnabled,
      tenantId: tenantId.trim(),
      chatProviderOrder: splitOrder(chatProviderOrder),
      embeddingProviderOrder: splitOrder(embeddingProviderOrder),
      threshold: Number(threshold),
      geminiApiKey: geminiApiKey.trim().length > 0 ? geminiApiKey.trim() : undefined,
      geminiChatModel: geminiChatModel.trim(),
      geminiEmbeddingModel: geminiEmbeddingModel.trim(),
      geminiBaseUrl: geminiBaseUrl.trim(),
      retrievalTopK: Number(retrievalTopK),
      retrievalMinScore: Number(retrievalMinScore),
      contextMaxChars: Number(contextMaxChars),
      includeProducts,
      includeKb,
    });
  };

  const runDiagnostic = async (kind: 'gemini' | 'embedding' | 'qdrant' | 'retrieval') => {
    const result =
      kind === 'gemini'
        ? await diagnostics.testGemini.mutateAsync()
        : kind === 'embedding'
          ? await diagnostics.testEmbedding.mutateAsync()
          : kind === 'qdrant'
            ? await diagnostics.testQdrant.mutateAsync()
            : await diagnostics.testRetrieval.mutateAsync(testQuestion);
    setDiagnosticResult(result);
  };

  if (isLoading || !settings) {
    return <Typography>Loading Tejo settings...</Typography>;
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Tejo Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure chat providers, embeddings, vector storage, retrieval, and indexing.
          </Typography>
        </Box>
        <Button variant="contained" onClick={handleSave} disabled={updateSettings.isPending}>
          Save Settings
        </Button>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        <SettingsSection title="General">
          <FormControlLabel
            control={
              <Switch checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
            }
            label="Enable Tejo"
          />
          <FormControlLabel
            control={
              <Switch
                checked={webPilotEnabled}
                onChange={(event) => setWebPilotEnabled(event.target.checked)}
              />
            }
            label="Enable Web Pilot"
          />
          <TextField
            label="Tenant ID"
            value={tenantId}
            onChange={(event) => setTenantId(event.target.value)}
          />
          <TextField
            label="Handoff Threshold"
            type="number"
            value={threshold}
            onChange={(event) => setThreshold(event.target.value)}
            inputProps={{ min: 0, max: 1, step: 0.01 }}
          />
        </SettingsSection>

        <SettingsSection
          title="Chat / LLM"
          action={<StatusChip configured={settings.hasGeminiApiKey} />}
        >
          <TextField
            label="Chat Provider Order"
            value={chatProviderOrder}
            onChange={(event) => setChatProviderOrder(event.target.value)}
            fullWidth
          />
          <TextField
            label="Gemini API Key"
            value={geminiApiKey}
            onChange={(event) => setGeminiApiKey(event.target.value)}
            placeholder={settings.hasGeminiApiKey ? 'Configured (leave empty to keep)' : 'AIza...'}
            type="password"
            helperText="Stored server-side. Existing key is never displayed."
            fullWidth
          />
          <TextField
            label="Gemini Chat Model"
            value={geminiChatModel}
            onChange={(event) => setGeminiChatModel(event.target.value)}
          />
          <TextField
            label="Gemini Base URL"
            value={geminiBaseUrl}
            onChange={(event) => setGeminiBaseUrl(event.target.value)}
          />
        </SettingsSection>

        <SettingsSection title="Embedding">
          <TextField
            label="Embedding Provider Order"
            value={embeddingProviderOrder}
            onChange={(event) => setEmbeddingProviderOrder(event.target.value)}
            fullWidth
          />
          <TextField
            label="Embedding API URL"
            value={settings.embeddingUrl || ''}
            fullWidth
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Embedding Model"
            value={settings.embeddingModel || ''}
            fullWidth
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Embedding Dimension"
            value={settings.embeddingDimension || 384}
            fullWidth
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Embedding Timeout"
            value={settings.embeddingTimeoutMs || 120000}
            fullWidth
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Gemini Embedding Model"
            value={geminiEmbeddingModel}
            onChange={(event) => setGeminiEmbeddingModel(event.target.value)}
            disabled={embeddingProvider !== 'gemini'}
            helperText={
              embeddingProvider === 'gemini'
                ? 'Used only when Gemini is selected as the embedding provider.'
                : 'Not used while External Embedding API is the active provider.'
            }
          />
        </SettingsSection>

        <SettingsSection
          title="Vector Store"
          action={<StatusChip configured={settings.hasQdrantApiKey} />}
        >
          <TextField
            label="Vector Store Provider"
            value={settings.vectorStoreProvider || 'qdrant'}
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Qdrant URL"
            value={settings.qdrantUrl || ''}
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Collection Name"
            value={settings.qdrantCollection || ''}
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Vector Size"
            value={settings.qdrantVectorSize || 384}
            InputProps={{ readOnly: true }}
          />
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => runDiagnostic('qdrant')}>
              Test Qdrant
            </Button>
            <Button color="warning" variant="outlined" onClick={() => rebuildQdrant.mutate()}>
              Rebuild Collection
            </Button>
          </Stack>
        </SettingsSection>

        <SettingsSection title="Retrieval">
          <TextField
            label="Top K"
            type="number"
            value={retrievalTopK}
            onChange={(event) => setRetrievalTopK(event.target.value)}
            inputProps={{ min: 1, max: 50 }}
          />
          <TextField
            label="Minimum Score"
            type="number"
            value={retrievalMinScore}
            onChange={(event) => setRetrievalMinScore(event.target.value)}
            inputProps={{ min: 0, max: 1, step: 0.01 }}
          />
          <TextField
            label="Context Max Characters"
            type="number"
            value={contextMaxChars}
            onChange={(event) => setContextMaxChars(event.target.value)}
            inputProps={{ min: 500, max: 20000, step: 100 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={includeProducts}
                onChange={(event) => setIncludeProducts(event.target.checked)}
              />
            }
            label="Include Products"
          />
          <FormControlLabel
            control={
              <Switch
                checked={includeKb}
                onChange={(event) => setIncludeKb(event.target.checked)}
              />
            }
            label="Include Knowledge Base"
          />
          <TextField
            label="Test Retrieval Question"
            value={testQuestion}
            onChange={(event) => setTestQuestion(event.target.value)}
            fullWidth
          />
          <Button variant="outlined" onClick={() => runDiagnostic('retrieval')}>
            Test Full Retrieval
          </Button>
        </SettingsSection>

        <SettingsSection title="Diagnostics / Test Connections">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="outlined" onClick={() => runDiagnostic('gemini')}>
              Test Gemini
            </Button>
            <Button variant="outlined" onClick={() => runDiagnostic('embedding')}>
              Test Embedding API
            </Button>
            <Button variant="outlined" onClick={() => runDiagnostic('qdrant')}>
              Test Qdrant
            </Button>
          </Stack>
          <DiagnosticsPanel result={diagnosticResult} />
        </SettingsSection>

        <SettingsSection title="Reindex Management">
          <ToggleButtonGroup
            exclusive
            value={reindexScope}
            onChange={(_, value) => value && setReindexScope(value)}
            size="small"
          >
            <ToggleButton value="kb">Knowledge</ToggleButton>
            <ToggleButton value="products">Products</ToggleButton>
            <ToggleButton value="all">All</ToggleButton>
          </ToggleButtonGroup>
          <FormControlLabel
            control={
              <Switch
                checked={reindexFull}
                onChange={(event) => setReindexFull(event.target.checked)}
              />
            }
            label={reindexFull ? 'Full Reindex' : 'Incremental Reindex'}
          />
          <Button
            variant="contained"
            onClick={() => reindex.mutate({ scope: reindexScope, full: reindexFull })}
            disabled={reindex.isPending}
          >
            Start Reindex
          </Button>
          <Divider />
          <Typography variant="subtitle2">Queue Snapshot</Typography>
          <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'background.default' }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(settings.queue || {}, null, 2)}
            </pre>
          </Paper>
        </SettingsSection>
      </Box>
    </Box>
  );
};
