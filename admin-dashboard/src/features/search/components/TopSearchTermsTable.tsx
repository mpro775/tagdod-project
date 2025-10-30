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
import { useTranslation } from 'react-i18next';
import { useTopSearchTerms } from '../hooks/useSearch';

export function TopSearchTermsTable() {
  const { t } = useTranslation();
  const { data: termsResponse, isLoading } = useTopSearchTerms({ limit: 50 });
  const terms = Array.isArray(termsResponse)
    ? termsResponse
    : Array.isArray((termsResponse as any)?.data)
    ? (termsResponse as any).data
    : [];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          {t('search.table.title', { defaultValue: 'أكثر المصطلحات المبحث عنها' })}
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('search.table.columns.rank', { defaultValue: 'الترتيب' })}</TableCell>
                <TableCell>{t('search.table.columns.keyword', { defaultValue: 'المصطلح' })}</TableCell>
                <TableCell align="center">{t('search.table.columns.count', { defaultValue: 'عدد المرات' })}</TableCell>
                <TableCell align="center">{t('search.table.columns.averageResults', { defaultValue: 'متوسط النتائج' })}</TableCell>
                <TableCell align="center">{t('search.table.columns.status', { defaultValue: 'الحالة' })}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {t('search.table.loading', { defaultValue: 'جاري التحميل...' })}
                  </TableCell>
                </TableRow>
              ) : !terms || terms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">{t('search.table.noData', { defaultValue: 'لا يوجد بيانات' })}</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                terms.map((term: any, index: number) => (
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
                              {t('search.table.status.withResults', { defaultValue: 'بدون نتائج' })}
                            </Typography>
                          </>
                        ) : (
                          <>
                            <CancelIcon color="error" fontSize="small" />
                            <Typography variant="body2" color="error.main">
                              {t('search.table.status.noResults', { defaultValue: 'بدون نتائج' })}
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

