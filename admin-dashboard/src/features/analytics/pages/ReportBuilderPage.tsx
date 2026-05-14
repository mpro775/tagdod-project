import React, { useState, useCallback } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  useTheme,
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  Check,
  AutoFixHigh,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportBuilderApi } from '../../api/reportBuilderApi';
import type { ReportTemplate, GenerateCustomReportDto } from '../../types/reportBuilder.types';
import { REPORT_SECTIONS, REPORT_METRICS, REPORT_CHARTS } from '../../types/reportBuilder.types';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  { key: 'type', label: 'analytics.builder.step.type' },
  { key: 'filters', label: 'analytics.builder.step.filters' },
  { key: 'sections', label: 'analytics.builder.step.sections' },
  { key: 'preview', label: 'analytics.builder.step.preview' },
  { key: 'confirm', label: 'analytics.builder.step.confirm' },
];

const SECTION_LABELS: Record<string, string> = {
  summary: 'الملخص',
  kpis: 'مؤشرات الأداء',
  salesTrend: 'اتجاه المبيعات',
  topProducts: 'أفضل المنتجات',
  salesByCategory: 'المبيعات حسب التصنيف',
  customerSegments: 'شرائح العملاء',
  topCustomers: 'أفضل العملاء',
  inventory: 'المخزون',
  financial: 'المالي',
  recommendations: 'التوصيات',
};

