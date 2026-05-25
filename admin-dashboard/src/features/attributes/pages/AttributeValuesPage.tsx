import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Add, CheckCircle, ColorLens, Image, TrendingUp } from '@mui/icons-material';
import { AxiosError } from 'axios';
import { PageShell, PageHeader, PageSummaryGrid, StatCard, ResponsiveDataView } from '@/shared/design-system';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/shared/components';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useAttribute, useAttributeValues, useCreateAttributeValue, useDeleteAttributeValue, useUpdateAttributeValue } from '../hooks/useAttributes';
import { AttributeValuesToolbar } from '../components/AttributeValuesToolbar';
import { AttributeValuesTableColumns } from '../components/AttributeValuesTableColumns';
import { AttributeValueCard } from '../components/AttributeValueCard';
import AttributeValueDialog from '../components/AttributeValueDialog';
import type { AttributeValue, AttributeValueFormData } from '../types/attribute.types';
import type { ApiErrorResponse } from '@/shared/types/common.types';
import toast from 'react-hot-toast';

export const AttributeValuesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('attributes');
  const { confirmDialog, dialogProps } = useConfirmDialog();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<AttributeValue | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: attribute, isLoading: loadingAttr } = useAttribute(id!);
  const { data: values = [], isLoading: loadingValues, refetch } = useAttributeValues(id!);
  const { mutate: createValue, isPending: isCreating } = useCreateAttributeValue();
  const { mutate: updateValue, isPending: isUpdating } = useUpdateAttributeValue();
  const { mutate: deleteValue } = useDeleteAttributeValue();

  const handleSave = (data: AttributeValueFormData) => {
    if (!id) return;
    if (editingValue) {
      updateValue({ id: editingValue._id, data }, {
        onSuccess: () => { setDialogOpen(false); setEditingValue(null); toast.success(t('messages.updateSuccess', { item: t('messages.value') })); refetch(); },
        onError: () => { toast.error(t('messages.updateError', { item: t('messages.value') })); },
      });
    } else {
      const { isActive, ...createData } = data;
      createValue({ attributeId: id, data: createData }, {
        onSuccess: () => { setDialogOpen(false); toast.success(t('messages.createSuccess', { item: t('messages.value') })); refetch(); },
        onError: () => { toast.error(t('messages.createError', { item: t('messages.value') })); },
      });
    }
  };

  const handleEdit = (value: AttributeValue) => { setEditingValue(value); setDialogOpen(true); };

  const handleDelete = async (value: AttributeValue) => {
    const confirmed = await confirmDialog({
      title: t('messages.deleteValueTitle', 'تأكيد حذف القيمة'),
      message: t('messages.deleteValueConfirm', { name: value.value }),
      type: 'warning',
      confirmColor: 'error',
    });
    if (confirmed) {
      deleteValue(value._id, {
        onSuccess: () => { toast.success(t('messages.deleteSuccess', { item: t('messages.value') })); refetch(); },
        onError: (error) => {
          if (error instanceof AxiosError) {
            const errorData = error.response?.data as ApiErrorResponse | undefined;
            const details = errorData?.error?.details as { reason?: string; usageCount?: number } | undefined;
            if (details?.reason === 'in_use' && details.usageCount !== undefined) {
              toast.error(t('messages.deleteValueInUse', { name: value.value, count: details.usageCount }));
              return;
            }
          }
          toast.error(t('messages.deleteError', { item: t('messages.value') }));
        },
      });
    }
  };

  if (loadingAttr) {
    return (
      <PageShell spacing="compact" fullHeight>
        <PageHeader variant="compact" title="..." breadcrumbs={[{ label: '...', to: '/attributes' }]} />
      </PageShell>
    );
  }

  const statsCards = [
    { title: t('stats.totalValues'), value: String(values.length), icon: <TrendingUp fontSize="small" />, tone: 'primary' as const },
    { title: t('stats.activeValues'), value: String(values.filter((v) => v.isActive).length), icon: <CheckCircle fontSize="small" />, tone: 'success' as const },
    { title: t('stats.valuesWithColors'), value: String(values.filter((v) => v.hexCode).length), icon: <ColorLens fontSize="small" />, tone: 'info' as const },
    { title: t('stats.valuesWithImages'), value: String(values.filter((v) => v.imageUrl).length), icon: <Image fontSize="small" />, tone: 'warning' as const },
  ];

  const columns = AttributeValuesTableColumns(t, handleEdit, handleDelete);

  return (
    <PageShell spacing="compact" fullHeight>
      <PageHeader
        variant="compact"
        title={t('attributes.manageAttributeValues', { name: attribute?.name })}
        breadcrumbs={[
          { label: t('common.home', { ns: 'common' }), to: '/' },
          { label: t('attributes.title'), to: '/attributes' },
          { label: t('attributes.manageAttributeValues', { name: attribute?.name }) },
        ]}
        actions={[
          { label: t('attributes.addValue'), icon: <Add />, variant: 'primary', onClick: () => { setEditingValue(null); setDialogOpen(true); } },
        ]}
      />

      <PageSummaryGrid columns={4} compact>
        {statsCards.map((card) => (
          <StatCard key={card.title} title={card.title} value={card.value} icon={card.icon} tone={card.tone} compact />
        ))}
      </PageSummaryGrid>

      <AttributeValuesToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      <ResponsiveDataView
        rows={values}
        columns={columns}
        renderCard={(value: AttributeValue) => (
          <AttributeValueCard
            key={value._id}
            value={value}
            onEdit={() => handleEdit(value)}
            onDelete={async () => { await handleDelete(value); }}
          />
        )}
        renderTable={(rows) => (
          <DataTable
            title=""
            columns={columns}
            rows={rows}
            loading={loadingValues}
            paginationModel={{ page: 0, pageSize: 25 }}
            onPaginationModelChange={() => {}}
            getRowId={(row) => (row as AttributeValue)._id}
            height={500}
            rowHeight={70}
          />
        )}
        emptyTitle={t('messages.noValues')}
        emptyActionLabel={t('attributes.addValue')}
        onEmptyAction={() => { setEditingValue(null); setDialogOpen(true); }}
        getRowId={(row) => (row as AttributeValue)._id}
      />

      <AttributeValueDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingValue(null); }}
        onSave={handleSave}
        editingValue={editingValue}
        isLoading={isCreating || isUpdating}
        attributeType={attribute?.type}
      />

      <ConfirmDialog {...dialogProps} />
    </PageShell>
  );
};