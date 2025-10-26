import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Language,
  Add,
  Download,
  Upload,
  Search,
  TrendingUp,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { i18nApi } from '../api/i18nApi';
import type { Translation, TranslationStats } from '../api/i18nApi';
import { toast } from 'react-hot-toast';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

const NAMESPACES = [
  'common',
  'auth',
  'products',
  'orders',
  'services',
  'users',
  'settings',
  'errors',
  'validation',
  'notifications',
];

export function I18nManagementPage() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [stats, setStats] = useState<TranslationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });

  // Filters
  const [namespace, setNamespace] = useState('');
  const [search, setSearch] = useState('');
  const [missingOnly, setMissingOnly] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    key: '',
    ar: '',
    en: '',
    namespace: 'common',
    description: '',
  });

  const [importData, setImportData] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [translationsData, statsData] = await Promise.all([
        i18nApi.getTranslations({ namespace, search, missingOnly }),
        i18nApi.getStatistics(),
      ]);

      setTranslations(translationsData);
      setStats(statsData);
    } catch {
      toast.error('فشل في تحميل الترجمات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [namespace, search, missingOnly]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTranslation) {
        await i18nApi.updateTranslation(editingTranslation.key, {
          ar: formData.ar,
          en: formData.en,
          namespace: formData.namespace,
          description: formData.description,
        });
        toast.success('تم تحديث الترجمة بنجاح');
      } else {
        await i18nApi.createTranslation(formData);
        toast.success('تم إنشاء الترجمة بنجاح');
      }

      setShowDialog(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في حفظ الترجمة');
    }
  };

  const handleEdit = (translation: Translation) => {
    setEditingTranslation(translation);
    setFormData({
      key: translation.key,
      ar: translation.ar,
      en: translation.en,
      namespace: translation.namespace,
      description: translation.description || '',
    });
    setShowDialog(true);
  };

  const handleDelete = async (key: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الترجمة؟')) return;

    try {
      await i18nApi.deleteTranslation(key);
      toast.success('تم حذف الترجمة بنجاح');
      fetchData();
    } catch {
      toast.error('فشل في حذف الترجمة');
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const result = await i18nApi.exportTranslations({ format, namespace });
      
      const blob = new Blob(
        [format === 'json' ? JSON.stringify(result.data, null, 2) : result.data],
        { type: format === 'json' ? 'application/json' : 'text/csv' }
      );
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `translations-${namespace || 'all'}.${format}`;
      a.click();
      
      toast.success('تم التصدير بنجاح');
    } catch {
      toast.error('فشل في التصدير');
    }
  };

  const handleImport = async () => {
    try {
      const data = JSON.parse(importData);
      const result = await i18nApi.bulkImport({
        translations: data,
        namespace,
        overwrite: true,
      });

      toast.success(`تم استيراد ${result.imported} ترجمة، تحديث ${result.updated}`);
      setShowImportDialog(false);
      setImportData('');
      fetchData();
    } catch {
      toast.error('فشل في الاستيراد - تأكد من صحة البيانات');
    }
  };

  const resetForm = () => {
    setFormData({
      key: '',
      ar: '',
      en: '',
      namespace: 'common',
      description: '',
    });
    setEditingTranslation(null);
  };

  const columns: GridColDef[] = [
    {
      field: 'key',
      headerName: 'المفتاح',
      minWidth: 200,
      flex: 1,
      renderCell: (params) => (
        <Box
          component="code"
          sx={{
            fontSize: '0.75rem',
            bgcolor: 'action.hover',
            px: 1,
            py: 0.5,
            borderRadius: 1,
          }}
        >
          {params.row.key}
        </Box>
      ),
    },
    {
      field: 'ar',
      headerName: 'العربية',
      minWidth: 200,
      flex: 1.5,
      renderCell: (params) => (
        <Box
          sx={{
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={params.row.ar}
        >
          {params.row.ar || (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              -
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'en',
      headerName: 'الإنجليزية',
      minWidth: 200,
      flex: 1.5,
      renderCell: (params) => (
        <Box
          sx={{
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={params.row.en}
        >
          {params.row.en || (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              -
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'namespace',
      headerName: 'المساحة',
      minWidth: 120,
      flex: 0.8,
      renderCell: (params) => (
        <Chip label={params.row.namespace} size="small" variant="outlined" />
      ),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      minWidth: 180,
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="text"
            onClick={() => handleEdit(params.row)}
          >
            تعديل
          </Button>
          <Button
            size="small"
            variant="text"
            color="error"
            onClick={() => handleDelete(params.row.key)}
          >
            حذف
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            إدارة نصوص التعريب
          </Typography>
          <Typography variant="body1" color="text.secondary">
            إدارة الترجمات بالعربية والإنجليزية
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleExport('json')}
            startIcon={<Download />}
          >
            تصدير JSON
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleExport('csv')}
            startIcon={<Download />}
          >
            تصدير CSV
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowImportDialog(true)}
            startIcon={<Upload />}
          >
            استيراد
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              resetForm();
              setShowDialog(true);
            }}
            startIcon={<Add />}
          >
            إضافة ترجمة
          </Button>
        </Box>
      </Box>

      {/* Statistics */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="medium">
                      إجمالي الترجمات
                    </Typography>
                    <Language color="action" />
                  </Box>
                }
              />
              <CardContent>
                <Typography variant="h4" fontWeight="bold">
                  {stats.totalTranslations}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="medium">
                      اكتمال العربية
                    </Typography>
                    <CheckCircle color="success" />
                  </Box>
                }
              />
              <CardContent>
                <Typography variant="h4" fontWeight="bold">
                  {stats.arabicCompleteness.toFixed(1)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stats.missingArabic} ترجمة مفقودة
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="medium">
                      اكتمال الإنجليزية
                    </Typography>
                    <CheckCircle color="success" />
                  </Box>
                }
              />
              <CardContent>
                <Typography variant="h4" fontWeight="bold">
                  {stats.englishCompleteness.toFixed(1)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stats.missingEnglish} ترجمة مفقودة
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="medium">
                      المساحات
                    </Typography>
                    <TrendingUp color="action" />
                  </Box>
                }
              />
              <CardContent>
                <Typography variant="h4" fontWeight="bold">
                  {Object.keys(stats.byNamespace).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title={
            <Typography variant="h6" fontWeight="bold">
              تصفية الترجمات
            </Typography>
          }
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid component="div" size={{ xs: 12, md: 3 }}>
              <TextField
                label="البحث"
                placeholder="ابحث في المفتاح أو النص..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid component="div" size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>المساحة</InputLabel>
                <Select
                  value={namespace}
                  onChange={(e) => setNamespace(e.target.value)}
                  label="المساحة"
                >
                  <MenuItem value="">جميع المساحات</MenuItem>
                  {NAMESPACES.map((ns) => (
                    <MenuItem key={ns} value={ns}>
                      {ns}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid component="div" size={{ xs: 12, md: 3 }} sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button
                variant={missingOnly ? 'contained' : 'outlined'}
                onClick={() => setMissingOnly(!missingOnly)}
                fullWidth
                startIcon={<Warning />}
              >
                الترجمات المفقودة فقط
              </Button>
            </Grid>

            <Grid component="div" size={{ xs: 12, md: 3 }} sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setNamespace('');
                  setSearch('');
                  setMissingOnly(false);
                }}
                fullWidth
              >
                إعادة تعيين
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader
          title={
            <Typography variant="h6" fontWeight="bold">
              الترجمات
            </Typography>
          }
          subheader={
            <Typography variant="body2" color="text.secondary">
              عرض {translations.length} ترجمة
            </Typography>
          }
        />
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <DataTable 
              columns={columns} 
              rows={translations} 
              getRowId={(row: any) => row.key}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
            />
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={showDialog} 
        onClose={() => setShowDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingTranslation ? 'تعديل الترجمة' : 'إضافة ترجمة جديدة'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
              <TextField
                label="المفتاح *"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder="auth.welcome"
                required
                disabled={!!editingTranslation}
                fullWidth
              />

              <FormControl fullWidth required>
                <InputLabel>المساحة</InputLabel>
                <Select
                  value={formData.namespace}
                  onChange={(e) => setFormData({ ...formData, namespace: e.target.value })}
                  label="المساحة"
                >
                  {NAMESPACES.map((ns) => (
                    <MenuItem key={ns} value={ns}>
                      {ns}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="النص بالعربية *"
                value={formData.ar}
                onChange={(e) => setFormData({ ...formData, ar: e.target.value })}
                placeholder="النص بالعربية"
                required
                multiline
                rows={3}
                fullWidth
              />

              <TextField
                label="النص بالإنجليزية *"
                value={formData.en}
                onChange={(e) => setFormData({ ...formData, en: e.target.value })}
                placeholder="English text"
                required
                multiline
                rows={3}
                fullWidth
              />

              <TextField
                label="الوصف"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف الترجمة"
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={() => setShowDialog(false)}>
              إلغاء
            </Button>
            <Button type="submit" variant="contained">
              {editingTranslation ? 'تحديث' : 'إضافة'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Import Dialog */}
      <Dialog 
        open={showImportDialog} 
        onClose={() => setShowImportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>استيراد ترجمات</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="بيانات JSON"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder={'{\n  "key1": { "ar": "نص1", "en": "Text1" },\n  "key2": { "ar": "نص2", "en": "Text2" }\n}'}
              multiline
              rows={10}
              fullWidth
              InputProps={{
                sx: { fontFamily: 'monospace', fontSize: '0.75rem' },
              }}
            />

            <Typography variant="body2" color="text.secondary">
              * سيتم استبدال الترجمات الموجودة بنفس المفتاح
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setShowImportDialog(false)}>
            إلغاء
          </Button>
          <Button variant="contained" onClick={handleImport}>
            استيراد
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
