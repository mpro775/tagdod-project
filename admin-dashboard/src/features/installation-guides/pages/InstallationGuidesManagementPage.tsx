import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  MenuBook,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ImageField, MediaCategory } from '@/features/media';
import type { Media } from '@/features/media/types/media.types';
import { VideoUploader } from '@/features/media/components/VideoUploader';
import { productsApi } from '@/features/products/api/productsApi';
import type {
  CreateInstallationGuideDto,
  InstallationGuideListItem,
  ListInstallationGuidesParams,
  UpdateInstallationGuideDto,
} from '../types/installationGuide.types';
import {
  useCreateInstallationGuide,
  useDeleteInstallationGuide,
  useInstallationGuide,
  useInstallationGuides,
  useToggleInstallationGuide,
  useUpdateInstallationGuide,
} from '../hooks/useInstallationGuides';

type ProductOption = {
  id: string;
  name: string;
  nameEn?: string;
  sku?: string;
};

type GuideFormState = {
  titleAr: string;
  titleEn: string;
  tagAr: string;
  tagEn: string;
  descriptionAr: string;
  descriptionEn: string;
  coverImageId: string;
  coverImageUrl?: string;
  videoId: string;
  linkedProductId: string | null;
  sortOrder: number;
  isActive: boolean;
};

const emptyFormState: GuideFormState = {
  titleAr: '',
  titleEn: '',
  tagAr: '',
  tagEn: '',
  descriptionAr: '',
  descriptionEn: '',
  coverImageId: '',
  coverImageUrl: '',
  videoId: '',
  linkedProductId: null,
  sortOrder: 0,
  isActive: true,
};

