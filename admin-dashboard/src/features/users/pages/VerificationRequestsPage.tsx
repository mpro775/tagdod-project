import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
} from '@mui/material';
import {
  Person,
  Store,
  Refresh,
  Description,
  CheckCircleOutline,
  CancelOutlined,
} from '@mui/icons-material';
import { PageShell } from '@/shared/design-system/components/PageShell';
import { PageHeader } from '@/shared/design-system/components/PageHeader';
import { PageSummaryGrid, StatCard } from '@/shared/design-system';
import { DataToolbar } from '@/shared/design-system/components/DataToolbar';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { EmptyState } from '@/shared/design-system/components/EmptyState';
import { RowActionsMenu, type RowAction } from '@/shared/design-system/components/RowActionsMenu';
import { VerificationRequestDialog } from '../components/VerificationRequestDialog';
import { usePendingVerifications } from '../hooks/useUsers';
import type { VerificationRequest } from '../types/user.types';
import { formatDate } from '@/shared/utils/formatters';
import { useTranslation } from 'react-i18next';

export const VerificationRequestsPage: React.FC = () => {
  const { t } = useTranslation(['users', 'common']);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'engineer' | 'merchant'>('all');

  const { data: requestsData, isLoading, error, refetch } = usePendingVerifications();
  const requests = requestsData || [];

  const handleViewDetails = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRequest(null);
    setTimeout(() => refetch(), 500);
  };

  const filteredRequests = useMemo(() => {
    if (filterType === 'all') return requests;
    return requests.filter((r: VerificationRequest) => r.verificationType === filterType);
  }, [requests, filterType]);

  const engineerCount = requests.filter((r: VerificationRequest) => r.verificationType === 'engineer').length;
  const merchantCount = requests.filter((r: VerificationRequest) => r.verificationType === 'merchant').length;
  const incompleteDocs = requests.filter(
    (r: VerificationRequest) =>
      (r.verificationType === 'engineer' && !r.cvFileUrl) ||
      (r.verificationType === 'merchant' && !r.storePhotoUrl)
  ).length;

  const kpiCards = [
    {
      title: t('users:verification.kpi.total', 'إجمالي الطلبات'),
      value: requests.length.toLocaleString('en-US'),
      icon: <Description fontSize="small" />,
      tone: 'primary' as const,
    },
    {
      title: t('users:verification.kpi.engineer', 'مهندسون'),
      value: engineerCount.toLocaleString('en-US'),
      icon: <Person fontSize="small" />,
      tone: 'warning' as const,
    },
    {
      title: t('users:verification.kpi.merchant', 'تجار'),
      value: merchantCount.toLocaleString('en-US'),
      icon: <Store fontSize="small" />,
      tone: 'success' as const,
    },
    {
      title: t('users:verification.kpi.incomplete', 'ناقصة الوثائق'),
      value: incompleteDocs.toLocaleString('en-US'),
      icon: <CancelOutlined fontSize="small" />,
      tone: 'error' as const,
    },
  ];

  const columns = useMemo(
    () => [
      {
        field: 'name',
        headerName: t('users:verification.table.user', 'المستخدم'),
        minWidth: 180,
        flex: 1.2,
        renderCell: (params: any) => {
          const req = params.row as VerificationRequest;
          const fullName = `${req.firstName || ''} ${req.lastName || ''}`.trim();
          return (
            <Box sx={{ py: 0.5 }}>
              <Typography variant="body2" fontWeight="medium" noWrap>
                {fullName || t('common:notProvided', 'غير متوفر')}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {req.phone}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: 'verificationType',
        headerName: t('users:verification.table.type', 'نوع الطلب'),
        minWidth: 110,
        flex: 0.7,
        renderCell: (params: any) => {
          const req = params.row as VerificationRequest;
          const isEngineer = req.verificationType === 'engineer';
          return (
            <Chip
              icon={isEngineer ? <Person sx={{ fontSize: 16 }} /> : <Store sx={{ fontSize: 16 }} />}
              label={isEngineer ? t('users:verification.engineer', 'مهندس') : t('users:verification.merchant', 'تاجر')}
              size="small"
              color={isEngineer ? 'primary' : 'secondary'}
            />
          );
        },
      },
      {
        field: 'documents',
        headerName: t('users:verification.table.documents', 'الوثائق'),
        minWidth: 120,
        flex: 0.7,
        renderCell: (params: any) => {
          const req = params.row as VerificationRequest;
          const hasDocs = req.verificationType === 'engineer' ? !!req.cvFileUrl : !!req.storePhotoUrl;
          return (
            <Chip
              label={hasDocs ? t('users:verification.docsComplete', 'مكتملة') : t('users:verification.docsIncomplete', 'ناقصة')}
              size="small"
              color={hasDocs ? 'success' : 'error'}
              variant="outlined"
            />
          );
        },
      },
      {
        field: 'createdAt',
        headerName: t('users:verification.table.date', 'تاريخ الطلب'),
        minWidth: 130,
        flex: 0.8,
        renderCell: (params: any) => (
          <Typography variant="body2" color="text.secondary">
            {params.row.createdAt ? formatDate(params.row.createdAt) : '-'}
          </Typography>
        ),
      },
      {
        field: 'actions',
        headerName: t('common:actions.title', 'الإجراءات'),
        minWidth: 80,
        flex: 0.5,
        sortable: false,
        renderCell: (params: any) => {
          const actions: RowAction[] = [
            {
              label: t('users:verification.review', 'مراجعة'),
              icon: <CheckCircleOutline fontSize="small" />,
              onClick: () => handleViewDetails(params.row),
            },
          ];
          return <RowActionsMenu actions={actions} menuId={`verification-actions-${params.row.id}`} />;
        },
      },
    ],
    [t, filterType]
  );

  if (error) {
    return (
      <PageShell spacing="compact">
        <EmptyState
          title={t('users:verification.errorTitle', 'خطأ في التحميل')}
          description={t('users:verification.errorLoading', 'حدث خطأ أثناء تحميل طلبات التحقق')}
          icon={<CancelOutlined sx={{ fontSize: 48 }} />}
          actionLabel={t('common:actions.retry', 'إعادة المحاولة')}
          onAction={() => refetch()}
        />
      </PageShell>
    );
  }

  return (
    <PageShell spacing="compact">
      <PageHeader
        variant="compact"
        title={t('users:verification.title', 'طلبات التحقق')}
        description={t('users:verification.description', 'مراجعة طلبات توثيق المهندسين والتجار')}
        actions={[
          {
            label: t('users:verification.refresh', 'تحديث'),
            icon: <Refresh fontSize="small" />,
            onClick: () => refetch(),
            variant: 'secondary',
          },
        ]}
      />

      <PageSummaryGrid columns={4} compact>
        {kpiCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            tone={card.tone}
            compact
            loading={isLoading}
          />
        ))}
      </PageSummaryGrid>

      <DataToolbar
        searchValue=""
        searchPlaceholder={t('users:verification.searchPlaceholder', 'بحث بالاسم أو الهاتف...')}
        onSearchChange={() => {}}
        filters={
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {[
              { value: 'all' as const, label: t('users:verification.filterAll', 'الكل') },
              { value: 'engineer' as const, label: t('users:verification.engineer', 'مهندس') },
              { value: 'merchant' as const, label: t('users:verification.merchant', 'تاجر') },
            ].map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                size="small"
                variant={filterType === opt.value ? 'filled' : 'outlined'}
                color={filterType === opt.value ? 'primary' : 'default'}
                onClick={() => setFilterType(opt.value)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Stack>
        }
        compact
      />

      {filteredRequests.length > 0 ? (
        <DataTable
          columns={columns}
          rows={filteredRequests}
          loading={isLoading}
          paginationModel={{ page: 0, pageSize: 50 }}
          onPaginationModelChange={() => {}}
          paginationMode="client"
          getRowId={(row: any) => row.id}
          height="calc(100vh - 380px)"
          density="compact"
        />
      ) : !isLoading ? (
        <EmptyState
          title={t('users:verification.noRequests', 'لا توجد طلبات تحقق حالياً')}
          description={t('users:verification.noRequestsDescription', 'ستظهر هنا طلبات توثيق التجار والمهندسين عند إرسالها')}
          icon={<Description sx={{ fontSize: 48 }} />}
        />
      ) : null}

      <VerificationRequestDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        request={selectedRequest}
      />
    </PageShell>
  );
};