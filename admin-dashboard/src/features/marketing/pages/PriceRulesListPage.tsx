import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { Add, Edit, Delete, Visibility, ToggleOn, ToggleOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { usePriceRules, useDeletePriceRule, useTogglePriceRule } from '../hooks/useMarketing';

const PriceRulesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('marketing');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<any>(null);
  const [filters, setFilters] = useState({
    search: '',
    active: '',
  });

  const { data: priceRules = [] } = usePriceRules({
    search: filters.search,
    active: filters.active === 'true',
  });
  const deletePriceRule = useDeletePriceRule();
  const togglePriceRule = useTogglePriceRule();

  const handleDelete = async () => {
    if (selectedRule) {
      await deletePriceRule.mutateAsync(selectedRule._id);
      setDeleteDialogOpen(false);
      setSelectedRule(null);
    }
  };

  const handleToggle = async (rule: any) => {
    await togglePriceRule.mutateAsync(rule._id);
  };

  const filteredRules = priceRules.filter((rule) => {
    if (
      filters.search &&
      !rule.metadata?.title?.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    if (filters.active && rule.active.toString() !== filters.active) {
      return false;
    }
    return true;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{t('priceRules.title', { defaultValue: 'قاعدة الأسعار' })}</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/marketing/price-rules/new')}
        >
          {t('priceRules.createNew', { defaultValue: 'إنشاء قاعدة الأسعار' })}
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label={t('filters.search', { defaultValue: 'البحث' })}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('filters.status', { defaultValue: 'الحالة' })}</InputLabel>
              <Select
                value={filters.active}
                onChange={(e) => setFilters({ ...filters, active: e.target.value })}
                label={t('filters.status', { defaultValue: 'الحالة' })}
              >
                <MenuItem value="">{t('filters.allStatuses', { defaultValue: 'جميع الحالات' })}</MenuItem>
                <MenuItem value="true">{t('status.active', { defaultValue: 'نشط' }    )}</MenuItem>
                <MenuItem value="false">{t('status.inactive', { defaultValue: 'غير نشط' })}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? theme.palette.grey[800]
                  : theme.palette.grey[100],
            }}
          >
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>{t('table.columns.title', { defaultValue: 'العنوان' })}</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>{t('table.columns.priority', { defaultValue: 'الأولوية' }   )}</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>{t('table.columns.status', { defaultValue: 'الحالة' })}</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>{t('table.columns.startDate', { defaultValue: 'تاريخ البداية' })}</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>{t('table.columns.endDate', { defaultValue: 'تاريخ النهاية' })}</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>{t('table.columns.stats', { defaultValue: 'الإحصائيات' })}</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>{t('table.columns.actions', { defaultValue: 'الإجراءات' })}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRules.map((rule) => (
              <TableRow key={rule._id}>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2">
                      {rule.metadata?.title || t('priceRules.noTitle', { defaultValue: 'لا يوجد عنوان' })}
                    </Typography>
                    {rule.metadata?.description && (
                      <Typography variant="body2" color="text.secondary">
                        {rule.metadata.description}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>{rule.priority}</TableCell>
                <TableCell>
                  <Chip
                    label={rule.active ? t('status.active', { defaultValue: 'نشط' }) : t('status.inactive', { defaultValue: 'غير نشط' })}
                    color={rule.active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{format(new Date(rule.startAt), 'dd/MM/yyyy')}</TableCell>
                <TableCell>{format(new Date(rule.endAt), 'dd/MM/yyyy')}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">{t('fields.views', { defaultValue: 'المشاهدات' })}: {rule.stats?.views || 0}</Typography>
                    <Typography variant="body2">
                      {t('fields.applications', { defaultValue: 'التطبيقات' })}: {rule.stats?.appliedCount || 0}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/marketing/price-rules/${rule._id}`)}
                    >
                      <Visibility titleAccess={t('tooltips.view', { defaultValue: 'عرض' })} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/marketing/price-rules/${rule._id}`)}
                    >
                      <Edit titleAccess={t('tooltips.edit', { defaultValue: 'تعديل' })} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleToggle(rule)}
                      color={rule.active ? 'warning' : 'success'}
                    >
                      {rule.active ? <ToggleOff titleAccess={t('tooltips.deactivate', { defaultValue: 'تعطيل' })} /> : <ToggleOn titleAccess={t('tooltips.activate', { defaultValue: 'تفعيل' })} />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedRule(rule);
                        setDeleteDialogOpen(true);
                      }}
                      color="error"
                    >
                      <Delete titleAccess={t('tooltips.delete', { defaultValue: 'حذف' })} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('messages.deleteConfirmTitle', { defaultValue: 'تأكيد الحذف' })}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('messages.confirmDelete', { title: selectedRule?.metadata?.title, defaultValue: 'هل أنت متأكد من الحذف؟'      })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('dialogs.cancel')}</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deletePriceRule.isPending}
          >
            {t('dialogs.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PriceRulesListPage;