export const InstallationGuidesManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<ListInstallationGuidesParams>({
    page: 1,
    limit: 20,
    sortBy: 'sortOrder',
    sortOrder: 'asc',
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GuideFormState>(emptyFormState);
  const [selectedCover, setSelectedCover] = useState<Media | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InstallationGuideListItem | null>(null);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);

  const { data, isLoading, refetch } = useInstallationGuides(filters);
  const { data: currentGuide, isLoading: loadingCurrentGuide } = useInstallationGuide(
    editingId || '',
    { enabled: dialogOpen && !!editingId },
  );

  const createMutation = useCreateInstallationGuide();
  const updateMutation = useUpdateInstallationGuide();
  const toggleMutation = useToggleInstallationGuide();
  const deleteMutation = useDeleteInstallationGuide();

  const guides = data?.data || [];
  const pagination = data?.pagination;

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const mergeUniqueProducts = useCallback((list: ProductOption[]) => {
    const map = new Map<string, ProductOption>();
    list.forEach((item) => {
      if (item.id) map.set(item.id, item);
    });
    return Array.from(map.values());
  }, []);

  const loadProducts = useCallback(
    async (searchTerm = '') => {
      try {
        setLoadingProducts(true);
        const response = await productsApi.list({
          page: 1,
          limit: 30,
          status: 'active' as any,
          search: searchTerm.trim() || undefined,
          sortBy: 'updatedAt',
          sortOrder: 'desc',
        });

        const mapped = (response.data || []).map((item: any) => ({
          id: item._id,
          name: item.name || item.nameEn || item.sku || 'بدون اسم',
          nameEn: item.nameEn,
          sku: item.sku,
        }));

        setProductOptions((prev) => mergeUniqueProducts([...mapped, ...prev]));
      } catch (error) {
        toast.error('فشل تحميل المنتجات');
      } finally {
        setLoadingProducts(false);
      }
    },
    [mergeUniqueProducts],
  );

  useEffect(() => {
    if (!dialogOpen) return;
    const timer = setTimeout(() => {
      void loadProducts(productSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [dialogOpen, loadProducts, productSearch]);

  useEffect(() => {
    if (!dialogOpen || !form.linkedProductId) return;
    if (productOptions.some((item) => item.id === form.linkedProductId)) return;

    const loadLinkedProduct = async () => {
      try {
        const product = await productsApi.getById(form.linkedProductId as string);
        if (!product?._id) return;
        setProductOptions((prev) =>
          mergeUniqueProducts([
            {
              id: product._id,
              name: product.name || product.nameEn || product.sku || 'بدون اسم',
              nameEn: product.nameEn,
              sku: product.sku,
            },
            ...prev,
          ]),
        );
      } catch {
        // ignore loading linked product failure
      }
    };

    void loadLinkedProduct();
  }, [dialogOpen, form.linkedProductId, mergeUniqueProducts, productOptions]);

  useEffect(() => {
    if (!currentGuide || !editingId) return;
    setForm({
      titleAr: currentGuide.titleAr || '',
      titleEn: currentGuide.titleEn || '',
      tagAr: currentGuide.tagAr || '',
      tagEn: currentGuide.tagEn || '',
      descriptionAr: currentGuide.descriptionAr || '',
      descriptionEn: currentGuide.descriptionEn || '',
      coverImageId: currentGuide.coverImageId || '',
      coverImageUrl: currentGuide.coverImageUrl || '',
      videoId: currentGuide.videoId || '',
      linkedProductId: currentGuide.linkedProductId || null,
      sortOrder: currentGuide.sortOrder ?? 0,
      isActive: currentGuide.isActive ?? true,
    });

    if (currentGuide.coverImageUrl) {
      setSelectedCover({
        _id: currentGuide.coverImageId,
        url: currentGuide.coverImageUrl,
        name: currentGuide.titleAr || 'Cover Image',
        category: MediaCategory.OTHER,
        type: 'image' as any,
        mimeType: 'image/jpeg',
        size: 0,
        isPublic: true,
        usageCount: 0,
      } as Media);
    } else {
      setSelectedCover(null);
    }

    if (currentGuide.linkedProduct) {
      setProductOptions((prev) =>
        mergeUniqueProducts([
          {
            id: currentGuide.linkedProduct!.id,
            name:
              currentGuide.linkedProduct!.name ||
              currentGuide.linkedProduct!.nameEn ||
              'بدون اسم',
            nameEn: currentGuide.linkedProduct!.nameEn,
          },
          ...prev,
        ]),
      );
    }
  }, [currentGuide, editingId, mergeUniqueProducts]);

  const currentLinkedProduct = useMemo(
    () => productOptions.find((item) => item.id === form.linkedProductId) || null,
    [form.linkedProductId, productOptions],
  );

  const resetFormState = () => {
    setForm(emptyFormState);
    setSelectedCover(null);
    setEditingId(null);
    setProductSearch('');
  };

  const openCreateDialog = () => {
    resetFormState();
    setDialogOpen(true);
  };

  const openEditDialog = (guide: InstallationGuideListItem) => {
    resetFormState();
    setEditingId(guide.id);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    resetFormState();
  };

  const saveGuide = () => {
    if (
      !form.titleAr.trim() ||
      !form.titleEn.trim() ||
      !form.tagAr.trim() ||
      !form.tagEn.trim() ||
      !form.descriptionAr.trim() ||
      !form.descriptionEn.trim() ||
      !form.coverImageId ||
      !form.videoId.trim()
    ) {
      toast.error('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    const payload: CreateInstallationGuideDto = {
      titleAr: form.titleAr.trim(),
      titleEn: form.titleEn.trim(),
      tagAr: form.tagAr.trim(),
      tagEn: form.tagEn.trim(),
      descriptionAr: form.descriptionAr.trim(),
      descriptionEn: form.descriptionEn.trim(),
      coverImageId: form.coverImageId,
      videoId: form.videoId.trim(),
      linkedProductId: form.linkedProductId || null,
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    };

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, payload: payload as UpdateInstallationGuideDto },
        {
          onSuccess: () => {
            closeDialog();
            void refetch();
          },
          onError: (error: any) => {
            toast.error(
              error?.response?.data?.error?.message || 'فشل تحديث دليل التركيب',
            );
          },
        },
      );
      return;
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        closeDialog();
        void refetch();
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.error?.message || 'فشل إضافة دليل التركيب',
        );
      },
    });
  };

  const toggleGuideStatus = (guide: InstallationGuideListItem) => {
    toggleMutation.mutate(
      { id: guide.id, payload: { isActive: !guide.isActive } },
      {
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.error?.message || 'فشل تحديث حالة الدليل',
          );
        },
      },
    );
  };

  const deleteGuide = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        void refetch();
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.error?.message || 'فشل حذف الدليل');
      },
    });
  };

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        mb={3}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <MenuBook color="primary" />
          <Typography variant="h4">
            {t('navigation.installationGuides', 'أدلة التركيب')}
          </Typography>
        </Stack>
        <Button variant="contained" startIcon={<Add />} onClick={openCreateDialog}>
          إضافة دليل
        </Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="بحث"
            placeholder="العنوان أو التاغ"
            value={filters.search || ''}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                page: 1,
                search: event.target.value,
              }))
            }
            fullWidth
          />
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>الحالة</InputLabel>
            <Select
              label="الحالة"
              value={
                filters.isActive === undefined
                  ? 'all'
                  : filters.isActive
                    ? 'active'
                    : 'inactive'
              }
              onChange={(event) => {
                const value = event.target.value;
                setFilters((prev) => ({
                  ...prev,
                  page: 1,
                  isActive:
                    value === 'all' ? undefined : value === 'active' ? true : false,
                }));
              }}
            >
              <MenuItem value="all">الكل</MenuItem>
              <MenuItem value="active">نشط</MenuItem>
              <MenuItem value="inactive">غير نشط</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <Paper sx={{ overflowX: 'auto' }}>
        {isLoading ? (
          <Box py={8} display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>الغلاف</TableCell>
                <TableCell>العنوان</TableCell>
                <TableCell>التاغ</TableCell>
                <TableCell>الترتيب</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>آخر تحديث</TableCell>
                <TableCell align="right">الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {guides.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary" py={4}>
                      لا توجد بيانات
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                guides.map((guide) => (
                  <TableRow key={guide.id}>
                    <TableCell>
                      {guide.coverImageUrl ? (
                        <Box
                          component="img"
                          src={guide.coverImageUrl}
                          alt={guide.titleAr}
                          sx={{
                            width: 64,
                            height: 64,
                            objectFit: 'cover',
                            borderRadius: 1,
                          }}
                        />
                      ) : (
                        <Typography color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>{guide.titleAr}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {guide.titleEn}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>{guide.tagAr}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {guide.tagEn}
                      </Typography>
                    </TableCell>
                    <TableCell>{guide.sortOrder}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={guide.isActive ? 'نشط' : 'غير نشط'}
                        color={guide.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(guide.updatedAt).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="تعديل">
                        <IconButton onClick={() => openEditDialog(guide)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={guide.isActive ? 'تعطيل' : 'تفعيل'}>
                        <IconButton onClick={() => toggleGuideStatus(guide)}>
                          {guide.isActive ? (
                            <VisibilityOff fontSize="small" />
                          ) : (
                            <Visibility fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="حذف">
                        <IconButton
                          color="error"
                          onClick={() => setDeleteTarget(guide)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      {pagination && pagination.pages > 1 && (
        <Box mt={2} display="flex" justifyContent="center">
          <Pagination
            count={pagination.pages}
            page={filters.page || 1}
            onChange={(_, page) =>
              setFilters((prev) => ({ ...prev, page }))
            }
            color="primary"
          />
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'تعديل دليل التركيب' : 'إضافة دليل تركيب'}</DialogTitle>
        <DialogContent dividers>
          {editingId && loadingCurrentGuide ? (
            <Box py={6} display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  label="العنوان (عربي)"
                  value={form.titleAr}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, titleAr: event.target.value }))
                  }
                  fullWidth
                  required
                />
                <TextField
                  label="العنوان (English)"
                  value={form.titleEn}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, titleEn: event.target.value }))
                  }
                  fullWidth
                  required
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  label="التاغ (عربي)"
                  value={form.tagAr}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, tagAr: event.target.value }))
                  }
                  fullWidth
                  required
                />
                <TextField
                  label="التاغ (English)"
                  value={form.tagEn}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, tagEn: event.target.value }))
                  }
                  fullWidth
                  required
                />
              </Stack>

              <TextField
                label="الوصف (عربي)"
                value={form.descriptionAr}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, descriptionAr: event.target.value }))
                }
                fullWidth
                multiline
                minRows={3}
                required
              />
              <TextField
                label="الوصف (English)"
                value={form.descriptionEn}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, descriptionEn: event.target.value }))
                }
                fullWidth
                multiline
                minRows={3}
                required
              />

              <ImageField
                label="صورة الغلاف"
                value={selectedCover || form.coverImageUrl || ''}
                onChange={(media) => {
                  setSelectedCover(media);
                  setForm((prev) => ({
                    ...prev,
                    coverImageId: media?._id || '',
                    coverImageUrl: media?.url || '',
                  }));
                }}
                category={MediaCategory.OTHER}
                required
              />

              <Box>
                <Typography variant="subtitle2" mb={1}>
                  الفيديو
                </Typography>
                <VideoUploader
                  value={form.videoId}
                  onChange={(videoId) =>
                    setForm((prev) => ({ ...prev, videoId: videoId || '' }))
                  }
                  label="رفع فيديو الشرح"
                />
              </Box>

              <Autocomplete
                options={productOptions}
                value={currentLinkedProduct}
                onChange={(_, value) =>
                  setForm((prev) => ({
                    ...prev,
                    linkedProductId: value?.id || null,
                  }))
                }
                inputValue={productSearch}
                onInputChange={(_, value) => setProductSearch(value)}
                loading={loadingProducts}
                filterOptions={(options) => options}
                getOptionLabel={(option) =>
                  option.name || option.nameEn || option.sku || option.id
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option) => (
                  <Box component="li" {...props} key={option.id}>
                    <Stack spacing={0.2}>
                      <Typography variant="body2">{option.name}</Typography>
                      {(option.nameEn || option.sku) && (
                        <Typography variant="caption" color="text.secondary">
                          {[option.nameEn, option.sku].filter(Boolean).join(' - ')}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="المنتج المرتبط (اختياري)"
                    placeholder="ابحث عن منتج..."
                  />
                )}
              />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  label="الترتيب"
                  type="number"
                  value={form.sortOrder}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      sortOrder: Number(event.target.value || 0),
                    }))
                  }
                  inputProps={{ min: 0 }}
                  fullWidth
                />
                <Box display="flex" alignItems="center" width="100%">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.isActive}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            isActive: event.target.checked,
                          }))
                        }
                      />
                    }
                    label="نشط"
                  />
                </Box>
              </Stack>

              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" mb={1}>
                  معاينة البطاقة
                </Typography>
                <Typography fontWeight={600}>
                  {form.titleAr || 'عنوان الدليل'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {form.tagAr || 'Tag'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {form.linkedProductId
                    ? 'يوجد منتج مرتبط'
                    : 'بدون منتج مرتبط'}
                </Typography>
              </Paper>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={isSaving}>
            إلغاء
          </Button>
          <Button variant="contained" onClick={saveGuide} disabled={isSaving}>
            {isSaving ? 'جارٍ الحفظ...' : 'حفظ'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent dividers>
          <Typography>
            هل أنت متأكد من حذف الدليل
            {deleteTarget ? ` "${deleteTarget.titleAr}"` : ''}؟
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleteMutation.isPending}>
            إلغاء
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={deleteGuide}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'جارٍ الحذف...' : 'حذف'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

