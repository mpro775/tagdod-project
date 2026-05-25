import { Stack, TextField, Button } from '@mui/material';
import { DateRange, Clear, Refresh } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export interface ProductAnalyticsToolbarProps {
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onRefresh: () => void;
  loading?: boolean;
}

export const ProductAnalyticsToolbar: React.FC<ProductAnalyticsToolbarProps> = ({
  dateRange,
  onDateRangeChange,
  onRefresh,
  loading = false,
}) => {
  const { t } = useTranslation(['products', 'common']);
  const hasDateRange = dateRange.start || dateRange.end;

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      sx={{ flexWrap: 'wrap', gap: 1 }}
    >
      <DateRange sx={{ color: 'text.secondary', fontSize: 20, flexShrink: 0 }} />
      <TextField
        label={t('products:stats.dateFrom', 'من تاريخ')}
        type="date"
        value={dateRange.start}
        onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
        InputLabelProps={{ shrink: true }}
        size="small"
        sx={{ minWidth: { xs: '100%', sm: 160 } }}
        disabled={loading}
      />
      <TextField
        label={t('products:stats.dateTo', 'إلى تاريخ')}
        type="date"
        value={dateRange.end}
        onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
        InputLabelProps={{ shrink: true }}
        size="small"
        sx={{ minWidth: { xs: '100%', sm: 160 } }}
        disabled={loading}
      />
      {hasDateRange && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<Clear />}
          onClick={() => onDateRangeChange({ start: '', end: '' })}
        >
          {t('common:actions.clear', 'مسح')}
        </Button>
      )}
      <Button
        variant="outlined"
        size="small"
        startIcon={<Refresh />}
        onClick={onRefresh}
        disabled={loading}
      >
        {t('common:actions.refresh', 'تحديث')}
      </Button>
    </Stack>
  );
};