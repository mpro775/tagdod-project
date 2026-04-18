import React from 'react';
import { Box, Grid, Paper, Stack, Typography } from '@mui/material';
import {
  useTejoAnalyticsOverview,
  useTejoAnalyticsQuality,
  useTejoAnalyticsVolume,
} from '../hooks/useTejo';

const MetricCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
  <Paper sx={{ p: 2 }}>
    <Typography variant="body2" color="text.secondary">
      {title}
    </Typography>
    <Typography variant="h5" fontWeight="bold" mt={1}>
      {value}
    </Typography>
  </Paper>
);

export const TejoAnalyticsPage: React.FC = () => {
  const { data: overview, isLoading: overviewLoading } = useTejoAnalyticsOverview();
  const { data: quality } = useTejoAnalyticsQuality();
  const { data: volume } = useTejoAnalyticsVolume();

  if (overviewLoading || !overview) {
    return <Typography>Loading Tejo analytics...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Tejo Analytics
      </Typography>

      <Grid container spacing={2} mb={2}>
        <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard title="Total Queries" value={overview.totalQueries} />
        </Grid>
        <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard title="Handoff Count" value={overview.handoffCount} />
        </Grid>
        <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard title="Avg Latency" value={`${overview.avgLatencyMs} ms`} />
        </Grid>
        <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard title="Avg Confidence" value={overview.avgConfidence.toFixed(3)} />
        </Grid>
      </Grid>

      <Grid container spacing={2} mb={2}>
        <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard title="Latency P50" value={`${overview.latencyP50Ms} ms`} />
        </Grid>
        <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard title="Latency P95" value={`${overview.latencyP95Ms} ms`} />
        </Grid>
        <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard title="Deflection Rate" value={`${(overview.deflectionRate * 100).toFixed(2)}%`} />
        </Grid>
        <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard title="Error Rate" value={`${(overview.errorRate * 100).toFixed(2)}%`} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid component="div" size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quality Metrics
            </Typography>
            <Stack spacing={1}>
              <Typography>
                Success Rate: {((quality?.successRate || overview.successRate) * 100).toFixed(2)}%
              </Typography>
              <Typography>
                Handoff Rate: {((quality?.handoffRate || overview.handoffRate) * 100).toFixed(2)}%
              </Typography>
              <Typography>
                Confidence: {(quality?.avgConfidence || overview.avgConfidence).toFixed(3)}
              </Typography>
              <Typography>
                Error Rate: {((quality?.errorRate || overview.errorRate) * 100).toFixed(2)}%
              </Typography>
              <Typography>
                Confidence Distribution: low {overview.confidenceDistribution.low}, medium {overview.confidenceDistribution.medium}, high {overview.confidenceDistribution.high}
              </Typography>
            </Stack>
          </Paper>
        </Grid>

        <Grid component="div" size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Volume Metrics
            </Typography>
            <Stack spacing={1}>
              <Typography>Total Queries: {volume?.totalQueries || overview.totalQueries}</Typography>
              <Typography>Handoff Count: {volume?.handoffCount || overview.handoffCount}</Typography>
              <Typography>
                Average Latency: {volume?.avgLatencyMs || overview.avgLatencyMs} ms
              </Typography>
              <Typography>Latency P50: {volume?.latencyP50Ms || overview.latencyP50Ms} ms</Typography>
              <Typography>Latency P95: {volume?.latencyP95Ms || overview.latencyP95Ms} ms</Typography>
              <Typography>
                Deflection Rate: {((volume?.deflectionRate || overview.deflectionRate) * 100).toFixed(2)}%
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
