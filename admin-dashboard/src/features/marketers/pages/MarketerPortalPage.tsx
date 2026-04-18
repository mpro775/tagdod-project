import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
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
    storeAddress: '',
    storeSize: '' as '' | 'large' | 'medium' | 'small',
    previousCustomer: '' as '' | 'yes' | 'no',
    tejadodAwareness: '' as '' | 'knows' | 'heard_only' | 'none',
    note: '',
    password: '',
    file: null as File | null,
  });

  const [lastCredential, setLastCredential] = useState<{ phone: string; password?: string } | null>(null);

  const statsQuery = useMarketerPortalStats();
  const usersQuery = useMarketerPortalUsers({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    type,
  });
  const createEngineerMutation = useCreateEngineerLead();
  const createMerchantMutation = useCreateMerchantLead();

  const handleMerchantFileChange = async (file: File | null) => {
    if (!file) {
      setMerchantForm((prev) => ({ ...prev, file: null }));
      return;
    }

    const preparedFile = await compressImageFile(file, UPLOAD_MAX_WIDTH);
    setMerchantForm((prev) => ({ ...prev, file: preparedFile }));
  };

  const isEngineerFormValid =
    !!engineerForm.phone && !!engineerForm.firstName && !!engineerForm.password && !!engineerForm.file;

  const requiresTejadodAwareness = merchantForm.previousCustomer === 'no';
  const isMerchantFormValid =
    !!merchantForm.phone &&
    !!merchantForm.firstName &&
    !!merchantForm.storeName &&
    !!merchantForm.storeAddress &&
    !!merchantForm.storeSize &&
    !!merchantForm.previousCustomer &&
    !!merchantForm.password &&
    !!merchantForm.file &&
    (!requiresTejadodAwareness || !!merchantForm.tejadodAwareness);

  const handleCreateEngineer = () => {
    if (!isEngineerFormValid || !engineerForm.file) {
      return;
    }

    const file = engineerForm.file;

    createEngineerMutation.mutate(
      {
        phone: engineerForm.phone,
        firstName: engineerForm.firstName,
        lastName: engineerForm.lastName || undefined,
        city: engineerForm.city || undefined,
        jobTitle: engineerForm.jobTitle || undefined,
        note: engineerForm.note || undefined,
        password: engineerForm.password,
        file,
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
    if (!isMerchantFormValid) {
      return;
    }

    if (merchantForm.storeSize === '' || merchantForm.previousCustomer === '') {
      return;
    }

    if (!merchantForm.file) {
      return;
    }

    const storeSize = merchantForm.storeSize;
    const previousCustomer = merchantForm.previousCustomer;
    const file = merchantForm.file;

    createMerchantMutation.mutate(
      {
        phone: merchantForm.phone,
        firstName: merchantForm.firstName,
        lastName: merchantForm.lastName || undefined,
        city: merchantForm.city || undefined,
        storeName: merchantForm.storeName,
        storeAddress: merchantForm.storeAddress,
        storeSize,
        previousCustomer,
        tejadodAwareness: requiresTejadodAwareness
          ? merchantForm.tejadodAwareness || undefined
          : undefined,
        note: merchantForm.note || undefined,
        password: merchantForm.password || undefined,
        file,
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
            storeAddress: '',
            storeSize: '',
            previousCustomer: '',
            tejadodAwareness: '',
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
                    label="كلمة المرور"
                    fullWidth
                    required
                    type="password"
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
                disabled={createEngineerMutation.isPending || !isEngineerFormValid}
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
                    required
                    value={merchantForm.storeName}
                    onChange={(event) =>
                      setMerchantForm((prev) => ({ ...prev, storeName: event.target.value }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="عنوان المحل"
                    fullWidth
                    required
                    value={merchantForm.storeAddress}
                    onChange={(event) =>
                      setMerchantForm((prev) => ({ ...prev, storeAddress: event.target.value }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="حجم المحل"
                    fullWidth
                    select
                    required
                    value={merchantForm.storeSize}
                    onChange={(event) =>
                      setMerchantForm((prev) => ({
                        ...prev,
                        storeSize: event.target.value as 'small' | 'medium' | 'large' | '',
                      }))
                    }
                  >
                    <MenuItem value="large">كبير</MenuItem>
                    <MenuItem value="medium">متوسط</MenuItem>
                    <MenuItem value="small">صغير</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="هل هو عميل سابق لدينا؟"
                    fullWidth
                    select
                    required
                    value={merchantForm.previousCustomer}
                    onChange={(event) =>
                      setMerchantForm((prev) => {
                        const previousCustomer = event.target.value as 'yes' | 'no' | '';

                        return {
                          ...prev,
                          previousCustomer,
                          tejadodAwareness: previousCustomer === 'yes' ? '' : prev.tejadodAwareness,
                        };
                      })
                    }
                  >
                    <MenuItem value="yes">نعم</MenuItem>
                    <MenuItem value="no">لا</MenuItem>
                  </TextField>
                </Grid>
                {merchantForm.previousCustomer === 'no' && (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      label="هل لديه معرفة بتجدد؟"
                      fullWidth
                      select
                      required
                      value={merchantForm.tejadodAwareness}
                      onChange={(event) =>
                        setMerchantForm((prev) => ({
                          ...prev,
                          tejadodAwareness: event.target.value as 'knows' | 'heard_only' | 'none' | '',
                        }))
                      }
                    >
                      <MenuItem value="knows">نعم يوجد معرفة</MenuItem>
                      <MenuItem value="heard_only">سمعت عنها فقط</MenuItem>
                      <MenuItem value="none">لا</MenuItem>
                    </TextField>
                  </Grid>
                )}
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="كلمة المرور"
                    fullWidth
                    required
                    type="password"
                    value={merchantForm.password}
                    onChange={(event) =>
                      setMerchantForm((prev) => ({ ...prev, password: event.target.value }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    component="label"
                    fullWidth
                    startIcon={<CameraAlt />}
                    sx={{ height: '56px' }}
                  >
                    تصوير أو اختيار صورة المحل
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
                      component="label"
                    >
                      تغيير الصورة
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
                  }
                >
                  تم تجهيز صورة المحل: <strong>{merchantForm.file.name}</strong>
                </Alert>
              )}
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
                disabled={createMerchantMutation.isPending || !isMerchantFormValid}
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
