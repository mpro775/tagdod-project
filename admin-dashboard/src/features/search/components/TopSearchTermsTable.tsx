import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Box,
} from '@mui/material';
import { CheckCircle as CheckIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useTopSearchTerms } from '../hooks/useSearch';

export function TopSearchTermsTable() {
  const { data: terms, isLoading } = useTopSearchTerms({ limit: 50 });

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          📈 الكلمات المفتاحية الأكثر بحثاً
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>الكلمة المفتاحية</TableCell>
                <TableCell align="center">عدد المرات</TableCell>
                <TableCell align="center">متوسط النتائج</TableCell>
                <TableCell align="center">الحالة</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : !terms || terms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">لا توجد بيانات</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                terms.map((term, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {term.query}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={term.count} color="primary" size="small" />
                    </TableCell>
                    <TableCell align="center">
                      {term.averageResults}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                        {term.hasResults ? (
                          <>
                            <CheckIcon color="success" fontSize="small" />
                            <Typography variant="body2" color="success.main">
                              نتائج
                            </Typography>
                          </>
                        ) : (
                          <>
                            <CancelIcon color="error" fontSize="small" />
                            <Typography variant="body2" color="error.main">
                              بدون نتائج
                            </Typography>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

