import React from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Typography,
} from '@mui/material';
import { Download, SelectAll, Clear } from '@mui/icons-material';

export interface ExportFieldOption {
  key: string;
  label: string;
  default?: boolean;
}

interface ExportFieldsDialogProps {
  open: boolean;
  title: string;
  fields: ExportFieldOption[];
  activeFilters?: Array<{ label: string; value: string | number | boolean | undefined | null }>;
  loading?: boolean;
  onClose: () => void;
  onExport: (fields: string[]) => void;
}

export const ExportFieldsDialog: React.FC<ExportFieldsDialogProps> = ({
  open,
  title,
  fields,
  activeFilters = [],
  loading = false,
  onClose,
  onExport,
}) => {
  const defaultFieldKeys = React.useMemo(
    () => fields.filter((field) => field.default).map((field) => field.key),
    [fields],
  );
  const [selectedFields, setSelectedFields] = React.useState<string[]>(defaultFieldKeys);

  React.useEffect(() => {
    if (open) {
      setSelectedFields(defaultFieldKeys);
    }
  }, [defaultFieldKeys, open]);

  const toggleField = (key: string) => {
    setSelectedFields((current) =>
      current.includes(key) ? current.filter((field) => field !== key) : [...current, key],
    );
  };

  const visibleFilters = activeFilters.filter(
    (filter) => filter.value !== undefined && filter.value !== null && filter.value !== '',
  );

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 800 }}>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          {visibleFilters.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 800 }}>
                الفلاتر النشطة
              </Typography>
              <Stack direction="row" gap={1} flexWrap="wrap">
                {visibleFilters.map((filter) => (
                  <Chip
                    key={filter.label}
                    label={`${filter.label}: ${String(filter.value)}`}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Stack>
            </Box>
          )}

          <Box>
            <Stack direction="row" gap={1} sx={{ mb: 1.5 }} flexWrap="wrap">
              <Button size="small" startIcon={<SelectAll />} onClick={() => setSelectedFields(fields.map((field) => field.key))}>
                تحديد الكل
              </Button>
              <Button size="small" onClick={() => setSelectedFields(defaultFieldKeys)}>
                الحقول الأساسية
              </Button>
              <Button size="small" color="inherit" startIcon={<Clear />} onClick={() => setSelectedFields([])}>
                مسح
              </Button>
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: 1,
              }}
            >
              {fields.map((field) => (
                <FormControlLabel
                  key={field.key}
                  control={
                    <Checkbox
                      checked={selectedFields.includes(field.key)}
                      onChange={() => toggleField(field.key)}
                    />
                  }
                  label={field.label}
                  sx={{ m: 0 }}
                />
              ))}
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          إلغاء
        </Button>
        <Button
          variant="contained"
          startIcon={<Download />}
          disabled={loading || selectedFields.length === 0}
          onClick={() => onExport(selectedFields)}
        >
          {loading ? 'جاري التصدير...' : 'تصدير Excel'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
