import React from 'react';
import { Box, Skeleton } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { Empty, Error } from '@/components/State';

export interface ResponsiveListWrapperProps<T> {
  // Data
  data: T[];
  loading?: boolean;
  error?: any;
  
  // Grid configuration
  columns: GridColDef[];
  // eslint-disable-next-line no-unused-vars
  getRowId?: (row: T) => string | number;
  
  // Card component
  CardComponent: React.ComponentType<any>;
  
  // Actions
  // eslint-disable-next-line no-unused-vars
  onEdit?: (item: T) => void;
  // eslint-disable-next-line no-unused-vars
  onDelete?: (item: T) => void;
  // eslint-disable-next-line no-unused-vars
  onView?: (item: T) => void;
  // eslint-disable-next-line no-unused-vars
  onToggleStatus?: (item: T) => void;
  // eslint-disable-next-line no-unused-vars
  onUpdateStatus?: (item: T) => void;
  showActions?: boolean;
  
  // Pagination
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  
  // Breakpoint configuration
  cardBreakpoint?: 'xs' | 'sm' | 'md';
  
  // Custom messages
  emptyMessage?: string;
  emptyDescription?: string;
  errorMessage?: string;
  
  // Grid props
  gridProps?: any;
  
  // Card container props
  cardContainerProps?: any;
}

export function ResponsiveListWrapper<T extends Record<string, any>>({
  data,
  loading = false,
  error,
  columns,
  getRowId,
  CardComponent,
  onEdit,
  onDelete,
  onView,
  onToggleStatus,
  onUpdateStatus,
  showActions = true,
  pagination = true,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  cardBreakpoint = 'sm',
  emptyMessage = 'لا توجد بيانات',
  emptyDescription = 'لم يتم العثور على أي عناصر في هذه القائمة',
  errorMessage = 'حدث خطأ أثناء تحميل البيانات',
  gridProps = {},
  cardContainerProps = {},
}: ResponsiveListWrapperProps<T>) {
  const { isMobile, current } = useBreakpoint();
  
  // Determine if we should use card layout
  const useCardLayout = (() => {
    switch (cardBreakpoint) {
      case 'xs':
        return current === 'xs';
      case 'sm':
        return current === 'xs' || current === 'sm';
      case 'md':
        return current === 'xs' || current === 'sm' || current === 'md';
      default:
        return isMobile;
    }
  })();

  // Loading state
  if (loading) {
    if (useCardLayout) {
      return (
        <Box {...cardContainerProps}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Box key={index} sx={{ mb: 2, p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="circular" width={56} height={56} sx={{ mr: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={20} />
                </Box>
              </Box>
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="80%" height={20} />
              <Skeleton variant="text" width="60%" height={20} />
            </Box>
          ))}
        </Box>
      );
    }
    
    return (
      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={[]}
          columns={columns}
          loading={true}
          disableRowSelectionOnClick
          {...gridProps}
        />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Error
        message={errorMessage}
        error={error}
        showDetails={false}
      />
    );
  }

  // Empty state
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Empty
        message={emptyMessage}
        description={emptyDescription}
      />
    );
  }

  // Card layout
  if (useCardLayout) {
    return (
      <Box {...cardContainerProps}>
        {data.map((item, index) => {
          const itemKey = getRowId ? getRowId(item) : index;
          
          // Create props object based on the item type
          const cardProps: any = {
            onEdit,
            onDelete,
            onView,
            onToggleStatus,
            onUpdateStatus,
            showActions,
          };

          // Try to determine the item type and add appropriate prop
          if ('phone' in item) {
            cardProps.user = item;
          } else if ('sku' in item || 'name' in item) {
            cardProps.product = item;
          } else if ('orderNumber' in item) {
            cardProps.order = item;
          } else {
            // Fallback: add all possible props
            cardProps.user = item;
            cardProps.product = item;
            cardProps.order = item;
          }

          return <CardComponent key={itemKey} {...cardProps} />;
        })}
      </Box>
    );
  }

  // Grid layout
  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={data}
        columns={columns}
        getRowId={getRowId}
        disableRowSelectionOnClick
        pagination={pagination}
        pageSizeOptions={pageSizeOptions}
        initialState={{
          pagination: {
            paginationModel: { pageSize },
          },
        }}
        {...gridProps}
      />
    </Box>
  );
}

export default ResponsiveListWrapper;
