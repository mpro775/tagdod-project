import { useMemo, useState } from 'react';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { Chip, Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { CheckCircle as CheckIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useTopSearchTerms } from '../hooks/useSearch';

export function TopSearchTermsTable() {
  const { t } = useTranslation('search');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { data: termsResponse, isLoading } = useTopSearchTerms({ limit: 50 });
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: isMobile ? 5 : 10,
  });

  // Handle nested response structure: response.data.data.data
  const terms = Array.isArray(termsResponse)
    ? termsResponse
    : Array.isArray((termsResponse as any)?.data?.data)
    ? (termsResponse as any).data.data
    : Array.isArray((termsResponse as any)?.data)
    ? (termsResponse as any).data
    : [];

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'rank',
        headerName: t('table.columns.rank'),
        width: 80,
        renderCell: (params) => {
          const globalIndex = terms.findIndex(
            (term: any) => (term.query || term.term) === params.row.query
          );
          return (
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {globalIndex + 1}
            </Typography>
          );
        },
      },
      {
        field: 'query',
        headerName: t('table.columns.keyword'),
        flex: 1,
        minWidth: 200,
        renderCell: (params) => (
          <Typography
            variant="body2"
            fontWeight="medium"
            sx={{
              color: 'text.primary',
              wordBreak: 'break-word',
            }}
          >
            {params.row.query}
          </Typography>
        ),
      },
      ...(!isMobile
        ? [
            {
              field: 'count',
              headerName: t('table.columns.count'),
              width: 150,
              align: 'center',
              headerAlign: 'center',
              renderCell: (params) => (
                <Chip
                  label={params.row.count}
                  color="primary"
                  size="small"
                  sx={{
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    height: { xs: 24, sm: 28 },
                  }}
                />
              ),
            } as GridColDef,
            {
              field: 'averageResults',
              headerName: t('table.columns.averageResults'),
              width: 180,
              align: 'center',
              headerAlign: 'center',
              renderCell: (params) => (
                <Typography variant="body2" color="text.secondary">
                  {params.row.averageResults || '-'}
                </Typography>
              ),
            } as GridColDef,
          ]
        : []),
      {
        field: 'status',
        headerName: t('table.columns.status'),
        width: isMobile ? 120 : 180,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: { xs: 0.5, sm: 1 },
              flexWrap: 'wrap',
            }}
          >
            {params.row.hasResults ? (
              <>
                <CheckIcon color="success" fontSize={isMobile ? 'small' : 'medium'} />
                {!isMobile && (
                  <Typography
                    variant="body2"
                    color="success.main"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    {t('table.status.withResults')}
                  </Typography>
                )}
              </>
            ) : (
              <>
                <CancelIcon color="error" fontSize={isMobile ? 'small' : 'medium'} />
                {!isMobile && (
                  <Typography
                    variant="body2"
                    color="error.main"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    {t('table.status.noResults')}
                  </Typography>
                )}
              </>
            )}
          </Box>
        ),
      },
    ],
    [t, isMobile, terms]
  );

  const rows = useMemo(
    () =>
      terms.map((term: any, index: number) => {
        // API returns 'term' but we need 'query' for the table
        const query = term.query || term.term || '';
        return {
          id: query || `term-${index}`,
          query,
          count: term.count || 0,
          hasResults: term.hasResults !== undefined ? term.hasResults : (term.count || 0) > 0,
          averageResults: term.averageResults || 0,
        };
      }),
    [terms]
  );

  return (
    <DataTable
      columns={columns}
      rows={rows}
      loading={isLoading}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      title={t('table.title')}
      height="100%"
      getRowId={(row: any) => row.id}
    />
  );
}
