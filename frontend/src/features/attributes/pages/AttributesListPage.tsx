import React from 'react';
import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { Edit, Delete, Restore, AddCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridColDef } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useAttributes, useDeleteAttribute, useRestoreAttribute } from '../hooks/useAttributes';
import { formatDate } from '@/shared/utils/formatters';
import type { Attribute, AttributeType } from '../types/attribute.types';

const attributeTypeLabels: Record<AttributeType, string> = {
  select: 'اختيار واحد',
  multiselect: 'اختيار متعدد',
  text: 'نص',
  number: 'رقم',
  boolean: 'نعم/لا',
};

const attributeTypeColors: Record<AttributeType, 'primary' | 'secondary' | 'info' | 'warning' | 'success'> = {
  select: 'primary',
  multiselect: 'secondary',
  text: 'info',
  number: 'warning',
  boolean: 'success',
};

export const AttributesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: attributes = [], isLoading, refetch } = useAttributes({});
  const { mutate: deleteAttribute } = useDeleteAttribute();
  const { mutate: restoreAttribute } = useRestoreAttribute();

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'السمة',
      width: 250,
      renderCell: (params) => (
        <Box>
          <Box sx={{ fontWeight: 'medium' }}>{params.row.name}</Box>
          <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            {params.row.nameEn}
          </Box>
        </Box>
      ),
    },
    {
      field: 'type',
      headerName: 'النوع',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={attributeTypeLabels[params.row.type as AttributeType]}
          color={attributeTypeColors[params.row.type as AttributeType]}
          size="small"
        />
      ),
    },
    {
      field: 'usageCount',
      headerName: 'الاستخدام',
      width: 100,
      align: 'center',
    },
    {
      field: 'isFilterable',
      headerName: 'قابل للفلترة',
      width: 120,
      renderCell: (params) =>
        params.row.isFilterable ? (
          <Chip label="نعم" color="success" size="small" />
        ) : (
          <Chip label="لا" color="default" size="small" />
        ),
    },
    {
      field: 'isRequired',
      headerName: 'إلزامي',
      width: 100,
      renderCell: (params) =>
        params.row.isRequired ? (
          <Chip label="نعم" color="error" size="small" />
        ) : null,
    },
    {
      field: 'isActive',
      headerName: 'الحالة',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.row.isActive ? 'نشط' : 'غير نشط'}
          color={params.row.isActive ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'تاريخ الإنشاء',
      width: 140,
      valueFormatter: (value) => formatDate(value as Date),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const attr = params.row as Attribute;
        const isDeleted = !!attr.deletedAt;

        if (isDeleted) {
          return (
            <Tooltip title="استعادة">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  restoreAttribute(attr._id, { onSuccess: () => refetch() });
                }}
              >
                <Restore fontSize="small" />
              </IconButton>
            </Tooltip>
          );
        }

        return (
          <Box display="flex" gap={0.5}>
            <Tooltip title="تعديل">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/attributes/${attr._id}`);
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="إدارة القيم">
              <IconButton
                size="small"
                color="info"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/attributes/${attr._id}/values`);
                }}
              >
                <AddCircle fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="حذف">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`هل تريد حذف السمة "${attr.name}"؟`)) {
                    deleteAttribute(attr._id, { onSuccess: () => refetch() });
                  }
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      <DataTable
        title="إدارة السمات"
        columns={columns}
        rows={attributes}
        loading={isLoading}
        paginationModel={{ page: 0, pageSize: 20 }}
        onPaginationModelChange={() => {}}
        rowCount={attributes.length}
        onAdd={() => navigate('/attributes/new')}
        addButtonText="إضافة سمة"
        onRowClick={(params) => {
          const row = params.row as Attribute;
          navigate(`/attributes/${row._id}`);
        }}
        height="calc(100vh - 200px)"
      />
    </Box>
  );
};