export const ReportBuilderPage: React.FC = () => {
  const { t } = useTranslation('analytics');
  const theme = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeStep, setActiveStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedCharts, setSelectedCharts] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [previewData, setPreviewData] = useState<any>(null);
  const [reportTitle, setReportTitle] = useState('');
  const [reportTitleEn, setReportTitleEn] = useState('');

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['report-templates'],
    queryFn: () => reportBuilderApi.getTemplates(),
  });

  const previewMutation = useMutation({
    mutationFn: (data: any) => reportBuilderApi.previewCustomReport(data),
    onSuccess: (data) => {
      setPreviewData(data);
    },
  });

  const generateMutation = useMutation({
    mutationFn: (data: GenerateCustomReportDto) => reportBuilderApi.generateCustomReport(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['advanced-reports'] });
      navigate(`/analytics/reports/${data.id}`);
    },
  });

  const handleTemplateSelect = useCallback((template: ReportTemplate) => {
    setSelectedTemplate(template);
    setSelectedSections(template.defaultSections || []);
    setSelectedMetrics(template.defaultMetrics || []);
    setSelectedCharts(template.defaultCharts || []);
    setReportTitle(template.name);
    setReportTitleEn(template.nameEn);
  }, []);

  const handleSectionToggle = useCallback((section: string) => {
    setSelectedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  }, []);

  const handleMetricToggle = useCallback((metric: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric]
    );
  }, []);

  const handleChartToggle = useCallback((chart: string) => {
    setSelectedCharts((prev) =>
      prev.includes(chart) ? prev.filter((c) => c !== chart) : [...prev, chart]
    );
  }, []);

  const handlePreview = useCallback(() => {
    if (!selectedTemplate) return;
    previewMutation.mutate({
      templateKey: selectedTemplate.key,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      sections: selectedSections,
      metrics: selectedMetrics,
    });
  }, [selectedTemplate, dateRange, selectedSections, selectedMetrics, previewMutation]);

  const handleGenerate = useCallback(() => {
    if (!selectedTemplate) return;
    generateMutation.mutate({
      templateKey: selectedTemplate.key,
      title: reportTitle || selectedTemplate.name,
      titleEn: reportTitleEn || selectedTemplate.nameEn,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      sections: selectedSections,
      metrics: selectedMetrics,
      charts: selectedCharts,
    });
  }, [selectedTemplate, reportTitle, reportTitleEn, dateRange, selectedSections, selectedMetrics, selectedCharts, generateMutation]);

  const handleNext = useCallback(() => {
    if (activeStep === 2) {
      handlePreview();
    }
    setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  }, [activeStep, handlePreview]);

  const handleBack = useCallback(() => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={2}>
            {(templates || []).map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.key}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedTemplate?.key === template.key ? 2 : 1,
                    borderColor: selectedTemplate?.key === template.key ? 'primary.main' : 'divider',
                  }}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardActionArea sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: template.icon?.color || '#1976d2',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                        }}
                      >
                        <AutoFixHigh />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1">{template.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {template.nameEn}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {template.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      <Chip label={`${template.availableSections.length} أقسام`} size="small" />
                      <Chip label={`${template.availableMetrics.length} مؤشرات`} size="small" />
                    </Box>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('analytics.filters.dateRange')}
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              عنوان التقرير
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="عنوان التقرير بالعربية"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <input
                  type="text"
                  value={reportTitleEn}
                  onChange={(e) => setReportTitleEn(e.target.value)}
                  placeholder="Report title in English"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              اختر أقسام التقرير
            </Typography>
            <Grid container spacing={1}>
              {(selectedTemplate?.availableSections || []).map((section) => (
                <Grid item key={section}>
                  <Chip
                    label={SECTION_LABELS[section] || section}
                    onClick={() => handleSectionToggle(section)}
                    color={selectedSections.includes(section) ? 'primary' : 'default'}
                    variant={selectedSections.includes(section) ? 'filled' : 'outlined'}
                    sx={{ m: 0.5 }}
                  />
                </Grid>
              ))}
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              اختر الرسوم البيانية
            </Typography>
            <Grid container spacing={1}>
              {REPORT_CHARTS.map((chart) => (
                <Grid item key={chart}>
                  <Chip
                    label={chart}
                    onClick={() => handleChartToggle(chart)}
                    color={selectedCharts.includes(chart) ? 'primary' : 'default'}
                    variant={selectedCharts.includes(chart) ? 'filled' : 'outlined'}
                    sx={{ m: 0.5 }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            {previewMutation.isPending ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : previewData ? (
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>
                  معاينة التقرير جاهزة
                </Alert>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      الملخص
                    </Typography>
                    {previewData.summary && (
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            إجمالي الإيرادات
                          </Typography>
                          <Typography variant="h6">
                            {previewData.summary.totalRevenue?.toLocaleString() || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            إجمالي الطلبات
                          </Typography>
                          <Typography variant="h6">
                            {previewData.summary.totalOrders?.toLocaleString() || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            متوسط قيمة الطلب
                          </Typography>
                          <Typography variant="h6">
                            {previewData.summary.averageOrderValue?.toFixed(2) || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            النمو
                          </Typography>
                          <Typography variant="h6" color={previewData.summary.salesGrowth >= 0 ? 'success.main' : 'error.main'}>
                            {previewData.summary.salesGrowth?.toFixed(1) || 0}%
                          </Typography>
                        </Grid>
                      </Grid>
                    )}
                  </CardContent>
                </Card>
              </Box>
            ) : (
              <Alert severity="info">اضغط على "التالي" لتحميل المعاينة</Alert>
            )}
          </Box>
        );

      case 4:
        return (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              جاهز لتوليد التقرير
            </Alert>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ملخص التقرير
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">القالب</Typography>
                    <Typography variant="body1">{selectedTemplate?.name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">الفترة</Typography>
                    <Typography variant="body1">
                      {dateRange.startDate} إلى {dateRange.endDate}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">الأقسام المحددة</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {selectedSections.map((s) => (
                        <Chip key={s} label={SECTION_LABELS[s] || s} size="small" />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/analytics/reports')}
          sx={{ mr: 2 }}
        >
          {t('analytics.actions.backToReports')}
        </Button>
        <Typography variant="h4">{t('analytics.builder.title')}</Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {STEPS.map((step) => (
            <Step key={step.key}>
              <StepLabel>{t(step.label)}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBack />}
          >
            السابق
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {activeStep === STEPS.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleGenerate}
                disabled={generateMutation.isPending || !selectedTemplate}
                endIcon={generateMutation.isPending ? <CircularProgress size={20} /> : <Check />}
              >
                {t('analytics.builder.generateReport')}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!selectedTemplate}
                endIcon={<ArrowForward />}
              >
                التالي
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
