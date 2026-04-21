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
import { Add, CheckCircle, Engineering, Replay, Storefront } from '@mui/icons-material';
import {
  useCreateEngineerLead,
  useCreateMerchantLead,
  useMarketerPortalStats,
  useMarketerPortalUsers,
} from '../hooks/useMarketerPortal';

const PAGE_SIZE = 10;
const UPLOAD_MAX_WIDTH = 1600;
const PHONE_LENGTH = 9;
const PASSWORD_MIN_LENGTH = 8;

type EngineerFormErrors = {
  phone?: string;
  firstName?: string;
  city?: string;
  password?: string;
  file?: string;
};

type MerchantFormErrors = {
  phone?: string;
  firstName?: string;
  city?: string;
  storeName?: string;
  storeAddress?: string;
  storeSize?: string;
  previousCustomer?: string;
  tejadodAwareness?: string;
  dealsWithBreakers?: string;
  breakerBrands?: string;
  breakerOtherExample?: string;
  hasLighting?: string;
  lightingNote?: string;
  password?: string;
  file?: string;
};

const normalizePhone = (value: string): string => {
  let digits = value.replace(/\D/g, '');

  if (digits.startsWith('967') && digits.length === 12) {
    digits = digits.slice(3);
  }

  if (digits.startsWith('0') && digits.length === 10) {
    digits = digits.slice(1);
  }

  return digits.slice(0, PHONE_LENGTH);
};

