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
    city: 'طµظ†ط¹ط§ط،',
    jobTitle: '',
    note: '',
    password: '',
    file: null as File | null,
  });

  const [merchantForm, setMerchantForm] = useState({
    phone: '',
    firstName: '',
    lastName: '',
    city: 'طµظ†ط¹ط§ط،',
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
      errors.phone = 'ط±ظ‚ظ… ط§ظ„ظ‡ط§طھظپ ظ…ط·ظ„ظˆط¨';
    } else if (!isValidNineDigitPhone(engineerForm.phone)) {
      errors.phone = 'ط±ظ‚ظ… ط§ظ„ظ‡ط§طھظپ ظٹط¬ط¨ ط£ظ† ظٹطھظƒظˆظ† ظ…ظ† 9 ط£ط±ظ‚ط§ظ…';
    }

    if (!engineerForm.firstName.trim()) {
      errors.firstName = 'ط§ظ„ط§ط³ظ… ط§ظ„ط£ظˆظ„ ظ…ط·ظ„ظˆط¨';
    } else if (engineerForm.firstName.trim().length < 2) {
      errors.firstName = 'ط§ظ„ط§ط³ظ… ط§ظ„ط£ظˆظ„ ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط­ط±ظپظٹظ† ط¹ظ„ظ‰ ط§ظ„ط£ظ‚ظ„';
    }

    if (!engineerForm.city.trim()) {
      errors.city = 'ط§ظ„ظ…ط¯ظٹظ†ط© ظ…ط·ظ„ظˆط¨ط©';
    }

    if (!engineerForm.password) {
      errors.password = 'ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ظ…ط·ظ„ظˆط¨ط©';
    } else if (engineerForm.password.length < PASSWORD_MIN_LENGTH) {
      errors.password = `ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ظٹط¬ط¨ ط£ظ† طھظƒظˆظ† ${PASSWORD_MIN_LENGTH} ط£ط­ط±ظپ ط¹ظ„ظ‰ ط§ظ„ط£ظ‚ظ„`;
    }

    if (!engineerForm.file) {
      errors.file = 'ظٹط±ط¬ظ‰ ط±ظپط¹ ظ…ظ„ظپ CV';
    }

    return errors;
  };

  const validateMerchantForm = (): MerchantFormErrors => {
    const errors: MerchantFormErrors = {};

    if (!merchantForm.phone) {
      errors.phone = 'ط±ظ‚ظ… ط§ظ„ظ‡ط§طھظپ ظ…ط·ظ„ظˆط¨';
    } else if (!isValidNineDigitPhone(merchantForm.phone)) {
      errors.phone = 'ط±ظ‚ظ… ط§ظ„ظ‡ط§طھظپ ظٹط¬ط¨ ط£ظ† ظٹطھظƒظˆظ† ظ…ظ† 9 ط£ط±ظ‚ط§ظ…';
    }

    if (!merchantForm.firstName.trim()) {
      errors.firstName = 'ط§ظ„ط§ط³ظ… ط§ظ„ط£ظˆظ„ ظ…ط·ظ„ظˆط¨';
    } else if (merchantForm.firstName.trim().length < 2) {
      errors.firstName = 'ط§ظ„ط§ط³ظ… ط§ظ„ط£ظˆظ„ ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط­ط±ظپظٹظ† ط¹ظ„ظ‰ ط§ظ„ط£ظ‚ظ„';
    }

    if (!merchantForm.city.trim()) {
      errors.city = 'ط§ظ„ظ…ط¯ظٹظ†ط© ظ…ط·ظ„ظˆط¨ط©';
    }

    if (!merchantForm.storeName.trim()) {
      errors.storeName = 'ط§ط³ظ… ط§ظ„ظ…ط­ظ„ ظ…ط·ظ„ظˆط¨';
    }

    if (!merchantForm.storeAddress.trim()) {
      errors.storeAddress = 'ط¹ظ†ظˆط§ظ† ط§ظ„ظ…ط­ظ„ ظ…ط·ظ„ظˆط¨';
    }

    if (!merchantForm.storeSize) {
      errors.storeSize = 'ط­ط¬ظ… ط§ظ„ظ…ط­ظ„ ظ…ط·ظ„ظˆط¨';
    }

    if (!merchantForm.previousCustomer) {
      errors.previousCustomer = 'ظ‡ط°ط§ ط§ظ„ط­ظ‚ظ„ ظ…ط·ظ„ظˆط¨';
    }

    if (merchantForm.previousCustomer === 'no' && !merchantForm.tejadodAwareness) {
      errors.tejadodAwareness = 'ظٹط±ط¬ظ‰ طھط­ط¯ظٹط¯ ظ…ط³طھظˆظ‰ ط§ظ„ظ…ط¹ط±ظپط© ط¨طھط¬ط¯ط¯';
    }

    if (!merchantForm.dealsWithBreakers) {
      errors.dealsWithBreakers = 'ظ‡ط°ط§ ط§ظ„ط­ظ‚ظ„ ظ…ط·ظ„ظˆط¨';
    }

    if (merchantForm.dealsWithBreakers === 'yes' && merchantForm.breakerBrands.length === 0) {
      errors.breakerBrands = 'ظٹط±ط¬ظ‰ طھط­ط¯ظٹط¯ ظ†ظˆط¹ ظ‚ظˆط§ط·ط¹ ظˆط§ط­ط¯ ط¹ظ„ظ‰ ط§ظ„ط£ظ‚ظ„';
    }

    if (
      merchantForm.dealsWithBreakers === 'yes' &&
      merchantForm.breakerBrands.includes('other') &&
      !merchantForm.breakerOtherExample.trim()
    ) {
      errors.breakerOtherExample = 'ظٹط±ط¬ظ‰ ظƒطھط§ط¨ط© ظ…ط«ط§ظ„ ظ„ظ„ط®ظٹط§ط± ط§ظ„ط¢ط®ط±';
    }

    if (!merchantForm.hasLighting) {
      errors.hasLighting = 'ظ‡ط°ط§ ط§ظ„ط­ظ‚ظ„ ظ…ط·ظ„ظˆط¨';
    }

    if (merchantForm.lightingNote.length > 500) {
      errors.lightingNote = 'ط§ظ„ظ…ظ„ط§ط­ط¸ط© ظٹط¬ط¨ ط£ظ„ط§ طھطھط¬ط§ظˆط² 500 ط­ط±ظپ';
    }

    if (!merchantForm.password) {
      errors.password = 'ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ظ…ط·ظ„ظˆط¨ط©';
    } else if (merchantForm.password.length < PASSWORD_MIN_LENGTH) {
      errors.password = `ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ظٹط¬ط¨ ط£ظ† طھظƒظˆظ† ${PASSWORD_MIN_LENGTH} ط£ط­ط±ظپ ط¹ظ„ظ‰ ط§ظ„ط£ظ‚ظ„`;
    }

    if (!merchantForm.file) {
      errors.file = 'ظٹط±ط¬ظ‰ ط±ظپط¹ طµظˆط±ط© ط§ظ„ظ…ط­ظ„';
    } else if (!merchantForm.file.type.startsWith('image/')) {
      errors.file = 'طµظٹط؛ط© ط§ظ„ظ…ظ„ظپ ظٹط¬ط¨ ط£ظ† طھظƒظˆظ† طµظˆط±ط©';
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
            city: 'طµظ†ط¹ط§ط،',
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
            city: 'طµظ†ط¹ط§ط،',
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
            ط¨ظˆط§ط¨ط© ط§ظ„ظ…ط³ظˆظ‚
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ط¥ط¶ط§ظپط© ظ…ظ‡ظ†ط¯ط³ظٹظ† ظˆطھط¬ط§ط± ط¨ط§ط¹طھظ…ط§ط¯ ظ…ط¨ط§ط´ط± ظ…ط¹ ط­ظپط¸ ط§ظ„طھظˆط«ظٹظ‚ ظˆط±ط¨ط· ظƒظ„ ط§ظ„ط­ط³ط§ط¨ط§طھ ط¨ط§ط³ظ…ظƒ.
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 1.5, md: 2 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظ…ط¶ط§ظپظٹظ†
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
                  ط§ظ„ظ…ظ‡ظ†ط¯ط³ظˆظ†
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
                  ط§ظ„طھط¬ط§ط±
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
                  ظ‡ط°ط§ ط§ظ„ط´ظ‡ط±
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
              label="ط¥ط¶ط§ظپط© ظ…ظ‡ظ†ط¯ط³"
            />
            <Tab
              value="merchant"
              icon={<Storefront fontSize="small" />}
              iconPosition="start"
              label="ط¥ط¶ط§ظپط© طھط§ط¬ط±"
            />
          </Tabs>

          {activeTab === 'engineer' && (
            <Stack spacing={2} dir="rtl" sx={fieldValidationSx}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    label="ط±ظ‚ظ… ط§ظ„ظ‡ط§طھظپ"
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
                    label="ط§ظ„ط§ط³ظ… ط§ظ„ط£ظˆظ„"
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
                    label="ط§ظ„ط§ط³ظ… ط§ظ„ط£ط®ظٹط±"
                    fullWidth
                    value={engineerForm.lastName}
                    onChange={(event) =>
                      setEngineerForm((prev) => ({ ...prev, lastName: event.target.value }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    label="ط§ظ„ظ…ط¯ظٹظ†ط©"
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
                    label="ط§ظ„ظ…ط³ظ…ظ‰ ط§ظ„ظˆط¸ظٹظپظٹ"
                    fullWidth
                    value={engineerForm.jobTitle}
                    onChange={(event) =>
                      setEngineerForm((prev) => ({ ...prev, jobTitle: event.target.value }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±"
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
                    {engineerForm.file ? engineerForm.file.name : 'ط±ظپط¹ CV (PDF/DOC)'}
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
                label="ظ…ظ„ط§ط­ط¸ط©"
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
                ط¥ظ†ط´ط§ط، ظ…ظ‡ظ†ط¯ط³ ظ…ط¹ ط§ط¹طھظ…ط§ط¯ ظ…ط¨ط§ط´ط±
              </Button>
            </Stack>
          )}

          {activeTab === 'merchant' && (
            <Stack spacing={2} dir="rtl" sx={fieldValidationSx}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    label="ط±ظ‚ظ… ط§ظ„ظ‡ط§طھظپ"
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
                    label="ط§ظ„ط§ط³ظ… ط§ظ„ط£ظˆظ„"
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
                    label="ط§ظ„ط§ط³ظ… ط§ظ„ط£ط®ظٹط±"
                    fullWidth
                    value={merchantForm.lastName}
                    onChange={(event) =>
                      setMerchantForm((prev) => ({ ...prev, lastName: event.target.value }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    label="ط§ظ„ظ…ط¯ظٹظ†ط©"
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
                    label="ط§ط³ظ… ط§ظ„ظ…ط­ظ„"
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
                    label="ط¹ظ†ظˆط§ظ† ط§ظ„ظ…ط­ظ„"
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
                    label="ط­ط¬ظ… ط§ظ„ظ…ط­ظ„"
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
                    <MenuItem value="large">ظƒط¨ظٹط±</MenuItem>
                    <MenuItem value="medium">ظ…طھظˆط³ط·</MenuItem>
                    <MenuItem value="small">طµط؛ظٹط±</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="ظ‡ظ„ ظ‡ظˆ ط¹ظ…ظٹظ„ ط³ط§ط¨ظ‚ ظ„ط¯ظٹظ†ط§طں"
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
                    <MenuItem value="yes">ظ†ط¹ظ…</MenuItem>
                    <MenuItem value="no">ظ„ط§</MenuItem>
                  </TextField>
                </Grid>
                {merchantForm.previousCustomer === 'no' && (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      label="ظ‡ظ„ ظ„ط¯ظٹظ‡ ظ…ط¹ط±ظپط© ط¨طھط¬ط¯ط¯طں"
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
                      <MenuItem value="knows">ظ†ط¹ظ… ظٹظˆط¬ط¯ ظ…ط¹ط±ظپط©</MenuItem>
                      <MenuItem value="heard_only">ط³ظ…ط¹طھ ط¹ظ†ظ‡ط§ ظپظ‚ط·</MenuItem>
                      <MenuItem value="none">ظ„ط§</MenuItem>
                    </TextField>
                  </Grid>
                )}
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±"
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
                    label="ظ‡ظ„ ط§ظ„ظ…ط­ظ„ ظٹطھط¹ط§ظ…ظ„ ظ…ط¹ ط§ظ„ظ‚ظˆط§ط·ط¹طں"
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
                    <MenuItem value="yes">ظ†ط¹ظ…</MenuItem>
                    <MenuItem value="no">ظ„ط§</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="ظ‡ظ„ ط§ظ„ظ…ط­ظ„ ظ„ط¯ظٹظ‡ ظ„ظ…ط¨ط§طھ (ط¥ط¶ط§ط،ط©)طں"
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
                    <MenuItem value="yes">ظ†ط¹ظ…</MenuItem>
                    <MenuItem value="no">ظ„ط§</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
              {merchantForm.dealsWithBreakers === 'yes' && (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="ط£ظ†ظˆط§ط¹ ط§ظ„ظ‚ظˆط§ط·ط¹"
                      fullWidth
                      select
                      required
                      SelectProps={{
                        multiple: true,
                        renderValue: (selected) => {
                          const selectedValues = selected as string[];
                          const labelMap: Record<string, string> = {
                            schneider: 'ط´ظ†ط§ظٹط¯ط± Schneider Electric',
                            chint: 'ط´ظ†طھ Chint',
                            legrand: 'ظ„ظٹط¬ط±ط§ظ†ط¯ Legrand',
                            cnc: 'CNC',
                            other: 'ط£ط®ط±ظ‰',
                          };

                          return selectedValues.map((value) => labelMap[value] || value).join('طŒ ');
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
                      <MenuItem value="schneider">ط´ظ†ط§ظٹط¯ط± Schneider Electric</MenuItem>
                      <MenuItem value="chint">ط´ظ†طھ Chint</MenuItem>
                      <MenuItem value="legrand">ظ„ظٹط¬ط±ط§ظ†ط¯ Legrand</MenuItem>
                      <MenuItem value="cnc">CNC</MenuItem>
                      <MenuItem value="other">ط£ط®ط±ظ‰</MenuItem>
                    </TextField>
                  </Grid>
                  {merchantForm.breakerBrands.includes('other') && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="ظ…ط«ط§ظ„ ط¹ظ„ظ‰ ط§ظ„ط£ط®ط±ظ‰"
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
                  label="ظ…ظ„ط§ط­ط¸ط© ط¹ظ† ط§ظ„ط¥ط¶ط§ط،ط©"
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
                      طھط؛ظٹظٹط± ط§ظ„طµظˆط±ط©
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
                  طھظ… طھط¬ظ‡ظٹط² طµظˆط±ط© ط§ظ„ظ…ط­ظ„: <strong>{merchantForm.file.name}</strong>
                </Alert>
              )}
              <TextField
                label="ظ…ظ„ط§ط­ط¸ط©"
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
                ط¥ظ†ط´ط§ط، طھط§ط¬ط± ظ…ط¹ ط§ط¹طھظ…ط§ط¯ ظ…ط¨ط§ط´ط±
              </Button>
            </Stack>
          )}

          {lastCredential && (
            <Alert severity="success" sx={{ mt: 2 }}>
              طھظ… ط§ظ„ط¥ظ†ط´ط§ط، ط¨ظ†ط¬ط§ط­. ط§ظ„ط±ظ‚ظ…: <strong>{lastCredential.phone}</strong>
              {lastCredential.password ? (
                <>
                  {' '}
                  | ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط§ظ„ظ…ط¤ظ‚طھط©: <strong>{lastCredential.password}</strong>
                </>
              ) : null}
            </Alert>
          )}

        </Paper>

        <Paper sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 3 }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
              <Typography variant="h6">ط§ظ„ظ…ط³طھط®ط¯ظ…ظˆظ† ط§ظ„ط°ظٹظ† ط£ط¶ظپطھظ‡ظ…</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                <TextField
                  size="small"
                  label="ط¨ط­ط«"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                />
                <TextField
                  size="small"
                  select
                  label="ط§ظ„ظ†ظˆط¹"
                  value={type}
                  onChange={(event) => {
                    setType(event.target.value as 'all' | 'engineer' | 'merchant');
                    setPage(1);
                  }}
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value="all">ط§ظ„ظƒظ„</MenuItem>
                  <MenuItem value="engineer">ظ…ظ‡ظ†ط¯ط³</MenuItem>
                  <MenuItem value="merchant">طھط§ط¬ط±</MenuItem>
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
                      <TableCell>ط§ظ„ط§ط³ظ…</TableCell>
                      <TableCell>ط§ظ„ظ‡ط§طھظپ</TableCell>
                      <TableCell>ط§ظ„ظ†ظˆط¹</TableCell>
                      <TableCell>ط­ط§ظ„ط© ط§ظ„طھظˆط«ظٹظ‚</TableCell>
                      <TableCell>طھط§ط±ظٹط® ط§ظ„ط¥ط¶ط§ظپط©</TableCell>
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
                          <TableCell>{isEngineer ? 'ظ…ظ‡ظ†ط¯ط³' : 'طھط§ط¬ط±'}</TableCell>
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

