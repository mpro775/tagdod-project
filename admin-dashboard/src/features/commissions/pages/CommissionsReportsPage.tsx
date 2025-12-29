import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Skeleton,
  Alert,
  IconButton,
  Collapse,
  useTheme,
  useMediaQuery,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  Assessment,
  Refresh,
  Download,
  FilterList,
  ExpandMore,
  ExpandLess,
  Visibility,
} from '@mui/icons-material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ar } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { commissionsApi } from '../api/commissionsApi';
import {
  ReportPeriod,
  CommissionsReportParams,
  EngineerCommissionData,
} from '../types/commissions.types';
import { formatNumber, formatCurrency } from '@/shared/utils/formatters';
import { useNavigate } from 'react-router-dom';
import { exportCommissionsReportToPDFFromHTML } from '../utils/exportUtils';
import { CommissionsReportTemplate } from '../components/CommissionsReportTemplate';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useEngineers } from '../../services/hooks/useServices';
import type { EngineerDetails } from '../../services/types/service.types';

export const CommissionsReportsPage: React.FC = () => {
  const { t } = useTranslation(['commissions', 'common']);
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [filterExpanded, setFilterExpanded] = useState(!isMobile);
  const [params, setParams] = useState<CommissionsReportParams>({
    period: ReportPeriod.MONTHLY,
  });
  const [engineerSelectionMode, setEngineerSelectionMode] = useState<'all' | 'specific'>('all');
  const [selectedEngineer, setSelectedEngineer] = useState<EngineerDetails | null>(null);
  const [engineerSearchTerm, setEngineerSearchTerm] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  // جلب قائمة المهندسين للبحث
  const { data: engineersData, isLoading: isEngineersLoading } = useEngineers({
    search: engineerSearchTerm,
  });
  const engineers = engineersData?.data || [];

  const {
    data: report,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['commissions-report', params],
    queryFn: () => commissionsApi.getCommissionsReport(params),
    enabled: true,
  });

  // تعريف الأعمدة للجدول
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'engineerName',
        headerName: t('commissions:reports.engineerName', 'اسم المهندس'),
        minWidth: 200,
        flex: 1,
      },
      {
        field: 'engineerPhone',
        headerName: t('commissions:reports.engineerPhone', 'رقم الهاتف'),
        minWidth: 150,
        flex: 0.8,
      },
      {
        field: 'totalCommission',
        headerName: t('commissions:reports.totalCommission', 'إجمالي العمولة'),
        minWidth: 150,
        flex: 1,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => (
          <Typography variant="body2" fontWeight="medium" color="success.main">
            {formatCurrency(params.row.totals?.totalCommission || 0)}
          </Typography>
        ),
      },
      {
        field: 'totalSales',
        headerName: t('commissions:reports.totalSales', 'إجمالي المبيعات'),
        minWidth: 120,
        flex: 0.8,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => (
          <Typography variant="body2">
            {formatNumber(params.row.totals?.totalSales || 0)}
          </Typography>
        ),
      },
      {
        field: 'totalRevenue',
        headerName: t('commissions:reports.totalRevenue', 'إجمالي الإيرادات'),
        minWidth: 150,
        flex: 1,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => (
          <Typography variant="body2" fontWeight="medium" color="info.main">
            {formatCurrency(params.row.totals?.totalRevenue || 0)}
          </Typography>
        ),
      },
      {
        field: 'actions',
        headerName: t('common:actions.actions', 'الإجراءات'),
        minWidth: 100,
        flex: 0.5,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: (params) => (
          <IconButton
            size="small"
            onClick={() => handleViewStatement(params.row.engineerId)}
            color="primary"
          >
            <Visibility />
          </IconButton>
        ),
      },
    ],
    [t]
  );

  // تحويل البيانات إلى صيغة DataTable
  const rows = useMemo(() => {
    if (!report?.engineers) return [];
    return report.engineers.map((engineer) => ({
      id: engineer.engineerId,
      engineerId: engineer.engineerId,
      engineerName: engineer.engineerName,
      engineerPhone: engineer.engineerPhone,
      totals: engineer.totals,
    }));
  }, [report?.engineers]);

  const handlePeriodChange = (period: ReportPeriod) => {
    setParams((prev) => ({
      ...prev,
      period,
      dateFrom: period === ReportPeriod.CUSTOM ? prev.dateFrom : undefined,
      dateTo: period === ReportPeriod.CUSTOM ? prev.dateTo : undefined,
    }));
  };

  const handleDateFromChange = (date: Date | null) => {
    if (date) {
      setParams((prev) => ({
        ...prev,
        dateFrom: date.toISOString().split('T')[0],
      }));
    }
  };

  const handleDateToChange = (date: Date | null) => {
    if (date) {
      setParams((prev) => ({
        ...prev,
        dateTo: date.toISOString().split('T')[0],
      }));
    }
  };

  const handleEngineerSelectionModeChange = (mode: 'all' | 'specific') => {
    setEngineerSelectionMode(mode);
    if (mode === 'all') {
      setSelectedEngineer(null);
      setParams((prev) => ({
        ...prev,
        engineerId: undefined,
      }));
    } else {
      // عند اختيار "مهندس معين"، لا نغير engineerId حتى يتم اختيار مهندس
      setParams((prev) => ({
        ...prev,
        engineerId: selectedEngineer?.engineerId || undefined,
      }));
    }
  };

  const handleEngineerSelect = (engineer: EngineerDetails | null) => {
    setSelectedEngineer(engineer);
    setParams((prev) => ({
      ...prev,
      engineerId: engineer?.engineerId || undefined,
    }));
  };

  const handleApplyFilters = () => {
    refetch();
  };

  const handleViewStatement = (engineerId: string) => {
    navigate(`/admin/commissions/statements/${engineerId}`);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ar}>
      <Box sx={{ p: 3, overflowX: 'hidden', maxWidth: '100%' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold">
            {t('commissions:reports.title', 'تقارير العمولات')}
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => refetch()}
              disabled={isLoading}
            >
              {t('common:actions.refresh', 'تحديث')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              disabled={!report || !report.summary || isLoading}
              onClick={() => {
                console.log('Export button clicked', { report, hasSummary: !!report?.summary });
                if (report && report.summary) {
                  try {
                    // استخدام الطريقة الجديدة HTML to PDF
                    exportCommissionsReportToPDFFromHTML(report);
                  } catch (error) {
                    console.error('Export error:', error);
                    alert('حدث خطأ أثناء تصدير التقرير');
                  }
                } else {
                  console.warn('Cannot export: report or summary is missing', { report });
                }
              }}
            >
              {t('commissions:reports.exportPdf', 'تصدير PDF')}
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              onClick={() => setFilterExpanded(!filterExpanded)}
              sx={{ cursor: 'pointer' }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <FilterList />
                <Typography variant="h6">{t('commissions:reports.filters', 'الفلاتر')}</Typography>
              </Box>
              <IconButton size="small">
                {filterExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>

            <Collapse in={filterExpanded}>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>{t('commissions:reports.period', 'الفترة')}</InputLabel>
                    <Select
                      value={params.period}
                      label={t('commissions:reports.period', 'الفترة')}
                      onChange={(e) => handlePeriodChange(e.target.value as ReportPeriod)}
                    >
                      <MenuItem value={ReportPeriod.DAILY}>
                        {t('commissions:reports.periods.daily', 'يومي')}
                      </MenuItem>
                      <MenuItem value={ReportPeriod.WEEKLY}>
                        {t('commissions:reports.periods.weekly', 'أسبوعي')}
                      </MenuItem>
                      <MenuItem value={ReportPeriod.MONTHLY}>
                        {t('commissions:reports.periods.monthly', 'شهري')}
                      </MenuItem>
                      <MenuItem value={ReportPeriod.YEARLY}>
                        {t('commissions:reports.periods.yearly', 'سنوي')}
                      </MenuItem>
                      <MenuItem value={ReportPeriod.CUSTOM}>
                        {t('commissions:reports.periods.custom', 'مخصص')}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {params.period === ReportPeriod.CUSTOM && (
                  <>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <DatePicker
                        label={t('commissions:reports.dateFrom', 'من تاريخ')}
                        value={params.dateFrom ? new Date(params.dateFrom) : null}
                        onChange={handleDateFromChange}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <DatePicker
                        label={t('commissions:reports.dateTo', 'إلى تاريخ')}
                        value={params.dateTo ? new Date(params.dateTo) : null}
                        onChange={handleDateToChange}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>
                  </>
                )}

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>
                      {t('commissions:reports.engineerSelection', 'اختيار المهندس')}
                    </InputLabel>
                    <Select
                      value={engineerSelectionMode}
                      label={t('commissions:reports.engineerSelection', 'اختيار المهندس')}
                      onChange={(e) =>
                        handleEngineerSelectionModeChange(e.target.value as 'all' | 'specific')
                      }
                    >
                      <MenuItem value="all">
                        {t('commissions:reports.engineerSelectionAll', 'الكل')}
                      </MenuItem>
                      <MenuItem value="specific">
                        {t('commissions:reports.engineerSelectionSpecific', 'مهندس معين')}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {engineerSelectionMode === 'specific' && (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Autocomplete
                      options={engineers}
                      getOptionLabel={(option: EngineerDetails) =>
                        `${option.engineerName} - ${option.engineerPhone}`
                      }
                      value={selectedEngineer}
                      onChange={(_, newValue) => handleEngineerSelect(newValue)}
                      loading={isEngineersLoading}
                      onInputChange={(_, newInputValue) => {
                        setEngineerSearchTerm(newInputValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={t(
                            'commissions:reports.engineerSearchPlaceholder',
                            'ابحث عن مهندس...'
                          )}
                          placeholder={t(
                            'commissions:reports.engineerSearchPlaceholder',
                            'ابحث عن مهندس...'
                          )}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {isEngineersLoading ? (
                                  <CircularProgress color="inherit" size={20} />
                                ) : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      isOptionEqualToValue={(option, value) =>
                        option.engineerId === value.engineerId
                      }
                      noOptionsText={t('commissions:reports.noEngineersFound', 'لا يوجد مهندسون')}
                    />
                  </Grid>
                )}

                <Grid size={{ xs: 12 }}>
                  <Button
                    variant="contained"
                    onClick={handleApplyFilters}
                    disabled={isLoading}
                    fullWidth={isMobile}
                  >
                    {t('common:actions.apply', 'تطبيق')}
                  </Button>
                </Grid>
              </Grid>
            </Collapse>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {t('commissions:reports.error', 'حدث خطأ أثناء جلب التقرير')}
          </Alert>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Summary Cards */}
        {report && report.summary && !isLoading && (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Assessment color="primary" />
                      <Typography variant="body2" color="text.secondary">
                        {t('commissions:reports.summary.totalEngineers', 'إجمالي المهندسين')}
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      {formatNumber(report.summary?.totalEngineers || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <TrendingUp color="success" />
                      <Typography variant="body2" color="text.secondary">
                        {t('commissions:reports.summary.totalCommissions', 'إجمالي العمولات')}
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {formatCurrency(report.summary?.totalCommissions || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Assessment color="info" />
                      <Typography variant="body2" color="text.secondary">
                        {t('commissions:reports.summary.totalSales', 'إجمالي المبيعات')}
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold" color="info.main">
                      {formatNumber(report.summary?.totalSales || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <TrendingUp color="warning" />
                      <Typography variant="body2" color="text.secondary">
                        {t('commissions:reports.summary.totalRevenue', 'إجمالي الإيرادات')}
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {formatCurrency(report.summary?.totalRevenue || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Engineers Table */}
            <Box sx={{ mt: 3 }}>
              <DataTable
                title={t('commissions:reports.engineers', 'المهندسين')}
                columns={columns}
                rows={rows}
                loading={isLoading}
                paginationMode="client"
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                getRowId={(row: unknown) => (row as EngineerCommissionData).engineerId}
                height={600}
              />
            </Box>
          </>
        )}

        {/* قالب التقرير المخفي للتصدير إلى PDF */}
        {/* الخدعة: نستخدم position fixed و left رقم سالب كبير لإخفائه عن العين */}
        {/* ولكنه يبقى موجوداً في DOM لكي يراه html2pdf */}
        {/* overflow: hidden يمنع ظهور السكرول الأفقي */}
        <div
          style={{
            position: 'fixed',
            left: '-9999px',
            top: 0,
            overflow: 'hidden',
            width: '210mm',
            maxWidth: '210mm',
          }}
        >
          {report && report.summary && (
            <CommissionsReportTemplate id="commissions-report-template-container" report={report} />
          )}
        </div>
      </Box>
    </LocalizationProvider>
  );
};
