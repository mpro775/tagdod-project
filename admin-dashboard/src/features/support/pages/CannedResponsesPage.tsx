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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add,
  Refresh,
  ArrowBack,
  Search,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('support');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
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
    return t(`category.${category}` as any);
  };

  const renderSkeletons = () => (
    <Grid container spacing={{ xs: 2, sm: 3 }}>
      {[...Array(6)].map((_, index) => (
        <Grid component="div" size={{ xs: 12, sm: 6, md: 4 }} key={index}>
          <Skeleton 
            variant="rectangular" 
            height={isMobile ? 250 : 200}
            sx={{ borderRadius: 2 }}
          />
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, py: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={{ xs: 2, sm: 0 }}
        mb={3}
      >
        <Typography 
          variant={isMobile ? 'h5' : 'h4'} 
          fontWeight="bold"
          sx={{ color: 'text.primary' }}
        >
          {t('cannedResponses.title')}
        </Typography>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/support')}
            fullWidth={isMobile}
            size={isMobile ? 'small' : 'medium'}
            sx={{
              color: 'text.primary',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              },
            }}
          >
            {t('messages.backToTickets')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={isLoading}
            fullWidth={isMobile}
            size={isMobile ? 'small' : 'medium'}
            sx={{
              color: 'text.primary',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              },
            }}
          >
            {t('labels.refresh')}
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateResponse}
            fullWidth={isMobile}
            size={isMobile ? 'small' : 'medium'}
          >
            {t('labels.add')} {t('titles.cannedResponses')}
          </Button>
        </Stack>
      </Stack>

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder={t('cannedResponses.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
          }}
          sx={{ 
            minWidth: isMobile ? '100%' : 300,
            flex: { xs: '1 1 100%', sm: '0 1 auto' }
          }}
          size={isMobile ? 'small' : 'medium'}
        />
        <FormControl 
          sx={{ 
            minWidth: isMobile ? '100%' : 200,
            flex: { xs: '1 1 100%', sm: '0 1 auto' }
          }}
        >
          <InputLabel>{t('filters.categoryLabel')}</InputLabel>
          <Select
            value={categoryFilter}
            label={t('filters.categoryLabel')}
            onChange={(e) => setCategoryFilter(e.target.value as SupportCategory)}
            size={isMobile ? 'small' : 'medium'}
          >
            <MenuItem value="">{t('category.all')}</MenuItem>
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
          <Typography 
            variant="body1"
            sx={{ color: 'text.secondary' }}
          >
            {t('cannedResponses.results', {
              current: responsesData.data.length,
              total: responsesData.meta?.total || 0
            })}
          </Typography>
        </Box>
      )}

      {/* Responses Grid */}
      {isLoading ? (
        renderSkeletons()
      ) : responsesData?.data && responsesData.data.length > 0 ? (
        <Grid container spacing={{ xs: 2, sm: 3 }}>
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
            {t('cannedResponses.noResults')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('cannedResponses.noResultsDesc')}
          </Typography>
        </Box>
      )}

      {/* Create Dialog */}
      <Dialog 
        open={isCreateDialogOpen} 
        onClose={() => setIsCreateDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ color: 'text.primary' }}>
          {t('cannedResponses.dialog.createTitle')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label={t('cannedResponses.dialog.titleLabel')}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
              size={isMobile ? 'small' : 'medium'}
            />
            <TextField
              label={t('cannedResponses.dialog.contentArLabel')}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              multiline
              rows={4}
              fullWidth
              required
              size={isMobile ? 'small' : 'medium'}
            />
            <TextField
              label={t('cannedResponses.dialog.contentEnLabel')}
              value={formData.contentEn}
              onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
              multiline
              rows={4}
              fullWidth
              required
              size={isMobile ? 'small' : 'medium'}
            />
            <FormControl fullWidth>
              <InputLabel>{t('cannedResponses.dialog.categoryLabel')}</InputLabel>
              <Select
                value={formData.category}
                label={t('cannedResponses.dialog.categoryLabel')}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                size={isMobile ? 'small' : 'medium'}
              >
                {Object.values(SupportCategory).map((category) => (
                  <MenuItem key={category} value={category}>
                    {getCategoryLabel(category)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label={t('cannedResponses.dialog.tagsLabel')}
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              fullWidth
              placeholder={t('cannedResponses.dialog.tagsPlaceholder')}
              size={isMobile ? 'small' : 'medium'}
            />
            <TextField
              label={t('cannedResponses.dialog.shortcutLabel')}
              value={formData.shortcut}
              onChange={(e) => setFormData({ ...formData, shortcut: e.target.value })}
              fullWidth
              placeholder={t('cannedResponses.dialog.shortcutPlaceholder')}
              size={isMobile ? 'small' : 'medium'}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
          <Button 
            onClick={() => setIsCreateDialogOpen(false)}
            sx={{ color: 'text.secondary' }}
          >
            {t('cannedResponses.dialog.cancel')}
          </Button>
          <Button 
            onClick={handleSaveResponse}
            variant="contained"
            disabled={!formData.title || !formData.content || !formData.contentEn}
          >
            {t('cannedResponses.dialog.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={isEditDialogOpen} 
        onClose={() => setIsEditDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ color: 'text.primary' }}>
          {t('cannedResponses.dialog.editTitle')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label={t('cannedResponses.dialog.titleLabel')}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
              size={isMobile ? 'small' : 'medium'}
            />
            <TextField
              label={t('cannedResponses.dialog.contentArLabel')}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              multiline
              rows={4}
              fullWidth
              required
              size={isMobile ? 'small' : 'medium'}
            />
            <TextField
              label={t('cannedResponses.dialog.contentEnLabel')}
              value={formData.contentEn}
              onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
              multiline
              rows={4}
              fullWidth
              required
              size={isMobile ? 'small' : 'medium'}
            />
            <FormControl fullWidth>
              <InputLabel>{t('cannedResponses.dialog.categoryLabel')}</InputLabel>
              <Select
                value={formData.category}
                label={t('cannedResponses.dialog.categoryLabel')}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                size={isMobile ? 'small' : 'medium'}
              >
                {Object.values(SupportCategory).map((category) => (
                  <MenuItem key={category} value={category}>
                    {getCategoryLabel(category)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label={t('cannedResponses.dialog.tagsLabel')}
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              fullWidth
              placeholder={t('cannedResponses.dialog.tagsPlaceholder')}
              size={isMobile ? 'small' : 'medium'}
            />
            <TextField
              label={t('cannedResponses.dialog.shortcutLabel')}
              value={formData.shortcut}
              onChange={(e) => setFormData({ ...formData, shortcut: e.target.value })}
              fullWidth
              placeholder={t('cannedResponses.dialog.shortcutPlaceholder')}
              size={isMobile ? 'small' : 'medium'}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
          <Button 
            onClick={() => setIsEditDialogOpen(false)}
            sx={{ color: 'text.secondary' }}
          >
            {t('cannedResponses.dialog.cancel')}
          </Button>
          <Button 
            onClick={handleSaveResponse}
            variant="contained"
            disabled={!formData.title || !formData.content || !formData.contentEn}
          >
            {t('cannedResponses.dialog.saveChanges')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
