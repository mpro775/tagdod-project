import React from 'react';
import { Grid, Card, CardContent, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FormInput } from '@/shared/components/Form/FormInput';

export const MerchantInfoSection: React.FC = () => {
  const { t } = useTranslation(['users', 'common']);
  const theme = useTheme();

  return (
    <Grid size={{ xs: 12 }}>
      <Card
        sx={{
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontSize: { xs: '1rem', sm: '1.25rem' },
              fontWeight: 'bold',
              color: 'text.primary',
              mb: 2,
            }}
          >
            {t('users:form.sections.merchantInfo', 'معلومات التاجر')}
          </Typography>
          <FormInput
            name="wholesaleDiscountPercent"
            label={t('users:form.fields.discountPercent', 'نسبة التخفيض للتاجر (%)')}
            type="number"
            placeholder={t('users:form.placeholders.discount', '0-100')}
            helperText={t(
              'users:form.helpers.discount',
              'النسبة المئوية للتخفيض الذي سيحصل عليه التاجر على جميع المنتجات'
            )}
          />
        </CardContent>
      </Card>
    </Grid>
  );
};

