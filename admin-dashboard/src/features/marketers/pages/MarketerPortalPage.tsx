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
  TextField,
  Typography,
} from '@mui/material';
import { Add, Engineering, Storefront } from '@mui/icons-material';
import {
  useCreateEngineerLead,
  useCreateMerchantLead,
  useMarketerPortalStats,
  useMarketerPortalUsers,
} from '../hooks/useMarketerPortal';

const PAGE_SIZE = 10;

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

  const statsQuery = useMarketerPortalStats();
  const usersQuery = useMarketerPortalUsers({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    type,
  });
  const createEngineerMutation = useCreateEngineerLead();
  const createMerchantMutation = useCreateMerchantLead();

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
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            بوابة المسوق
          </Typography>
          <Typography variant="body2" color="text.secondary">
            إضافة مهندسين وتجار باعتماد مباشر مع حفظ التوثيق وربط كل الحسابات باسمك.
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card>
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
            <Card>
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
            <Card>
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
            <Card>
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

        <Paper sx={{ p: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_e, value) => setActiveTab(value)}
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
                  <Button variant="outlined" component="label" fullWidth sx={{ height: '56px' }}>
                    {merchantForm.file ? merchantForm.file.name : 'رفع صورة المحل'}
                    <input
                      type="file"
                      hidden
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(event) =>
                        setMerchantForm((prev) => ({ ...prev, file: event.target.files?.[0] || null }))
                      }
                    />
                  </Button>
                </Grid>
              </Grid>
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

        <Paper sx={{ p: 2 }}>
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
                <Table size="small">
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
