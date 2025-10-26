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
import { useAddressList } from '../hooks/useAddresses';
import type { AddressFilters } from '../types/address.types';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export function AddressListTable() {
  const [filters, setFilters] = useState<AddressFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data, isLoading, refetch } = useAddressList(filters);

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
            placeholder="بحث..."
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
            label="المدينة"
            sx={{ minWidth: 150 }}
            value={filters.city || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value, page: 1 }))}
          >
            <MenuItem value="">الكل</MenuItem>
            <MenuItem value="صنعاء">صنعاء</MenuItem>
            <MenuItem value="عدن">عدن</MenuItem>
            <MenuItem value="تعز">تعز</MenuItem>
            <MenuItem value="الحديدة">الحديدة</MenuItem>
            <MenuItem value="إب">إب</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            label="الترتيب حسب"
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
            <MenuItem value="createdAt">تاريخ الإنشاء</MenuItem>
            <MenuItem value="usageCount">عدد الاستخدام</MenuItem>
            <MenuItem value="lastUsedAt">آخر استخدام</MenuItem>
          </TextField>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            size="small"
          >
            تحديث
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>المستخدم</TableCell>
                <TableCell>التسمية</TableCell>
                <TableCell>العنوان</TableCell>
                <TableCell>المدينة</TableCell>
                <TableCell align="center">الاستخدام</TableCell>
                <TableCell align="center">الحالة</TableCell>
                <TableCell>تاريخ الإنشاء</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : !data || data.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">لا توجد نتائج</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((address) => (
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
                          <Chip label="⭐ افتراضي" size="small" color="primary" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{address.line1}</Typography>
                      {address.notes && (
                        <Typography variant="caption" color="text.secondary">
                          📝 {address.notes}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{address.city}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${address.usageCount} مرة`}
                        size="small"
                        variant="outlined"
                        color={address.usageCount > 5 ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={address.isActive ? 'نشط' : 'غير نشط'}
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
            count={data.pagination.total}
            page={filters.page! - 1}
            onPageChange={handleChangePage}
            rowsPerPage={filters.limit!}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="عدد الصفوف:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} من ${count}`}
          />
        )}
      </CardContent>
    </Card>
  );
}

