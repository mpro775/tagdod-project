import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Grid,
  Pagination,
} from '@mui/material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { Edit, Delete, Visibility, ToggleOn, ToggleOff, LocalOffer } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { PriceRuleCard } from '../components';
import { usePriceRules, useDeletePriceRule, useTogglePriceRule } from '../hooks/useMarketing';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';

const PriceRulesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('marketing');
  const { isMobile } = useBreakpoint();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<any>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  const [filters, setFilters] = useState({
    search: '',
    active: '',
  });

  const { data: priceRules = [], isLoading } = usePriceRules({
    search: filters.search,
    active: filters.active === 'true' ? true : filters.active === 'false' ? false : undefined,
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

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
  };

  const handleSearch = (query: string) => {
    setFilters({ ...filters, search: query });
  };

  // Table columns
  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: t('table.columns.title'),
      width: 300,
      renderCell: (params) => {
        const rule = params.row;
        return (
          <Box sx={{ py: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {rule.metadata?.title || t('priceRules.noTitle')}
            </Typography>
            {rule.metadata?.description && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {rule.metadata.description}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: 'priority',
      headerName: t('table.columns.priority'),
      width: 120,
      align: 'center',
      renderCell: (params) => (
        <Chip label={params.row.priority} size="small" color="primary" variant="outlined" />
      ),
    },
    {
      field: 'status',
      headerName: t('table.columns.status'),
      width: 150,
      renderCell: (params) => {
        const rule = params.row;
        return (
          <Chip
            label={rule.active ? t('status.active') : t('status.inactive')}
            color={rule.active ? 'success' : 'default'}
            size="small"
          />
        );
      },
    },
    {
      field: 'startAt',
      headerName: t('table.columns.startDate'),
      width: 150,
      valueFormatter: (value) => {
        if (!value) return '-';
        try {
          const date = new Date(value as string);
          if (isNaN(date.getTime())) return '-';
          return format(date, 'dd/MM/yyyy');
        } catch {
          return '-';
        }
      },
    },
    {
      field: 'endAt',
      headerName: t('table.columns.endDate'),
      width: 150,
      valueFormatter: (value) => {
        if (!value) return '-';
        try {
          const date = new Date(value as string);
          if (isNaN(date.getTime())) return '-';
          return format(date, 'dd/MM/yyyy');
        } catch {
          return '-';
        }
      },
    },
    {
      field: 'stats',
      headerName: t('table.columns.stats'),
      width: 200,
      renderCell: (params) => {
        const rule = params.row;
        return (
          <Box>
            <Typography variant="body2">
              {t('fields.views')}: {rule.stats?.views || 0}
            </Typography>
            <Typography variant="body2">
              {t('fields.applications')}: {rule.stats?.appliedCount || 0}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: t('table.columns.actions'),
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const rule = params.row;
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title={t('tooltips.view')}>
              <IconButton
                size="small"
                color="info"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/marketing/price-rules/${rule._id}`);
                }}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('tooltips.edit')}>
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/marketing/price-rules/${rule._id}/edit`);
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={rule.active ? t('tooltips.deactivate') : t('tooltips.activate')}>
              <IconButton
                size="small"
                color={rule.active ? 'warning' : 'success'}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle(rule);
                }}
                disabled={togglePriceRule.isPending}
              >
                {rule.active ? <ToggleOff fontSize="small" /> : <ToggleOn fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title={t('tooltips.delete')}>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRule(rule);
                  setDeleteDialogOpen(true);
                }}
                disabled={deletePriceRule.isPending}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  // Filter rules client-side (since API might not support all filters)
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

  // Paginate filtered rules for mobile view
  const paginatedRules = isMobile
    ? filteredRules.slice(
        paginationModel.page * paginationModel.pageSize,
        (paginationModel.page + 1) * paginationModel.pageSize
      )
    : filteredRules;

  return (
    <Box>
      {/* Header */}
      <Box
        mb={3}
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        gap={2}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <LocalOffer fontSize={isMobile ? 'medium' : 'large'} color="primary" />
          <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            {t('priceRules.title')}
          </Typography>
        </Box>
      </Box>

      {/* Content: Mobile Cards or Desktop Table */}
      {isMobile ? (
        <Box>
          {isLoading ? (
            <Grid container spacing={2}>
              {[...Array(6)].map((_, index) => (
                <Grid size={{ xs: 12 }} key={index}>
                  <Box
                    sx={{
                      height: 400,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      animation: 'pulse 1.5s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                      },
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          ) : filteredRules.length === 0 ? (
            <Box
              textAlign="center"
              py={8}
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px dashed',
                borderColor: 'divider',
              }}
            >
              <LocalOffer sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('messages.noData')}
              </Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={2}>
                {paginatedRules.map((rule) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={rule._id}>
                    <PriceRuleCard
                      rule={rule}
                      onView={() => navigate(`/marketing/price-rules/${rule._id}`)}
                      onEdit={() => navigate(`/marketing/price-rules/${rule._id}/edit`)}
                      onToggle={() => handleToggle(rule)}
                      onDelete={() => {
                        setSelectedRule(rule);
                        setDeleteDialogOpen(true);
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
              {Math.ceil(filteredRules.length / paginationModel.pageSize) > 1 && (
                <Box display="flex" justifyContent="center" mt={4}>
                  <Pagination
                    count={Math.ceil(filteredRules.length / paginationModel.pageSize)}
                    page={paginationModel.page + 1}
                    onChange={(_, page) => {
                      handlePaginationModelChange({ ...paginationModel, page: page - 1 });
                    }}
                    color="primary"
                    size="small"
                    sx={{ '& .MuiPagination-ul': { justifyContent: 'center' } }}
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      ) : (
        <DataTable
          title={t('table.title')}
          columns={columns}
          rows={filteredRules}
          loading={isLoading}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          onSearch={handleSearch}
          searchPlaceholder={t('filters.searchPlaceholder')}
          onAdd={() => navigate('/marketing/price-rules/new')}
          addButtonText={t('table.addButton')}
          getRowId={(row) => (row as any)._id}
          onRowClick={(params) => {
            navigate(`/marketing/price-rules/${(params.row as any)._id}`);
          }}
          height="calc(100vh - 300px)"
          rowHeight={80}
        />
      )}

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t('messages.deleteConfirmTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('messages.confirmDelete', {
              title: selectedRule?.metadata?.title || t('priceRules.noTitle'),
            })}
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
