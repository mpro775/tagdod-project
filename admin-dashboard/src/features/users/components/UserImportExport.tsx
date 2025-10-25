import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  FileDownload as FileDownloadIcon,
  FileUpload as FileUploadIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface ImportResult {
  success: boolean;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: string[];
  warnings: string[];
}

interface UserImportExportProps {
  onImport: (file: File) => Promise<ImportResult>;
  onExport: (format: 'csv' | 'excel') => Promise<void>;
  onExportTemplate: () => Promise<void>;
  loading?: boolean;
}

export const UserImportExport: React.FC<UserImportExportProps> = ({
  onImport,
  onExport,
  onExportTemplate,
  loading = false,
}) => {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    setImportDialogOpen(true);
    setImportResult(null);
    setImportProgress(0);
  };

  const handleExportClick = () => {
    setExportDialogOpen(true);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const result = await onImport(file);
      setImportResult(result);
      setImportProgress(100);
      clearInterval(progressInterval);
    } catch (error) {
      setImportResult({
        success: false,
        totalRows: 0,
        successfulRows: 0,
        failedRows: 0,
        errors: ['حدث خطأ أثناء استيراد الملف'],
        warnings: [],
      });
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      await onExport(format);
      setExportDialogOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleExportTemplate = async () => {
    try {
      await onExportTemplate();
    } catch (error) {
      console.error('Template export failed:', error);
    }
  };

  const resetImport = () => {
    setImportResult(null);
    setImportProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            استيراد وتصدير المستخدمين
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={handleImportClick}
              disabled={loading}
            >
              استيراد مستخدمين
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportClick}
              disabled={loading}
            >
              تصدير المستخدمين
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportTemplate}
              disabled={loading}
            >
              تحميل قالب الاستيراد
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>استيراد المستخدمين</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Alert severity="info">
              <AlertTitle>تعليمات الاستيراد</AlertTitle>
              <List dense>
                <ListItem>
                  <ListItemText primary="1. قم بتحميل قالب الاستيراد أولاً" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="2. املأ البيانات في القالب" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="3. احفظ الملف بصيغة CSV أو Excel" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="4. قم برفع الملف هنا" />
                </ListItem>
              </List>
            </Alert>
          </Box>

          <Box sx={{ mb: 3 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              startIcon={<FileUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              fullWidth
            >
              اختر ملف للاستيراد
            </Button>
          </Box>

          {importing && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                جاري استيراد الملف...
              </Typography>
              <LinearProgress variant="determinate" value={importProgress} />
            </Box>
          )}

          {importResult && (
            <Box>
              <Alert severity={importResult.success ? 'success' : 'error'} sx={{ mb: 2 }}>
                <AlertTitle>
                  {importResult.success ? 'تم الاستيراد بنجاح' : 'فشل في الاستيراد'}
                </AlertTitle>
                <Typography variant="body2">
                  تم معالجة {importResult.totalRows} صف، نجح {importResult.successfulRows} وفشل {importResult.failedRows}
                </Typography>
              </Alert>

              {importResult.errors.length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <AlertTitle>أخطاء</AlertTitle>
                  <List dense>
                    {importResult.errors.map((error, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <ErrorIcon color="error" />
                        </ListItemIcon>
                        <ListItemText primary={error} />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              )}

              {importResult.warnings.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <AlertTitle>تحذيرات</AlertTitle>
                  <List dense>
                    {importResult.warnings.map((warning, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <WarningIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText primary={warning} />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>
            إغلاق
          </Button>
          {importResult && (
            <Button onClick={resetImport} variant="outlined">
              استيراد ملف آخر
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>تصدير المستخدمين</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            اختر صيغة التصدير المطلوبة:
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={() => handleExport('csv')}
              fullWidth
              sx={{ justifyContent: 'flex-start' }}
            >
              تصدير كملف CSV
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={() => handleExport('excel')}
              fullWidth
              sx={{ justifyContent: 'flex-start' }}
            >
              تصدير كملف Excel
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Alert severity="info">
            <AlertTitle>ملاحظة</AlertTitle>
            سيتم تصدير جميع المستخدمين المطابقين للفلاتر المحددة حالياً.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>
            إلغاء
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
