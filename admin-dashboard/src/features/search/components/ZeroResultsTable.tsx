import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, ContentCopy, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useZeroResultSearches } from '../hooks/useSearch';

const PAGE_SIZE = 20;

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('ar', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export function ZeroResultsTable() {
  const { t } = useTranslation('search');
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch, isFetching } = useZeroResultSearches(PAGE_SIZE, page);

  const rows = useMemo(() => data?.data ?? [], [data]);
  const pagination = data?.pagination;
  const totalPages = Math.max(1, pagination?.totalPages ?? pagination?.pages ?? 1);

  const handleCopy = async (query: string) => {
    try {
      await navigator.clipboard.writeText(query);
      toast.success(t('zeroResults.actions.copySuccess', 'تم نسخ عبارة البحث'));
    } catch {
      toast.error(t('zeroResults.actions.copyError', 'تعذر نسخ عبارة البحث'));
    }
  };

  const handleCreateProduct = (query: string) => {
    navigate(`/products/new?source=zero-result&query=${encodeURIComponent(query)}`);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={320}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" startIcon={<Refresh />} onClick={() => refetch()}>
            {t('common.retry', 'إعادة المحاولة')}
          </Button>
        }
      >
        {error instanceof Error
          ? error.message
          : t('zeroResults.errors.loadFailed', 'فشل تحميل عمليات البحث بدون نتائج')}
      </Alert>
    );
  }

  if (rows.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          p: { xs: 3, sm: 4 },
          textAlign: 'center',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h6" color="text.primary" gutterBottom>
          {t('zeroResults.empty.title', 'لا توجد عمليات بحث بدون نتائج')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('zeroResults.empty.subtitle', 'ستظهر هنا عبارات البحث التي لم يجد لها العملاء نتائج.')}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
        p={{ xs: 1.5, sm: 2 }}
        borderBottom={1}
        borderColor="divider"
      >
        <Typography variant="h6" fontWeight={700}>
          {t('zeroResults.title', 'عمليات البحث بدون نتائج')}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Refresh />}
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {t('common.refresh', 'تحديث')}
        </Button>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('zeroResults.columns.query', 'عبارة البحث')}</TableCell>
              <TableCell align="center">{t('zeroResults.columns.count', 'العدد')}</TableCell>
              <TableCell>{t('zeroResults.columns.lastSearchedAt', 'آخر بحث')}</TableCell>
              <TableCell align="center">{t('zeroResults.columns.actions', 'الإجراءات')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={`${row.query}-${index}`} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {row.query || '-'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" dir="ltr">
                    {(row.count || 0).toLocaleString('en-US')}
                  </Typography>
                </TableCell>
                <TableCell>{formatDate(row.lastSearchedAt)}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" justifyContent="center" spacing={0.5}>
                    <Tooltip title={t('zeroResults.actions.copy', 'نسخ عبارة البحث')}>
                      <IconButton size="small" onClick={() => handleCopy(row.query)}>
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('zeroResults.actions.createProduct', 'إضافة منتج لهذه العبارة')}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleCreateProduct(row.query)}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" p={2} borderTop={1} borderColor="divider">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_event, value) => setPage(value)}
            color="primary"
            shape="rounded"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Paper>
  );
}
