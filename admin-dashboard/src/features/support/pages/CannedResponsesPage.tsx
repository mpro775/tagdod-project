import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
} from '@mui/material';
import {
  Add,
  Refresh,
  ArrowBack,
  Search,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  CannedResponseCard,
} from '../components';
import {
  useCannedResponses,
  useCreateCannedResponse,
  useUpdateCannedResponse,
  useUseCannedResponse,
} from '../hooks/useSupport';
import { SupportCategory } from '../types/support.types';

export const CannedResponsesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SupportCategory | ''>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingResponse, setEditingResponse] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    contentEn: '',
    category: '',
    tags: '',
    shortcut: '',
  });

  const { data: responsesData, isLoading, refetch } = useCannedResponses({
    search: searchTerm,
    category: categoryFilter || undefined,
  });

  const createMutation = useCreateCannedResponse();
  const updateMutation = useUpdateCannedResponse();
  const useMutation = useUseCannedResponse();

  const handleRefresh = () => {
    refetch();
  };

  const handleCreateResponse = () => {
    setIsCreateDialogOpen(true);
    setFormData({
      title: '',
      content: '',
      contentEn: '',
      category: '',
      tags: '',
      shortcut: '',
    });
  };

  const handleEditResponse = (response: any) => {
    setEditingResponse(response);
    setFormData({
      title: response.title,
      content: response.content,
      contentEn: response.contentEn,
      category: response.category || '',
      tags: response.tags.join(', '),
      shortcut: response.shortcut || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveResponse = () => {
    const responseData = {
      ...formData,
      category: formData.category ? (formData.category as SupportCategory) : undefined,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    if (editingResponse) {
      updateMutation.mutate(
        { id: editingResponse._id, data: responseData },
        {
          onSuccess: () => {
            setIsEditDialogOpen(false);
            setEditingResponse(null);
            refetch();
          },
        }
      );
    } else {
      createMutation.mutate(responseData, {
        onSuccess: () => {
          setIsCreateDialogOpen(false);
          refetch();
        },
      });
    }
  };

  const handleUseResponse = (response: any) => {
    useMutation.mutate(response._id, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const getCategoryLabel = (category: SupportCategory): string => {
    switch (category) {
      case SupportCategory.TECHNICAL:
        return 'تقني';
      case SupportCategory.BILLING:
        return 'الفواتير';
      case SupportCategory.PRODUCTS:
        return 'المنتجات';
      case SupportCategory.SERVICES:
        return 'الخدمات';
      case SupportCategory.ACCOUNT:
        return 'الحساب';
      case SupportCategory.OTHER:
        return 'أخرى';
      default:
        return 'عام';
    }
  };

  const renderSkeletons = () => (
    <Grid container spacing={3}>
      {[...Array(6)].map((_, index) => (
        <Grid component="div" size={{ xs: 12, sm: 6, md: 4 }} key={index}>
          <Skeleton variant="rectangular" height={200} />
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          إدارة الردود الجاهزة
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/support')}
          >
            العودة للتذاكر
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            تحديث
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateResponse}
          >
            إضافة رد جاهز
          </Button>
        </Stack>
      </Stack>

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="البحث في الردود الجاهزة..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
          }}
          sx={{ minWidth: 300 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>الفئة</InputLabel>
          <Select
            value={categoryFilter}
            label="الفئة"
            onChange={(e) => setCategoryFilter(e.target.value as SupportCategory)}
          >
            <MenuItem value="">جميع الفئات</MenuItem>
            {Object.values(SupportCategory).map((category) => (
              <MenuItem key={category} value={category}>
                {getCategoryLabel(category)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Results Summary */}
      {responsesData?.data && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1">
            عرض {responsesData.data.length} من أصل {responsesData.meta?.total || 0} رد جاهز
          </Typography>
        </Box>
      )}

      {/* Responses Grid */}
      {isLoading ? (
        renderSkeletons()
      ) : responsesData?.data && responsesData.data.length > 0 ? (
        <Grid container spacing={3}>
          {responsesData.data.map((response) => (
            <Grid component="div" size={{ xs: 12, sm: 6, md: 4 }} key={response._id}>
              <CannedResponseCard
                response={response}
                onEdit={handleEditResponse}
                onUse={handleUseResponse}
                onCopy={(response) => {
                  navigator.clipboard.writeText(response.content);
                }}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            لا توجد ردود جاهزة
          </Typography>
          <Typography variant="body2" color="text.secondary">
            لم يتم العثور على أي ردود جاهزة تطابق المعايير المحددة
          </Typography>
        </Box>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>إضافة رد جاهز جديد</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="العنوان"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="المحتوى (عربي)"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              multiline
              rows={4}
              fullWidth
              required
            />
            <TextField
              label="المحتوى (إنجليزي)"
              value={formData.contentEn}
              onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
              multiline
              rows={4}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>الفئة</InputLabel>
              <Select
                value={formData.category}
                label="الفئة"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {Object.values(SupportCategory).map((category) => (
                  <MenuItem key={category} value={category}>
                    {getCategoryLabel(category)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="الوسوم (مفصولة بفواصل)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              fullWidth
              placeholder="مثال: ترحيب، مساعدة، تقني"
            />
            <TextField
              label="الاختصار"
              value={formData.shortcut}
              onChange={(e) => setFormData({ ...formData, shortcut: e.target.value })}
              fullWidth
              placeholder="مثال: welcome"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>إلغاء</Button>
          <Button 
            onClick={handleSaveResponse}
            variant="contained"
            disabled={!formData.title || !formData.content || !formData.contentEn}
          >
            حفظ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>تعديل الرد الجاهز</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="العنوان"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="المحتوى (عربي)"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              multiline
              rows={4}
              fullWidth
              required
            />
            <TextField
              label="المحتوى (إنجليزي)"
              value={formData.contentEn}
              onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
              multiline
              rows={4}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>الفئة</InputLabel>
              <Select
                value={formData.category}
                label="الفئة"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {Object.values(SupportCategory).map((category) => (
                  <MenuItem key={category} value={category}>
                    {getCategoryLabel(category)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="الوسوم (مفصولة بفواصل)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              fullWidth
              placeholder="مثال: ترحيب، مساعدة، تقني"
            />
            <TextField
              label="الاختصار"
              value={formData.shortcut}
              onChange={(e) => setFormData({ ...formData, shortcut: e.target.value })}
              fullWidth
              placeholder="مثال: welcome"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>إلغاء</Button>
          <Button 
            onClick={handleSaveResponse}
            variant="contained"
            disabled={!formData.title || !formData.content || !formData.contentEn}
          >
            حفظ التغييرات
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
