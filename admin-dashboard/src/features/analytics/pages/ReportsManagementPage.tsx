import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Typography,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,

} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  Archive,
  Visibility,
  Refresh,
  Print,
  FileDownload,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { analyticsApi } from '../api/analyticsApi';
import {
  AdvancedReport,
  ReportCategory,
  ReportType,
  ReportFormat,
  PeriodType,
  ListReportsParams,
} from '../types/analytics.types';
import { GridRenderCellParams, GridSortModel } from '@mui/x-data-grid';

interface CreateReportFormData {
  title: string;
  description: string;
  category: ReportCategory;
  reportType: ReportType;
  period: PeriodType;
  startDate: string;
  endDate: string;
  includeCharts: boolean;
  includeRawData: boolean;
}

export const ReportsManagementPage: React.FC = () => {
  const queryClient = useQueryClient();

  // State for dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<AdvancedReport | null>(null);

  // State for filters and pagination
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'generatedAt', sort: 'desc' }]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ReportCategory | ''>('');

  // State for create report form
  const [formData, setFormData] = useState<CreateReportFormData>({
    title: '',
    description: '',
    category: ReportCategory.SALES,
    reportType: ReportType.MONTHLY_REPORT,
    period: PeriodType.MONTHLY,
    startDate: '',
    endDate: '',
    includeCharts: true,
    includeRawData: false,
  });

  // Fetch reports
  const { data: reportsData, isLoading, refetch } = useQuery({
    queryKey: ['advanced-reports', paginationModel, sortModel, searchQuery, categoryFilter],
    queryFn: async () => {
      const params: ListReportsParams = {
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
      };

      if (searchQuery) params.search = searchQuery;
      if (categoryFilter) params.category = categoryFilter;

      const response = await analyticsApi.listAdvancedReports(params);
      return {
        reports: response.data,
        total: response.meta?.total || 0,
      };
    },
  });

  // Create report mutation
  const createReportMutation = useMutation({
    mutationFn: (data: CreateReportFormData) => {
      return analyticsApi.generateAdvancedReport({
        title: data.title,
        description: data.description,
        category: data.category,
        reportType: data.reportType,
        period: data.period,
        startDate: data.startDate,
        endDate: data.endDate,
        includeCharts: data.includeCharts,
        includeRawData: data.includeRawData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advanced-reports'] });
      setCreateDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        category: ReportCategory.SALES,
        reportType: ReportType.MONTHLY_REPORT,
        period: PeriodType.MONTHLY,
        startDate: '',
        endDate: '',
        includeCharts: true,
        includeRawData: false,
      });
    },
  });

  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: (reportId: string) => analyticsApi.deleteReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advanced-reports'] });
      setDeleteDialogOpen(false);
      setSelectedReport(null);
    },
  });

  // Export report mutation
  const exportReportMutation = useMutation({
    mutationFn: ({ reportId, format }: { reportId: string; format: ReportFormat }) =>
      analyticsApi.exportReport(reportId, { format }),
  });

  // Handle create report form submission
  const handleCreateReport = () => {
    createReportMutation.mutate(formData);
  };

  // Handle delete report
  const handleDeleteReport = () => {
    if (selectedReport) {
      deleteReportMutation.mutate(selectedReport.reportId);
    }
  };

  // Handle export report
  const handleExportReport = useCallback((report: AdvancedReport, format: ReportFormat) => {
    exportReportMutation.mutate(
      { reportId: report.reportId, format },
      {
        onSuccess: (response) => {
          // Handle file download
          if (response.data?.fileUrl) {
            window.open(response.data.fileUrl, '_blank');
          }
        },
      }
    );
  }, [exportReportMutation]);

  // Handle archive report
  const handleArchiveReport = useCallback(async (report: AdvancedReport) => {
    try {
      await analyticsApi.archiveReport(report.reportId);
      queryClient.invalidateQueries({ queryKey: ['advanced-reports'] });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to archive report:', error);
    }
  }, [queryClient]);

  // DataTable columns
  const columns = useMemo(() => [
    {
      field: 'reportId',
      headerName: 'معرف التقرير',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontFamily="monospace">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'title',
      headerName: 'عنوان التقرير',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'category',
      headerName: 'الفئة',
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const categoryLabels = {
          [ReportCategory.SALES]: 'المبيعات',
          [ReportCategory.PRODUCTS]: 'المنتجات',
          [ReportCategory.CUSTOMERS]: 'العملاء',
          [ReportCategory.INVENTORY]: 'المخزون',
          [ReportCategory.FINANCIAL]: 'المالية',
          [ReportCategory.MARKETING]: 'التسويق',
        };
        return (
          <Chip
            label={categoryLabels[params.value as ReportCategory] || params.value}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'period',
      headerName: 'الفترة',
      width: 100,
      renderCell: (params: GridRenderCellParams) => {
        const periodLabels = {
          [PeriodType.DAILY]: 'يومي',
          [PeriodType.WEEKLY]: 'أسبوعي',
          [PeriodType.MONTHLY]: 'شهري',
          [PeriodType.QUARTERLY]: 'ربع سنوي',
          [PeriodType.YEARLY]: 'سنوي',
        };
        return (
          <Typography variant="body2">
            {periodLabels[params.value as PeriodType] || params.value}
          </Typography>
        );
      },
    },
    {
      field: 'generatedAt',
      headerName: 'تاريخ الإنشاء',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString('ar-SA')}
        </Typography>
      ),
    },
    {
      field: 'generatedBy',
      headerName: 'أنشأه',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'isArchived',
      headerName: 'الحالة',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? 'مؤرشف' : 'نشط'}
          color={params.value ? 'default' : 'success'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 200,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="عرض التقرير">
            <IconButton size="small" color="primary">
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="تعديل">
            <IconButton size="small" color="secondary">
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="تصدير PDF">
            <IconButton
              size="small"
              color="info"
              onClick={() => handleExportReport(params.row, ReportFormat.PDF)}
            >
              <Print fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="تصدير Excel">
            <IconButton
              size="small"
              color="success"
              onClick={() => handleExportReport(params.row, ReportFormat.EXCEL)}
            >
              <FileDownload fontSize="small" />
            </IconButton>
          </Tooltip>

          {!params.row.isArchived && (
            <Tooltip title="أرشفة">
              <IconButton
                size="small"
                color="warning"
                onClick={() => handleArchiveReport(params.row)}
              >
                <Archive fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="حذف">
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                setSelectedReport(params.row);
                setDeleteDialogOpen(true);
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ], [handleArchiveReport, handleExportReport]);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              إدارة التقارير
            </Typography>
            <Typography variant="body1" color="text.secondary">
              إنشاء وإدارة وحذف التقارير التحليلية المتقدمة
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => refetch()}
            >
              تحديث
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
            >
              إنشاء تقرير جديد
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>الفئة</InputLabel>
            <Select
              value={categoryFilter}
              label="الفئة"
              onChange={(e) => setCategoryFilter(e.target.value as ReportCategory | '')}
            >
              <MenuItem value="">جميع الفئات</MenuItem>
              <MenuItem value={ReportCategory.SALES}>المبيعات</MenuItem>
              <MenuItem value={ReportCategory.PRODUCTS}>المنتجات</MenuItem>
              <MenuItem value={ReportCategory.CUSTOMERS}>العملاء</MenuItem>
              <MenuItem value={ReportCategory.INVENTORY}>المخزون</MenuItem>
              <MenuItem value={ReportCategory.FINANCIAL}>المالية</MenuItem>
              <MenuItem value={ReportCategory.MARKETING}>التسويق</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Reports Table */}
      <DataTable
        columns={columns}
        rows={reportsData?.reports || []}
        loading={isLoading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        rowCount={reportsData?.total || 0}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        selectable={true}
        title="قائمة التقارير"
        searchPlaceholder="البحث في التقارير..."
        onSearch={setSearchQuery}
        onAdd={() => setCreateDialogOpen(true)}
        addButtonText="إنشاء تقرير جديد"
        height={600}
      />

      {/* Create Report Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>إنشاء تقرير جديد</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid  size={{xs: 12, md: 6}}>
              <TextField
                fullWidth
                label="عنوان التقرير"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
              <FormControl fullWidth required>
                <InputLabel>الفئة</InputLabel>
                <Select
                  value={formData.category}
                  label="الفئة"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ReportCategory })}
                >
                  <MenuItem value={ReportCategory.SALES}>المبيعات</MenuItem>
                  <MenuItem value={ReportCategory.PRODUCTS}>المنتجات</MenuItem>
                  <MenuItem value={ReportCategory.CUSTOMERS}>العملاء</MenuItem>
                  <MenuItem value={ReportCategory.INVENTORY}>المخزون</MenuItem>
                  <MenuItem value={ReportCategory.FINANCIAL}>المالية</MenuItem>
                  <MenuItem value={ReportCategory.MARKETING}>التسويق</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
              <FormControl fullWidth required>
                <InputLabel>نوع التقرير</InputLabel>
                <Select
                  value={formData.reportType}
                  label="نوع التقرير"
                  onChange={(e) => setFormData({ ...formData, reportType: e.target.value as ReportType })}
                >
                  <MenuItem value={ReportType.DAILY_REPORT}>تقرير يومي</MenuItem>
                  <MenuItem value={ReportType.WEEKLY_REPORT}>تقرير أسبوعي</MenuItem>
                  <MenuItem value={ReportType.MONTHLY_REPORT}>تقرير شهري</MenuItem>
                  <MenuItem value={ReportType.QUARTERLY_REPORT}>تقرير ربع سنوي</MenuItem>
                  <MenuItem value={ReportType.YEARLY_REPORT}>تقرير سنوي</MenuItem>
                  <MenuItem value={ReportType.CUSTOM_REPORT}>تقرير مخصص</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
              <FormControl fullWidth required>
                <InputLabel>الفترة</InputLabel>
                <Select
                  value={formData.period}
                  label="الفترة"
                  onChange={(e) => setFormData({ ...formData, period: e.target.value as PeriodType })}
                >
                  <MenuItem value={PeriodType.DAILY}>يومي</MenuItem>
                  <MenuItem value={PeriodType.WEEKLY}>أسبوعي</MenuItem>
                  <MenuItem value={PeriodType.MONTHLY}>شهري</MenuItem>
                  <MenuItem value={PeriodType.QUARTERLY}>ربع سنوي</MenuItem>
                  <MenuItem value={PeriodType.YEARLY}>سنوي</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
              <TextField
                fullWidth
                label="تاريخ البداية"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
              <TextField
                fullWidth
                label="تاريخ النهاية"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{xs: 12}}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="وصف التقرير"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>إلغاء</Button>
          <Button
            onClick={handleCreateReport}
            variant="contained"
            disabled={!formData.title || !formData.startDate || !formData.endDate}
          >
            إنشاء التقرير
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف التقرير "{selectedReport?.title}"؟
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            هذا الإجراء لا يمكن التراجع عنه.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
          <Button
            onClick={handleDeleteReport}
            color="error"
            variant="contained"
          >
            حذف
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Messages */}
      <Snackbar
        open={createReportMutation.isSuccess}
        autoHideDuration={6000}
        onClose={() => createReportMutation.reset()}
      >
        <Alert severity="success">
          تم إنشاء التقرير بنجاح!
        </Alert>
      </Snackbar>

      <Snackbar
        open={deleteReportMutation.isSuccess}
        autoHideDuration={6000}
        onClose={() => deleteReportMutation.reset()}
      >
        <Alert severity="success">
          تم حذف التقرير بنجاح!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!createReportMutation.error || !!deleteReportMutation.error}
        autoHideDuration={6000}
        onClose={() => {
          createReportMutation.reset();
          deleteReportMutation.reset();
        }}
      >
        <Alert severity="error">
          حدث خطأ أثناء العملية. يرجى المحاولة مرة أخرى.
        </Alert>
      </Snackbar>
    </Box>
  );
};
