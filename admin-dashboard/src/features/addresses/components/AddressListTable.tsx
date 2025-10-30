import { useState } from 'react';
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Typography,
  Box,
  TextField,
  MenuItem,
  Button,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAddressList } from '../hooks/useAddresses';
import type { AddressFilters } from '../types/address.types';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export function AddressListTable() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<AddressFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data, isLoading, refetch } = useAddressList(filters);
  const rows = Array.isArray(data)
    ? data
    : Array.isArray((data as any)?.data)
    ? (data as any).data
    : [];

  const handleChangePage = (_: unknown, newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage + 1 }));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, limit: parseInt(event.target.value, 10), page: 1 }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: event.target.value, page: 1 }));
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder={t('addresses.list.search.placeholder', { defaultValue: 'ابحث عن عنوان...' })}
            size="small"
            sx={{ minWidth: 250 }}
            value={filters.search || ''}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            size="small"
            label={t('addresses.list.filters.city.label', { defaultValue: 'المدينة' })}
            sx={{ minWidth: 150 }}
            value={filters.city || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value, page: 1 }))}
          >
            <MenuItem value="">{t('addresses.list.filters.city.all', { defaultValue: 'جميع المدن' })}</MenuItem>
            <MenuItem value="صنعاء">{t('addresses.list.filters.city.sanaa', { defaultValue: 'صنعاء' })}</MenuItem>
            <MenuItem value="عدن">{t('addresses.list.filters.city.aden', { defaultValue: 'عدن' })}</MenuItem>
            <MenuItem value="تعز">{t('addresses.list.filters.city.taiz', { defaultValue: 'تعز' })}</MenuItem>
            <MenuItem value="الحديدة">{t('addresses.list.filters.city.alHudaydah', { defaultValue: 'الحديدة' })}</MenuItem>
            <MenuItem value="إب">{t('addresses.list.filters.city.ibb', { defaultValue: 'إب' })}</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            label={t('addresses.list.filters.sortBy.label', { defaultValue: 'ترتيب العناوين' })}
            sx={{ minWidth: 150 }}
            value={filters.sortBy || 'createdAt'}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                sortBy: e.target.value as AddressFilters['sortBy'],
                page: 1,
              }))
            }
          >
            <MenuItem value="createdAt">{t('addresses.list.filters.sortBy.createdAt', { defaultValue: 'تاريخ الإنشاء' })}</MenuItem>
            <MenuItem value="usageCount">{t('addresses.list.filters.sortBy.usageCount', { defaultValue: 'عدد الاستخدامات' })}</MenuItem>
            <MenuItem value="lastUsedAt">{t('addresses.list.filters.sortBy.lastUsedAt', { defaultValue: 'تاريخ الإستخدام الأخير' })}</MenuItem>
          </TextField>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            size="small"
          >
            {t('addresses.actions.refresh', { defaultValue: 'تحديث' })}
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('addresses.list.columns.user', { defaultValue: 'المستخدم' })}</TableCell>
                <TableCell>{t('addresses.list.columns.label', { defaultValue: 'التسمية' })}</TableCell>
                <TableCell>{t('addresses.list.columns.address', { defaultValue: 'العنوان' })}</TableCell>
                <TableCell>{t('addresses.list.columns.city', { defaultValue: 'المدينة' })}</TableCell>
                <TableCell align="center">{t('addresses.list.columns.usage', { defaultValue: 'الاستخدام' })}</TableCell>
                <TableCell align="center">{t('addresses.list.columns.status', { defaultValue: 'الحالة' })}</TableCell>
                <TableCell>{t('addresses.list.columns.createdAt', { defaultValue: 'تاريخ الإنشاء' })}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    {t('addresses.list.loading', { defaultValue: 'جاري التحميل...' })}
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">{t('addresses.list.noResults', { defaultValue: 'لا يوجد نتائج' })}</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((address: any) => (
                  <TableRow key={address._id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {address.userId.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {address.userId.phone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {address.label}
                        {address.isDefault && (
                          <Chip label={t('addresses.list.status.default', { defaultValue: 'افتراضي' })} size="small" color="primary" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{address.line1}</Typography>
                      {address.notes && (
                        <Typography variant="caption" color="text.secondary">
                          {t('addresses.list.address.notes', { defaultValue: 'ملاحظات', notes: address.notes })}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{address.city}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={t('addresses.list.usage.times', { defaultValue: 'مرات الاستخدام', count: address.usageCount })}
                        size="small"
                        variant="outlined"
                        color={address.usageCount > 5 ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={address.isActive ? t('addresses.list.status.active', { defaultValue: 'نشط' }) : t('addresses.list.status.inactive', { defaultValue: 'غير نشط' })}
                        size="small"
                        color={address.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(address.createdAt), 'dd MMM yyyy', { locale: ar })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {data && (
          <TablePagination
            component="div"
            count={
              (data as any)?.pagination?.total ??
              (Array.isArray((data as any)?.data) ? (data as any).data.length : Array.isArray(data) ? data.length : 0)
            }
            page={filters.page! - 1}
            onPageChange={handleChangePage}
            rowsPerPage={filters.limit!}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={t('addresses.pagination.rowsPerPage', { defaultValue: 'عدد العناوين في الصفحة' })}
            labelDisplayedRows={({ from, to, count }) => t('addresses.pagination.displayedRows', { defaultValue: 'عرض العناوين', from, to, count })}
          />
        )}
      </CardContent>
    </Card>
  );
}

