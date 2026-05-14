import React, { useState } from 'react';
import { Box, Typography, Button, Grid, Alert } from '@mui/material';
import { Add, Assignment } from '@mui/icons-material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { ProjectStatsCards } from '../components/ProjectStatsCards';
import { ProjectFilters } from '../components/ProjectFilters';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectFormDialog } from '../components/ProjectFormDialog';
import { ProjectDeleteDialog } from '../components/ProjectDeleteDialog';
import {
  useProjects, useDeleteProject, useToggleProjectPublish, useToggleProjectLanding, useToggleProjectFeatured, useCreateProject, useUpdateProject,
} from '../hooks/useProjects';
import { formatDate } from '@/shared/utils/formatters';
import type { Project, ListProjectsParams } from '../types/project.types';

export const ProjectsListPage: React.FC = () => {
  const { t } = useTranslation('projects');
  const { isMobile } = useBreakpoint();

  const [filters, setFilters] = useState<ListProjectsParams>({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' });
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [formDialog, setFormDialog] = useState<{ open: boolean; mode: 'create' | 'edit'; project: Project | null }>({ open: false, mode: 'create', project: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; project: Project | null }>({ open: false, project: null });

  const { data: projectsResponse, isLoading, refetch } = useProjects(filters);
  const deleteMutation = useDeleteProject();
  const togglePublish = useToggleProjectPublish();
  const toggleLanding = useToggleProjectLanding();
  const toggleFeatured = useToggleProjectFeatured();
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();

  const projects = projectsResponse?.data || [];

  const handleFiltersChange = (newFilters: ListProjectsParams) => { setFilters(newFilters); setPaginationModel({ page: 0, pageSize: newFilters.limit || 20 }); };
  const handleFiltersReset = () => { setFilters({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }); setPaginationModel({ page: 0, pageSize: 20 }); };
  const handlePaginationModelChange = (model: GridPaginationModel) => { setPaginationModel(model); setFilters((prev) => ({ ...prev, page: model.page + 1, limit: model.pageSize })); };

  const handleAdd = () => setFormDialog({ open: true, mode: 'create', project: null });
  const handleEdit = (project: Project) => setFormDialog({ open: true, mode: 'edit', project });
  const handleDelete = (project: Project) => setDeleteDialog({ open: true, project });

  const handleSave = async (data: any) => {
    try {
      if (formDialog.mode === 'create') { await createMutation.mutateAsync(data); } else if (formDialog.project) { await updateMutation.mutateAsync({ id: formDialog.project._id, data }); }
      setFormDialog({ open: false, mode: 'create', project: null }); refetch();
    } catch {}
  };

  const handleDeleteConfirm = () => { if (deleteDialog.project) { deleteMutation.mutate(deleteDialog.project._id, { onSuccess: () => { setDeleteDialog({ open: false, project: null }); refetch(); } }); } };

  const columns: GridColDef[] = [
    { field: 'titleAr', headerName: t('table.columns.project'), width: 250, renderCell: (params) => (<Box><Typography variant="subtitle2" fontWeight="bold" noWrap>{params.row.titleAr}</Typography>{params.row.titleEn && <Typography variant="caption" color="text.secondary">{params.row.titleEn}</Typography>}</Box>) },
    { field: 'type', headerName: t('table.columns.type'), width: 130, renderCell: (params) => params.row.type ? t(`types.${params.row.type}`) : '' },
    { field: 'status', headerName: t('table.columns.status'), width: 130, renderCell: (params) => params.row.status ? t(`status.${params.row.status}`) : '' },
    { field: 'showOnLanding', headerName: t('table.columns.showOnLanding'), width: 120, renderCell: (params) => params.row.showOnLanding ? 'نعم' : 'لا' },
    { field: 'isFeatured', headerName: t('table.columns.isFeatured'), width: 100, renderCell: (params) => params.row.isFeatured ? 'نعم' : 'لا' },
    { field: 'isPublished', headerName: t('table.columns.isPublished'), width: 100, renderCell: (params) => params.row.isPublished ? 'منشور' : 'مسودة' },
    { field: 'landingOrder', headerName: t('table.columns.landingOrder'), width: 100 },
    { field: 'createdAt', headerName: t('table.columns.createdAt'), width: 130, valueFormatter: (value) => formatDate(value as Date) },
    { field: 'actions', headerName: t('table.columns.actions'), width: 180, sortable: false, renderCell: (params) => (<Box display="flex" gap={0.5}><Button size="small" onClick={() => handleEdit(params.row)}>تعديل</Button><Button size="small" color="error" onClick={() => handleDelete(params.row)}>حذف</Button></Box>) },
  ];

  return (
    <Box>
      <Box mb={3}>
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" gap={2} mb={2}>
          <Box display="flex" alignItems="center" gap={2}><Assignment fontSize={isMobile ? 'medium' : 'large'} color="primary" /><Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>{t('pageTitle')}</Typography></Box>
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd} fullWidth={isMobile}>{t('table.addButton')}</Button>
        </Box>
      </Box>
      <ProjectStatsCards />
      <ProjectFilters filters={filters} onFiltersChange={handleFiltersChange} onReset={handleFiltersReset} loading={isLoading} />
      {isMobile ? (
        <Grid container spacing={2}>
          {isLoading ? [...Array(6)].map((_, i) => (<Grid size={{ xs: 12 }} key={i}><Box sx={{ height: 300, borderRadius: 2, bgcolor: 'grey.100' }} /></Grid>)) : projects.map((p) => (<Grid size={{ xs: 12 }} key={p._id}><ProjectCard project={p} onEdit={handleEdit} onDelete={handleDelete} onTogglePublish={togglePublish.mutate} onToggleLanding={toggleLanding.mutate} onToggleFeatured={toggleFeatured.mutate} /></Grid>))}
        </Grid>
      ) : (
        <DataTable title={t('table.title')} columns={columns} rows={projects} loading={isLoading} paginationModel={paginationModel} onPaginationModelChange={handlePaginationModelChange} rowCount={projectsResponse?.meta?.total ?? 0} paginationMode="server" getRowId={(row) => row._id} onAdd={handleAdd} addButtonText={t('table.addButton')} height="calc(100vh - 450px)" />
      )}
      <ProjectFormDialog open={formDialog.open} onClose={() => setFormDialog({ open: false, mode: 'create', project: null })} project={formDialog.project} mode={formDialog.mode} onSave={handleSave} loading={createMutation.isPending || updateMutation.isPending} />
      <ProjectDeleteDialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, project: null })} onConfirm={handleDeleteConfirm} project={deleteDialog.project} loading={deleteMutation.isPending} />
    </Box>
  );
};
