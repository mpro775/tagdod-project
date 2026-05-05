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
  Paper,
  Select,
  Stack,
  Switch,
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
import { MultipleImagesSelector } from '@/features/products/components/MultipleImagesSelector';
import { productsApi } from '@/features/products/api/productsApi';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
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
  imageIds: string[];
  imageUrls: string[];
  videoIds: string[];
  linkedProductIds: string[];
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
  imageIds: [],
  imageUrls: [],
  videoIds: [],
  linkedProductIds: [],
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
  const [selectedImages, setSelectedImages] = useState<
    { _id?: string; url: string; name: string }[]
  >([]);
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

        setProductOptions((prev) => {
          const newOptions = mergeUniqueProducts([...mapped, ...prev]);
          if (newOptions.length === prev.length && newOptions.every((opt, i) => opt.id === prev[i].id)) {
            return prev;
          }
          return newOptions;
        });
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
    if (!dialogOpen || form.linkedProductIds.length === 0) return;
    const missingProductIds = form.linkedProductIds.filter(
      (productId) => !productOptions.some((item) => item.id === productId),
    );
    if (missingProductIds.length === 0) return;

    const loadLinkedProduct = async () => {
      try {
        const products = await Promise.all(
          missingProductIds.map((productId) => productsApi.getById(productId)),
        );
        const product = products[0];
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
  }, [dialogOpen, form.linkedProductIds, mergeUniqueProducts, productOptions]);

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
      imageIds: currentGuide.imageIds || [],
      imageUrls: currentGuide.imageUrls || [],
      videoIds: currentGuide.videoIds || [],
      linkedProductIds:
        currentGuide.linkedProductIds?.length
          ? currentGuide.linkedProductIds
          : currentGuide.linkedProductId
            ? [currentGuide.linkedProductId]
            : [],
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

    if (currentGuide.imageUrls?.length && currentGuide.imageIds?.length) {
      setSelectedImages(
        currentGuide.imageUrls.map((url, idx) => ({
          _id: currentGuide.imageIds[idx] || `img-${idx}`,
          url,
          name: `صورة ${idx + 1}`,
        })),
      );
    } else {
      setSelectedImages([]);
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

  useEffect(() => {
    if (!currentGuide?.linkedProducts?.length) return;

    setProductOptions((prev) =>
      mergeUniqueProducts([
        ...currentGuide.linkedProducts.map((product) => ({
          id: product.id,
          name: product.name || product.nameEn || 'ط¨ط¯ظˆظ† ط§ط³ظ…',
          nameEn: product.nameEn,
        })),
        ...prev,
      ]),
    );
  }, [currentGuide?.linkedProducts, mergeUniqueProducts]);

  const currentLinkedProducts = useMemo(
    () =>
      form.linkedProductIds
        .map((productId) => productOptions.find((item) => item.id === productId))
        .filter((item): item is ProductOption => Boolean(item)),
    [form.linkedProductIds, productOptions],
  );

  const resetFormState = () => {
    setForm(emptyFormState);
    setSelectedCover(null);
    setSelectedImages([]);
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
      imageIds: form.imageIds,
      videoIds: form.videoIds,
      linkedProductIds: form.linkedProductIds,
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

  const columns: GridColDef[] = [
    {
      field: 'coverImageUrl',
      headerName: 'الغلاف',
      width: 100,
      renderCell: (params) =>
        params.row.coverImageUrl ? (
          <Box
            component="img"
            src={params.row.coverImageUrl}
            alt={params.row.titleAr}
            sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1 }}
          />
        ) : (
          '-'
        ),
    },
    {
      field: 'titleAr',
      headerName: 'العنوان',
      flex: 1,
      renderCell: (params) => (
        <Stack spacing={0.5} py={1}>
          <Typography fontWeight={600} fontSize="0.875rem">{params.row.titleAr}</Typography>
          <Typography variant="caption" color="text.secondary">{params.row.titleEn}</Typography>
        </Stack>
      ),
    },
    {
      field: 'tagAr',
      headerName: 'التاغ',
      flex: 1,
      renderCell: (params) => (
        <Stack spacing={0.5} py={1}>
          <Typography fontSize="0.875rem">{params.row.tagAr}</Typography>
          <Typography variant="caption" color="text.secondary">{params.row.tagEn}</Typography>
        </Stack>
      ),
    },
    { field: 'sortOrder', headerName: 'الترتيب', width: 100 },
    {
      field: 'isActive',
      headerName: 'الحالة',
      width: 150,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.row.isActive ? 'نشط' : 'غير نشط'}
          color={params.row.isActive ? 'success' : 'default'}
        />
      ),
    },
    {
      field: 'updatedAt',
      headerName: 'آخر تحديث',
      width: 200,
      renderCell: (params) => new Date(params.row.updatedAt).toLocaleString(),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 150,
      align: 'right',
      renderCell: (params) => (
        <Stack direction="row" justifyContent="flex-end">
          <Tooltip title="تعديل">
            <IconButton onClick={() => openEditDialog(params.row)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={params.row.isActive ? 'تعطيل' : 'تفعيل'}>
            <IconButton onClick={() => toggleGuideStatus(params.row)}>
              {params.row.isActive ? (
                <VisibilityOff fontSize="small" />
              ) : (
                <Visibility fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="حذف">
            <IconButton
              color="error"
              onClick={() => setDeleteTarget(params.row)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const paginationModel: GridPaginationModel = {
    page: (filters.page || 1) - 1,
    pageSize: filters.limit || 20,
  };

  const onPaginationModelChange = (model: GridPaginationModel) => {
    setFilters((prev) => ({
      ...prev,
      page: model.page + 1,
      limit: model.pageSize,
    }));
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
      </Paper>

      <DataTable
        columns={columns}
        rows={guides}
        loading={isLoading}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        rowCount={pagination?.total || 0}
        onSearch={(search) => setFilters((prev) => ({ ...prev, page: 1, search }))}
        searchPlaceholder="العنوان أو التاغ"
        getRowId={(row) => (row as InstallationGuideListItem).id}
        sx={{ height: 600 }}
      />

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
                  الفيديو الرئيسي
                </Typography>
                <VideoUploader
                  value={form.videoId}
                  onChange={(videoId) =>
                    setForm((prev) => ({ ...prev, videoId: videoId || '' }))
                  }
                  label="رفع فيديو الشرح"
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" mb={1}>
                  صور إضافية
                </Typography>
                <MultipleImagesSelector
                  value={selectedImages}
                  onChange={(images) => {
                    setSelectedImages(images);
                    setForm((prev) => ({
                      ...prev,
                      imageIds: images.map((img) => img._id || '').filter(Boolean),
                      imageUrls: images.map((img) => img.url),
                    }));
                  }}
                  maxImages={10}
                  label="صور المحتوى التعليمي"
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" mb={1}>
                  فيديوهات إضافية
                </Typography>
                <Stack spacing={2}>
                  {form.videoIds.map((vid, idx) => (
                    <Box
                      key={`extra-video-${idx}`}
                      sx={{
                        p: 1.5,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        position: 'relative',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="caption" fontWeight={600}>
                          فيديو إضافي {idx + 1}
                        </Typography>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              videoIds: prev.videoIds.filter((_, i) => i !== idx),
                            }))
                          }
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Stack>
                      <VideoUploader
                        value={vid}
                        onChange={(videoId) =>
                          setForm((prev) => ({
                            ...prev,
                            videoIds: prev.videoIds.map((v, i) =>
                              i === idx ? (videoId || '') : v,
                            ),
                          }))
                        }
                        label={`فيديو إضافي ${idx + 1}`}
                      />
                    </Box>
                  ))}
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        videoIds: [...prev.videoIds, ''],
                      }))
                    }
                    fullWidth
                  >
                    إضافة فيديو إضافي
                  </Button>
                </Stack>
              </Box>

              <Autocomplete
                multiple
                options={productOptions}
                value={currentLinkedProducts}
                onChange={(_, value) =>
                  setForm((prev) => ({
                    ...prev,
                    linkedProductIds: value.map((item) => item.id),
                  }))
                }
                inputValue={productSearch}
                onInputChange={(_, value, reason) => {
                  if (reason === 'input') {
                    setProductSearch(value);
                  }
                }}
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
                  {form.linkedProductIds.length > 0
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
