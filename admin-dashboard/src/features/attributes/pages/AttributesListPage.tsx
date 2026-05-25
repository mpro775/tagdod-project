import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { GridPaginationModel } from '@mui/x-data-grid';
import { Add } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { PageShell, PageHeader, ResponsiveDataView } from '@/shared/design-system';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/shared/components';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useAttributes, useDeleteAttribute, useRestoreAttribute, useAttributeStats } from '../hooks/useAttributes';
import { AttributeStatsCards } from '../components/AttributeStatsCards';
import { AttributesToolbar } from '../components/AttributesToolbar';
import { AttributesTableColumns } from '../components/AttributesTableColumns';
import { AttributeAdminCard } from '../components/AttributeAdminCard';
import type { Attribute, AttributeType, ListAttributesParams } from '../types/attribute.types';

const getAttributeTypeLabels = (t: (key: string) => string): Record<AttributeType, string> => ({
  text: t('typeLabels.text'),
  color: t('typeLabels.color'),
});

export const AttributesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('attributes');
  const { confirmDialog, dialogProps } = useConfirmDialog();
  const [filters, setFilters] = useState<ListAttributesParams>({});
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 25 });

  const { data: attributesResponse, isLoading, refetch } = useAttributes(filters);
  const { data: stats } = useAttributeStats();
  const { mutate: deleteAttribute } = useDeleteAttribute();
  const { mutate: restoreAttribute } = useRestoreAttribute();
  const attributes = attributesResponse?.data || [];

  const attributeTypeLabels = useMemo(() => getAttributeTypeLabels(t), [t]);

  const showSnackbar = useCallback((message: string, severity: 'success' | 'error' | 'info') => {
    if (severity === 'success') toast.success(message);
    else if (severity === 'error') toast.error(message);
    else toast(message);
  }, []);

  const handleDelete = useCallback((id: string) => {
    deleteAttribute(id, {
      onSuccess: () => { showSnackbar(t('messages.deleteSuccess', { item: t('messages.attribute') }), 'success'); refetch(); },
      onError: () => showSnackbar(t('messages.deleteError', { item: t('messages.attribute') }), 'error'),
    });
  }, [deleteAttribute, showSnackbar, t, refetch]);

  const handleRestore = useCallback((id: string) => {
    restoreAttribute(id, {
      onSuccess: () => { showSnackbar(t('messages.restoreSuccess', { item: t('messages.attribute') }), 'success'); refetch(); },
      onError: () => showSnackbar(t('messages.restoreError', { item: t('messages.attribute') }), 'error'),
    });
  }, [restoreAttribute, showSnackbar, t, refetch]);

  const onDelete = async (attr: Attribute) => {
    const confirmed = await confirmDialog({ title: t('messages.deleteTitle', 'تأكيد الحذف'), message: t('messages.deleteConfirm', { name: attr.name }), type: 'warning', confirmColor: 'error' });
    if (confirmed) handleDelete(attr._id);
  };

  const onRestore = (attr: Attribute) => handleRestore(attr._id);
  const onEdit = (attr: Attribute) => navigate(`/attributes/${attr._id}`);
  const onManageValues = (attr: Attribute) => navigate(`/attributes/${attr._id}/values`);

  const columns = AttributesTableColumns(t, attributeTypeLabels, onEdit, onDelete, onRestore, onManageValues);

  return (
    <PageShell spacing="compact" fullHeight>
      <PageHeader
        variant="compact"
        title={t('attributes.title')}
        description={t('attributes.subtitle', { defaultValue: '' })}
        breadcrumbs={[
          { label: t('common.home', { ns: 'common' }), to: '/' },
          { label: t('attributes.title') },
        ]}
        actions={[
          { label: t('attributes.addNew'), icon: <Add />, variant: 'primary', to: '/attributes/new' },
        ]}
      />

      <AttributeStatsCards stats={stats} compact />

      <AttributesToolbar filters={filters} onFiltersChange={setFilters} />

      <ResponsiveDataView
        rows={attributes}
        columns={columns}
        renderCard={(attr: Attribute) => (
          <AttributeAdminCard
            attribute={attr}
            attributeTypeLabels={attributeTypeLabels}
            onEdit={() => onEdit(attr)}
            onDelete={() => onDelete(attr)}
            onRestore={attr.deletedAt ? () => onRestore(attr) : undefined}
            onManageValues={() => onManageValues(attr)}
          />
        )}
        renderTable={(rows) => (
          <DataTable
            title=""
            columns={columns}
            rows={rows}
            loading={isLoading}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            onAdd={() => navigate('/attributes/new')}
            addButtonText={t('attributes.addNew')}
            onRowClick={(params) => navigate(`/attributes/${(params.row as Attribute)._id}`)}
            height={600}
            getRowId={(row) => (row as Attribute)._id}
          />
        )}
        emptyTitle={t('messages.noAttributes', { defaultValue: 'لا توجد خصائص' })}
        emptyActionLabel={t('attributes.addNew')}
        onEmptyAction={() => navigate('/attributes/new')}
        getRowId={(row) => (row as Attribute)._id}
      />

      <ConfirmDialog {...dialogProps} />
    </PageShell>
  );
};