const isValidNineDigitPhone = (value: string): boolean => /^\d{9}$/.test(value);

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
  const [activeTab, setActiveTab] = useState<'engineer' | 'merchant'>('merchant');
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
    dealsWithBreakers: '' as '' | 'yes' | 'no',
    breakerBrands: [] as Array<'schneider' | 'chint' | 'legrand' | 'cnc' | 'other'>,
    breakerOtherExample: '',
    hasLighting: '' as '' | 'yes' | 'no',
    lightingNote: '',
    note: '',
    password: '',
    file: null as File | null,
  });

  const [lastCredential, setLastCredential] = useState<{ phone: string; password?: string } | null>(null);
  const [engineerErrors, setEngineerErrors] = useState<EngineerFormErrors>({});
  const [merchantErrors, setMerchantErrors] = useState<MerchantFormErrors>({});

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

  const requiresTejadodAwareness = merchantForm.previousCustomer === 'no';
  const requiresBreakerBrands = merchantForm.dealsWithBreakers === 'yes';
  const isOtherBreakerSelected = merchantForm.breakerBrands.includes('other');
  const requiresLightingNote = merchantForm.hasLighting === 'yes';
  const fieldValidationSx = {
    '& .MuiInputBase-input': { textAlign: 'right' },
    '& .MuiSelect-select': { textAlign: 'right' },
    '& .MuiFormHelperText-root': { textAlign: 'right', mr: 0 },
  };

  const validateEngineerForm = (): EngineerFormErrors => {
    const errors: EngineerFormErrors = {};

    if (!engineerForm.phone) {
      errors.phone = 'رقم الهاتف مطلوب';
    } else if (!isValidNineDigitPhone(engineerForm.phone)) {
      errors.phone = 'رقم الهاتف يجب أن يتكون من 9 أرقام';
    }

    if (!engineerForm.firstName.trim()) {
      errors.firstName = 'الاسم الأول مطلوب';
    } else if (engineerForm.firstName.trim().length < 2) {
      errors.firstName = 'الاسم الأول يجب أن يكون حرفين على الأقل';
    }

    if (!engineerForm.city.trim()) {
      errors.city = 'المدينة مطلوبة';
    }

    if (!engineerForm.password) {
      errors.password = 'كلمة المرور مطلوبة';
    } else if (engineerForm.password.length < PASSWORD_MIN_LENGTH) {
      errors.password = `كلمة المرور يجب أن تكون ${PASSWORD_MIN_LENGTH} أحرف على الأقل`;
    }

    if (!engineerForm.file) {
      errors.file = 'يرجى رفع ملف CV';
    }

    return errors;
  };

  const validateMerchantForm = (): MerchantFormErrors => {
    const errors: MerchantFormErrors = {};

    if (!merchantForm.phone) {
      errors.phone = 'رقم الهاتف مطلوب';
    } else if (!isValidNineDigitPhone(merchantForm.phone)) {
      errors.phone = 'رقم الهاتف يجب أن يتكون من 9 أرقام';
    }

    if (!merchantForm.firstName.trim()) {
      errors.firstName = 'الاسم الأول مطلوب';
    } else if (merchantForm.firstName.trim().length < 2) {
      errors.firstName = 'الاسم الأول يجب أن يكون حرفين على الأقل';
    }

    if (!merchantForm.city.trim()) {
      errors.city = 'المدينة مطلوبة';
    }

    if (!merchantForm.storeName.trim()) {
      errors.storeName = 'اسم المحل مطلوب';
    }

    if (!merchantForm.storeAddress.trim()) {
      errors.storeAddress = 'عنوان المحل مطلوب';
    }

    if (!merchantForm.storeSize) {
      errors.storeSize = 'حجم المحل مطلوب';
    }

    if (!merchantForm.previousCustomer) {
      errors.previousCustomer = 'هذا الحقل مطلوب';
    }

    if (merchantForm.previousCustomer === 'no' && !merchantForm.tejadodAwareness) {
      errors.tejadodAwareness = 'يرجى تحديد مستوى المعرفة بتجدد';
    }

    if (!merchantForm.dealsWithBreakers) {
      errors.dealsWithBreakers = 'هذا الحقل مطلوب';
    }

    if (merchantForm.dealsWithBreakers === 'yes' && merchantForm.breakerBrands.length === 0) {
      errors.breakerBrands = 'يرجى تحديد نوع قواطع واحد على الأقل';
    }

    if (
      merchantForm.dealsWithBreakers === 'yes' &&
      merchantForm.breakerBrands.includes('other') &&
      !merchantForm.breakerOtherExample.trim()
    ) {
      errors.breakerOtherExample = 'يرجى كتابة مثال للخيار الآخر';
    }

    if (!merchantForm.hasLighting) {
      errors.hasLighting = 'هذا الحقل مطلوب';
    }

    if (merchantForm.lightingNote.length > 500) {
      errors.lightingNote = 'الملاحظة يجب ألا تتجاوز 500 حرف';
    }

    if (!merchantForm.password) {
      errors.password = 'كلمة المرور مطلوبة';
    } else if (merchantForm.password.length < PASSWORD_MIN_LENGTH) {
      errors.password = `كلمة المرور يجب أن تكون ${PASSWORD_MIN_LENGTH} أحرف على الأقل`;
    }

    if (!merchantForm.file) {
      errors.file = 'يرجى رفع صورة المحل';
    } else if (!merchantForm.file.type.startsWith('image/')) {
      errors.file = 'صيغة الملف يجب أن تكون صورة';
    }

    return errors;
  };

  const handleCreateEngineer = () => {
    const errors = validateEngineerForm();
    setEngineerErrors(errors);

    if (Object.keys(errors).length > 0 || !engineerForm.file) {
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
          setEngineerErrors({});
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
    const errors = validateMerchantForm();
    setMerchantErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    if (
      merchantForm.storeSize === '' ||
      merchantForm.previousCustomer === '' ||
      merchantForm.dealsWithBreakers === '' ||
      merchantForm.hasLighting === ''
    ) {
      return;
    }

    if (!merchantForm.file) {
      return;
    }

    const storeSize = merchantForm.storeSize;
    const previousCustomer = merchantForm.previousCustomer;
    const dealsWithBreakers = merchantForm.dealsWithBreakers;
    const hasLighting = merchantForm.hasLighting;
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
        dealsWithBreakers,
        breakerBrands: requiresBreakerBrands ? merchantForm.breakerBrands : undefined,
        breakerOtherExample:
          requiresBreakerBrands && isOtherBreakerSelected
            ? merchantForm.breakerOtherExample.trim() || undefined
            : undefined,
        hasLighting,
        lightingNote: requiresLightingNote ? merchantForm.lightingNote.trim() || undefined : undefined,
        note: merchantForm.note || undefined,
        password: merchantForm.password,
        file,
      },
      {
        onSuccess: (result) => {
          setLastCredential({ phone: result.phone, password: result.temporaryPassword });
          setMerchantErrors({});
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
            dealsWithBreakers: '',
            breakerBrands: [],
            breakerOtherExample: '',
            hasLighting: '',
            lightingNote: '',
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
            <Stack spacing={2} dir="rtl" sx={fieldValidationSx}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    label="رقم الهاتف"
                    fullWidth
                    required
                    inputProps={{ maxLength: PHONE_LENGTH, inputMode: 'numeric', pattern: '[0-9]*' }}
                    error={!!engineerErrors.phone}
                    helperText={engineerErrors.phone}
                    value={engineerForm.phone}
                    onChange={(event) => {
                      const phone = normalizePhone(event.target.value);
                      setEngineerForm((prev) => ({ ...prev, phone }));
                      setEngineerErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    label="الاسم الأول"
                    fullWidth
                    required
                    error={!!engineerErrors.firstName}
                    helperText={engineerErrors.firstName}
                    value={engineerForm.firstName}
                    onChange={(event) => {
                      setEngineerForm((prev) => ({ ...prev, firstName: event.target.value }));
                      setEngineerErrors((prev) => ({ ...prev, firstName: undefined }));
                    }}
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
                    required
                    error={!!engineerErrors.city}
                    helperText={engineerErrors.city}
                    value={engineerForm.city}
                    onChange={(event) => {
                      setEngineerForm((prev) => ({ ...prev, city: event.target.value }));
                      setEngineerErrors((prev) => ({ ...prev, city: undefined }));
                    }}
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
                    error={!!engineerErrors.password}
                    helperText={engineerErrors.password}
                    value={engineerForm.password}
                    onChange={(event) => {
                      setEngineerForm((prev) => ({ ...prev, password: event.target.value }));
                      setEngineerErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Button variant="outlined" component="label" fullWidth sx={{ height: '56px' }}>
                    {engineerForm.file ? engineerForm.file.name : 'رفع CV (PDF/DOC)'}
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx"
                      onChange={(event) => {
                        setEngineerForm((prev) => ({ ...prev, file: event.target.files?.[0] || null }));
                        setEngineerErrors((prev) => ({ ...prev, file: undefined }));
                      }}
                    />
                  </Button>
                  {engineerErrors.file ? (
                    <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                      {engineerErrors.file}
                    </Typography>
                  ) : null}
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
            <Stack spacing={2} dir="rtl" sx={fieldValidationSx}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    label="رقم الهاتف"
                    fullWidth
                    required
                    inputProps={{ maxLength: PHONE_LENGTH, inputMode: 'numeric', pattern: '[0-9]*' }}
                    error={!!merchantErrors.phone}
                    helperText={merchantErrors.phone}
                    value={merchantForm.phone}
                    onChange={(event) => {
                      const phone = normalizePhone(event.target.value);
                      setMerchantForm((prev) => ({ ...prev, phone }));
                      setMerchantErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    label="الاسم الأول"
                    fullWidth
                    required
                    error={!!merchantErrors.firstName}
                    helperText={merchantErrors.firstName}
                    value={merchantForm.firstName}
                    onChange={(event) => {
                      setMerchantForm((prev) => ({ ...prev, firstName: event.target.value }));
                      setMerchantErrors((prev) => ({ ...prev, firstName: undefined }));
                    }}
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
                    required
                    error={!!merchantErrors.city}
                    helperText={merchantErrors.city}
                    value={merchantForm.city}
                    onChange={(event) => {
                      setMerchantForm((prev) => ({ ...prev, city: event.target.value }));
                      setMerchantErrors((prev) => ({ ...prev, city: undefined }));
                    }}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="اسم المحل"
                    fullWidth
                    required
                    error={!!merchantErrors.storeName}
                    helperText={merchantErrors.storeName}
                    value={merchantForm.storeName}
                    onChange={(event) => {
                      setMerchantForm((prev) => ({ ...prev, storeName: event.target.value }));
                      setMerchantErrors((prev) => ({ ...prev, storeName: undefined }));
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="عنوان المحل"
                    fullWidth
                    required
                    error={!!merchantErrors.storeAddress}
                    helperText={merchantErrors.storeAddress}
                    value={merchantForm.storeAddress}
                    onChange={(event) => {
                      setMerchantForm((prev) => ({ ...prev, storeAddress: event.target.value }));
                      setMerchantErrors((prev) => ({ ...prev, storeAddress: undefined }));
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="حجم المحل"
                    fullWidth
                    select
                    required
                    error={!!merchantErrors.storeSize}
                    helperText={merchantErrors.storeSize}
                    value={merchantForm.storeSize}
                    onChange={(event) => {
                      setMerchantForm((prev) => ({
                        ...prev,
                        storeSize: event.target.value as 'small' | 'medium' | 'large' | '',
                      }));
                      setMerchantErrors((prev) => ({ ...prev, storeSize: undefined }));
                    }}
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
                    error={!!merchantErrors.previousCustomer}
                    helperText={merchantErrors.previousCustomer}
                    value={merchantForm.previousCustomer}
                    onChange={(event) => {
                      const previousCustomer = event.target.value as 'yes' | 'no' | '';

                      setMerchantForm((prev) => ({
                        ...prev,
                        previousCustomer,
                        tejadodAwareness: previousCustomer === 'yes' ? '' : prev.tejadodAwareness,
                      }));

                      setMerchantErrors((prev) => ({
                        ...prev,
                        previousCustomer: undefined,
                        tejadodAwareness: undefined,
                      }));
                    }}
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
                      error={!!merchantErrors.tejadodAwareness}
                      helperText={merchantErrors.tejadodAwareness}
                      value={merchantForm.tejadodAwareness}
                      onChange={(event) => {
                        setMerchantForm((prev) => ({
                          ...prev,
                          tejadodAwareness: event.target.value as 'knows' | 'heard_only' | 'none' | '',
                        }));
                        setMerchantErrors((prev) => ({ ...prev, tejadodAwareness: undefined }));
                      }}
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
                    error={!!merchantErrors.password}
                    helperText={merchantErrors.password}
                    value={merchantForm.password}
                    onChange={(event) => {
                      setMerchantForm((prev) => ({ ...prev, password: event.target.value }));
                      setMerchantErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    component="label"
                    fullWidth
                    sx={{ height: '56px' }}
                  >
                    إرفاق صورة المحل
                    <input
                      type="file"
                      hidden
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(event) => {
                        void handleMerchantFileChange(event.target.files?.[0] || null);
                        setMerchantErrors((prev) => ({ ...prev, file: undefined }));
                      }}
                    />
                  </Button>
                  {merchantErrors.file ? (
                    <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                      {merchantErrors.file}
                    </Typography>
                  ) : null}
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="هل المحل يتعامل مع القواطع؟"
                    fullWidth
                    select
                    required
                    error={!!merchantErrors.dealsWithBreakers}
                    helperText={merchantErrors.dealsWithBreakers}
                    value={merchantForm.dealsWithBreakers}
                    onChange={(event) => {
                      const dealsWithBreakers = event.target.value as 'yes' | 'no' | '';

                      setMerchantForm((prev) => ({
                        ...prev,
                        dealsWithBreakers,
                        breakerBrands: dealsWithBreakers === 'yes' ? prev.breakerBrands : [],
                        breakerOtherExample: dealsWithBreakers === 'yes' ? prev.breakerOtherExample : '',
                      }));

                      setMerchantErrors((prev) => ({
                        ...prev,
                        dealsWithBreakers: undefined,
                        breakerBrands: undefined,
                        breakerOtherExample: undefined,
                      }));
                    }}
                  >
                    <MenuItem value="yes">نعم</MenuItem>
                    <MenuItem value="no">لا</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="هل المحل لديه لمبات (إضاءة)؟"
                    fullWidth
                    select
                    required
                    error={!!merchantErrors.hasLighting}
                    helperText={merchantErrors.hasLighting}
                    value={merchantForm.hasLighting}
                    onChange={(event) => {
                      const hasLighting = event.target.value as 'yes' | 'no' | '';

                      setMerchantForm((prev) => ({
                        ...prev,
                        hasLighting,
                        lightingNote: hasLighting === 'yes' ? prev.lightingNote : '',
                      }));

                      setMerchantErrors((prev) => ({
                        ...prev,
                        hasLighting: undefined,
                        lightingNote: undefined,
                      }));
                    }}
                  >
                    <MenuItem value="yes">نعم</MenuItem>
                    <MenuItem value="no">لا</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
              {merchantForm.dealsWithBreakers === 'yes' && (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="أنواع القواطع"
                      fullWidth
                      select
                      required
                      SelectProps={{
                        multiple: true,
                        renderValue: (selected) => {
                          const selectedValues = selected as string[];
                          const labelMap: Record<string, string> = {
                            schneider: 'شنايدر Schneider Electric',
                            chint: 'شنت Chint',
                            legrand: 'ليجراند Legrand',
                            cnc: 'CNC',
                            other: 'أخرى',
                          };

                          return selectedValues.map((value) => labelMap[value] || value).join('، ');
                        },
                      }}
                      error={!!merchantErrors.breakerBrands}
                      helperText={merchantErrors.breakerBrands}
                      value={merchantForm.breakerBrands}
                      onChange={(event) => {
                        const rawValue = event.target.value;
                        const breakerBrands =
                          typeof rawValue === 'string'
                            ? (rawValue.split(',') as Array<
                                'schneider' | 'chint' | 'legrand' | 'cnc' | 'other'
                              >)
                            : (rawValue as Array<
                                'schneider' | 'chint' | 'legrand' | 'cnc' | 'other'
                              >);

                        setMerchantForm((prev) => ({
                          ...prev,
                          breakerBrands,
                          breakerOtherExample: breakerBrands.includes('other')
                            ? prev.breakerOtherExample
                            : '',
                        }));

                        setMerchantErrors((prev) => ({
                          ...prev,
                          breakerBrands: undefined,
                          breakerOtherExample: undefined,
                        }));
                      }}
                    >
                      <MenuItem value="schneider">شنايدر Schneider Electric</MenuItem>
                      <MenuItem value="chint">شنت Chint</MenuItem>
                      <MenuItem value="legrand">ليجراند Legrand</MenuItem>
                      <MenuItem value="cnc">CNC</MenuItem>
                      <MenuItem value="other">أخرى</MenuItem>
                    </TextField>
                  </Grid>
                  {merchantForm.breakerBrands.includes('other') && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="مثال على الأخرى"
                        fullWidth
                        required
                        error={!!merchantErrors.breakerOtherExample}
                        helperText={merchantErrors.breakerOtherExample}
                        value={merchantForm.breakerOtherExample}
                        onChange={(event) => {
                          setMerchantForm((prev) => ({
                            ...prev,
                            breakerOtherExample: event.target.value,
                          }));
                          setMerchantErrors((prev) => ({
                            ...prev,
                            breakerOtherExample: undefined,
                          }));
                        }}
                      />
                    </Grid>
                  )}
                </Grid>
              )}
              {merchantForm.hasLighting === 'yes' && (
                <TextField
                  label="ملاحظة عن الإضاءة"
                  fullWidth
                  multiline
                  minRows={2}
                  error={!!merchantErrors.lightingNote}
                  helperText={merchantErrors.lightingNote}
                  value={merchantForm.lightingNote}
                  onChange={(event) => {
                    setMerchantForm((prev) => ({
                      ...prev,
                      lightingNote: event.target.value,
                    }));
                    setMerchantErrors((prev) => ({ ...prev, lightingNote: undefined }));
                  }}
                />
              )}
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
                        onChange={(event) => {
                          void handleMerchantFileChange(event.target.files?.[0] || null);
                          setMerchantErrors((prev) => ({ ...prev, file: undefined }));
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


