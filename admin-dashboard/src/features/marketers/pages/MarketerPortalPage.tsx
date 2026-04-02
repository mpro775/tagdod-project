import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TextField,
  Typography,
} from '@mui/material';
import { Add, CameraAlt, CheckCircle, Engineering, Replay, Storefront } from '@mui/icons-material';
import {
  useCreateEngineerLead,
  useCreateMerchantLead,
  useMarketerPortalStats,
  useMarketerPortalUsers,
} from '../hooks/useMarketerPortal';

const PAGE_SIZE = 10;
const CAPTURE_MAX_WIDTH = 1280;
const UPLOAD_MAX_WIDTH = 1600;

const compressImageFile = async (file: File, maxWidth: number, quality = 0.82): Promise<File> => {
  if (!file.type.startsWith('image/')) {
    return file;
  }

  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('image_load_failed'));
      img.src = imageUrl;
    });

    const sourceWidth = image.naturalWidth;
    const sourceHeight = image.naturalHeight;

    if (!sourceWidth || !sourceHeight) {
      return file;
    }

    const ratio = sourceWidth > maxWidth ? maxWidth / sourceWidth : 1;
    const targetWidth = Math.round(sourceWidth * ratio);
    const targetHeight = Math.round(sourceHeight * ratio);

    if (ratio === 1 && file.size <= 1.5 * 1024 * 1024) {
      return file;
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), 'image/jpeg', quality);
    });

    if (!blob) {
      return file;
    }

    return new File([blob], `${file.name.replace(/\.[^.]+$/, '') || 'store-photo'}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
};

export const MarketerPortalPage = () => {
  const [activeTab, setActiveTab] = useState<'engineer' | 'merchant'>('engineer');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<'all' | 'engineer' | 'merchant'>('all');

  const [engineerForm, setEngineerForm] = useState({
    phone: '',
    firstName: '',
    lastName: '',
    city: 'صنعاء',
    jobTitle: '',
    note: '',
    password: '',
    file: null as File | null,
  });

  const [merchantForm, setMerchantForm] = useState({
    phone: '',
    firstName: '',
    lastName: '',
    city: 'صنعاء',
    storeName: '',
    note: '',
    password: '',
    file: null as File | null,
  });

  const [lastCredential, setLastCredential] = useState<{ phone: string; password?: string } | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const statsQuery = useMarketerPortalStats();
  const usersQuery = useMarketerPortalUsers({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    type,
  });
  const createEngineerMutation = useCreateEngineerLead();
  const createMerchantMutation = useCreateMerchantLead();

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleOpenCamera = async () => {
    setCameraError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('المتصفح لا يدعم فتح الكاميرا. استخدم Chrome/Safari حديث أو اختر صورة من الجهاز.');
      return;
    }

    const constraintsList: MediaStreamConstraints[] = [
      {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      },
      { video: { facingMode: 'environment' }, audio: false },
      { video: { facingMode: 'user' }, audio: false },
      { video: true, audio: false },
    ];

    try {
      for (const constraints of constraintsList) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          streamRef.current = stream;
          setCameraOpen(true);
          return;
        } catch {
          // Try next fallback constraints
        }
      }

      setCameraError('تعذر تشغيل الكاميرا على هذا الجهاز. يمكنك اختيار الصورة من الجهاز مباشرة.');
    } catch {
      setCameraError('تعذر الوصول إلى الكاميرا. تأكد من منح الصلاحية أو استخدام متصفح يدعم الكاميرا.');
    }
  };

  const handleCloseCamera = () => {
    setCameraOpen(false);
    setIsCapturing(false);
    stopCamera();
  };

  const handleCapturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      setCameraError('لم يتم تجهيز الكاميرا بعد، حاول مرة أخرى بعد ثوانٍ.');
      return;
    }

    setIsCapturing(true);
    const ratio = width > CAPTURE_MAX_WIDTH ? CAPTURE_MAX_WIDTH / width : 1;
    const targetWidth = Math.round(width * ratio);
    const targetHeight = Math.round(height * ratio);

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      setIsCapturing(false);
      return;
    }

    context.drawImage(video, 0, 0, targetWidth, targetHeight);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setIsCapturing(false);
          setCameraError('فشل التقاط الصورة. حاول مرة أخرى.');
          return;
        }

        const file = new File([blob], `store-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setMerchantForm((prev) => ({ ...prev, file }));
        setIsCapturing(false);
        handleCloseCamera();
      },
      'image/jpeg',
      0.82,
    );
  };

  const handleMerchantFileChange = async (file: File | null) => {
    if (!file) {
      setMerchantForm((prev) => ({ ...prev, file: null }));
      return;
    }

    const preparedFile = await compressImageFile(file, UPLOAD_MAX_WIDTH);
    setMerchantForm((prev) => ({ ...prev, file: preparedFile }));
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (!cameraOpen || !streamRef.current || !videoRef.current) {
      return;
    }

    const video = videoRef.current;
    video.srcObject = streamRef.current;

    const startPlayback = () => {
      void video.play().catch(() => {
        setCameraError('تم فتح الكاميرا لكن تعذر عرض الصورة. حاول إعادة الفتح أو استخدام اختيار من الجهاز.');
      });
    };

    video.onloadedmetadata = startPlayback;

    return () => {
      video.onloadedmetadata = null;
    };
  }, [cameraOpen]);

  const handleCreateEngineer = () => {
    if (!engineerForm.phone || !engineerForm.firstName || !engineerForm.file) {
      return;
    }

    createEngineerMutation.mutate(
      {
        phone: engineerForm.phone,
        firstName: engineerForm.firstName,
        lastName: engineerForm.lastName || undefined,
        city: engineerForm.city || undefined,
        jobTitle: engineerForm.jobTitle || undefined,
        note: engineerForm.note || undefined,
        password: engineerForm.password || undefined,
        file: engineerForm.file,
      },
      {
        onSuccess: (result) => {
          setLastCredential({ phone: result.phone, password: result.temporaryPassword });
          setEngineerForm({
            phone: '',
            firstName: '',
            lastName: '',
            city: 'صنعاء',
            jobTitle: '',
            note: '',
            password: '',
            file: null,
          });
        },
      },
    );
  };

  const handleCreateMerchant = () => {
    if (!merchantForm.phone || !merchantForm.firstName || !merchantForm.storeName || !merchantForm.file) {
      return;
    }

    createMerchantMutation.mutate(
      {
        phone: merchantForm.phone,
        firstName: merchantForm.firstName,
        lastName: merchantForm.lastName || undefined,
        city: merchantForm.city || undefined,
        storeName: merchantForm.storeName,
        note: merchantForm.note || undefined,
        password: merchantForm.password || undefined,
        file: merchantForm.file,
      },
      {
        onSuccess: (result) => {
          setLastCredential({ phone: result.phone, password: result.temporaryPassword });
          setMerchantForm({
            phone: '',
            firstName: '',
            lastName: '',
            city: 'صنعاء',
            storeName: '',
            note: '',
            password: '',
            file: null,
          });
        },
      },
    );
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <Stack spacing={3}>
        <Box sx={{ px: { xs: 0.5, sm: 0 } }}>
          <Typography variant="h5" fontWeight={700}>
            بوابة المسوق
          </Typography>
          <Typography variant="body2" color="text.secondary">
            إضافة مهندسين وتجار باعتماد مباشر مع حفظ التوثيق وربط كل الحسابات باسمك.
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 1.5, md: 2 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  إجمالي المضافين
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {statsQuery.isLoading ? <CircularProgress size={20} /> : statsQuery.data?.total ?? 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  المهندسون
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {statsQuery.isLoading ? <CircularProgress size={20} /> : statsQuery.data?.engineers ?? 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  التجار
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {statsQuery.isLoading ? <CircularProgress size={20} /> : statsQuery.data?.merchants ?? 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  هذا الشهر
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {statsQuery.isLoading ? <CircularProgress size={20} /> : statsQuery.data?.createdThisMonth ?? 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ p: { xs: 1.5, sm: 2.5 }, borderRadius: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_e, value) => setActiveTab(value)}
            variant="scrollable"
            allowScrollButtonsMobile
            sx={{ mb: 2 }}
          >
            <Tab
              value="engineer"
              icon={<Engineering fontSize="small" />}
              iconPosition="start"
              label="إضافة مهندس"
            />
            <Tab
              value="merchant"
              icon={<Storefront fontSize="small" />}
              iconPosition="start"
              label="إضافة تاجر"
            />
          </Tabs>

          {activeTab === 'engineer' && (
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    label="رقم الهاتف"
                    fullWidth
                    value={engineerForm.phone}
                    onChange={(event) =>
                      setEngineerForm((prev) => ({ ...prev, phone: event.target.value }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    label="الاسم الأول"
                    fullWidth
                    value={engineerForm.firstName}
                    onChange={(event) =>
                      setEngineerForm((prev) => ({ ...prev, firstName: event.target.value }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    label="الاسم الأخير"
                    fullWidth
                    value={engineerForm.lastName}
                    onChange={(event) =>
                      setEngineerForm((prev) => ({ ...prev, lastName: event.target.value }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    label="المدينة"
                    fullWidth
                    value={engineerForm.city}
                    onChange={(event) =>
                      setEngineerForm((prev) => ({ ...prev, city: event.target.value }))
                    }
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="المسمى الوظيفي"
                    fullWidth
                    value={engineerForm.jobTitle}
                    onChange={(event) =>
                      setEngineerForm((prev) => ({ ...prev, jobTitle: event.target.value }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="كلمة مرور (اختياري)"
                    fullWidth
                    value={engineerForm.password}
                    onChange={(event) =>
                      setEngineerForm((prev) => ({ ...prev, password: event.target.value }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Button variant="outlined" component="label" fullWidth sx={{ height: '56px' }}>
                    {engineerForm.file ? engineerForm.file.name : 'رفع CV (PDF/DOC)'}
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx"
                      onChange={(event) =>
                        setEngineerForm((prev) => ({ ...prev, file: event.target.files?.[0] || null }))
                      }
                    />
                  </Button>
                </Grid>
              </Grid>
              <TextField
                label="ملاحظة"
                multiline
                minRows={2}
                value={engineerForm.note}
                onChange={(event) =>
                  setEngineerForm((prev) => ({ ...prev, note: event.target.value }))
                }
              />
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateEngineer}
                disabled={createEngineerMutation.isPending}
              >
                إنشاء مهندس مع اعتماد مباشر
              </Button>
            </Stack>
          )}

          {activeTab === 'merchant' && (
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    label="رقم الهاتف"
                    fullWidth
                    value={merchantForm.phone}
                    onChange={(event) =>
                      setMerchantForm((prev) => ({ ...prev, phone: event.target.value }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    label="الاسم الأول"
                    fullWidth
                    value={merchantForm.firstName}
                    onChange={(event) =>
                      setMerchantForm((prev) => ({ ...prev, firstName: event.target.value }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    label="الاسم الأخير"
                    fullWidth
                    value={merchantForm.lastName}
                    onChange={(event) =>
                      setMerchantForm((prev) => ({ ...prev, lastName: event.target.value }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    label="المدينة"
                    fullWidth
                    value={merchantForm.city}
                    onChange={(event) =>
                      setMerchantForm((prev) => ({ ...prev, city: event.target.value }))
                    }
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="اسم المحل"
                    fullWidth
                    value={merchantForm.storeName}
                    onChange={(event) =>
                      setMerchantForm((prev) => ({ ...prev, storeName: event.target.value }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="كلمة مرور (اختياري)"
                    fullWidth
                    value={merchantForm.password}
                    onChange={(event) =>
                      setMerchantForm((prev) => ({ ...prev, password: event.target.value }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button
                      variant="contained"
                      startIcon={<CameraAlt />}
                      fullWidth
                      sx={{ height: '56px' }}
                      onClick={handleOpenCamera}
                    >
                      فتح الكاميرا وتصوير المحل
                    </Button>
                    <Button
                      variant="outlined"
                      color="inherit"
                      component="label"
                      fullWidth
                      sx={{ height: '56px' }}
                    >
                      اختيار من الجهاز
                      <input
                        type="file"
                        hidden
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        capture="environment"
                        onChange={(event) => {
                          void handleMerchantFileChange(event.target.files?.[0] || null);
                        }}
                      />
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
              {merchantForm.file && (
                <Alert
                  severity="success"
                  icon={<CheckCircle fontSize="inherit" />}
                  action={
                    <Button
                      size="small"
                      color="inherit"
                      startIcon={<Replay fontSize="small" />}
                      onClick={handleOpenCamera}
                    >
                      إعادة تصوير
                    </Button>
                  }
                >
                  تم تجهيز صورة المحل: <strong>{merchantForm.file.name}</strong>
                </Alert>
              )}
              {cameraError && <Alert severity="warning">{cameraError}</Alert>}
              <TextField
                label="ملاحظة"
                multiline
                minRows={2}
                value={merchantForm.note}
                onChange={(event) =>
                  setMerchantForm((prev) => ({ ...prev, note: event.target.value }))
                }
              />
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateMerchant}
                disabled={createMerchantMutation.isPending}
              >
                إنشاء تاجر مع اعتماد مباشر
              </Button>
            </Stack>
          )}

          {lastCredential && (
            <Alert severity="success" sx={{ mt: 2 }}>
              تم الإنشاء بنجاح. الرقم: <strong>{lastCredential.phone}</strong>
              {lastCredential.password ? (
                <>
                  {' '}
                  | كلمة المرور المؤقتة: <strong>{lastCredential.password}</strong>
                </>
              ) : null}
            </Alert>
          )}

          <Dialog
            open={cameraOpen}
            onClose={handleCloseCamera}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>تصوير واجهة المحل</DialogTitle>
            <DialogContent>
              <Box
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'grey.900',
                  mt: 1,
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', display: 'block', maxHeight: '60vh', objectFit: 'cover' }}
                />
              </Box>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                وجه الكاميرا نحو صورة المحل ثم اضغط "التقاط الصورة".
              </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={handleCloseCamera} color="inherit">
                إلغاء
              </Button>
              <Button
                variant="contained"
                onClick={handleCapturePhoto}
                startIcon={isCapturing ? <CircularProgress size={16} color="inherit" /> : <CameraAlt />}
                disabled={isCapturing}
              >
                {isCapturing ? 'جاري الالتقاط...' : 'التقاط الصورة'}
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>

        <Paper sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 3 }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
              <Typography variant="h6">المستخدمون الذين أضفتهم</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                <TextField
                  size="small"
                  label="بحث"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                />
                <TextField
                  size="small"
                  select
                  label="النوع"
                  value={type}
                  onChange={(event) => {
                    setType(event.target.value as 'all' | 'engineer' | 'merchant');
                    setPage(1);
                  }}
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value="all">الكل</MenuItem>
                  <MenuItem value="engineer">مهندس</MenuItem>
                  <MenuItem value="merchant">تاجر</MenuItem>
                </TextField>
              </Stack>
            </Stack>

            {usersQuery.isLoading ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 680 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>الاسم</TableCell>
                      <TableCell>الهاتف</TableCell>
                      <TableCell>النوع</TableCell>
                      <TableCell>حالة التوثيق</TableCell>
                      <TableCell>تاريخ الإضافة</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(usersQuery.data?.items || []).map((user) => {
                      const isEngineer = user.roles.includes('engineer');
                      const verification = isEngineer ? user.engineer_status : user.merchant_status;

                      return (
                        <TableRow key={user._id} hover>
                          <TableCell>{`${user.firstName || ''} ${user.lastName || ''}`.trim() || '-'}</TableCell>
                          <TableCell>{user.phone}</TableCell>
                          <TableCell>{isEngineer ? 'مهندس' : 'تاجر'}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={verification || '-'}
                              color={verification === 'approved' ? 'success' : 'warning'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString('ar-YE')}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                </TableContainer>

                <Stack direction="row" justifyContent="center" sx={{ pt: 1 }}>
                  <Pagination
                    page={page}
                    count={usersQuery.data?.totalPages || 1}
                    onChange={(_event, value) => setPage(value)}
                    color="primary"
                  />
                </Stack>
              </>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
};

export default MarketerPortalPage;
