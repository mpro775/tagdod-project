import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCreatePriceRule } from '../hooks/useMarketing';

const CreatePriceRulePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('marketing');
  const createPriceRule = useCreatePriceRule();

  const [formData, setFormData] = useState({
    active: true,
    priority: 1,
    startAt: '',
    endAt: '',
    conditions: {
      categoryId: '',
      productId: '',
      variantId: '',
      brandId: '',
      currency: 'USD',
      minQty: 1,
      accountType: '',
    },
    effects: {
      percentOff: 0,
      amountOff: 0,
      specialPrice: 0,
      badge: '',
      giftSku: '',
    },
    usageLimits: {
      maxUses: 0,
      maxUsesPerUser: 0,
      currentUses: 0,
    },
    metadata: {
      title: '',
      description: '',
      termsAndConditions: '',
    },
    couponCode: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPriceRule.mutateAsync(formData);
      navigate('/marketing/price-rules');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating price rule:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as Record<string, any>),
        [field]: value,
      },
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('dialogs.createTitle', { defaultValue: 'إنشاء قاعدة الأسعار' })}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('form.basicInfo', { defaultValue: 'المعلومات الأساسية' })}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.basicInfo.title', { defaultValue: 'العنوان' })}
                      value={formData.metadata.title}
                      onChange={(e) => handleNestedChange('metadata', 'title', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.basicInfo.priority', { defaultValue: 'الأولوية' })}
                      type="number"
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.basicInfo.startAt', { defaultValue: 'تاريخ البداية' })}
                      type="datetime-local"
                      value={formData.startAt}
                      onChange={(e) => handleInputChange('startAt', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.basicInfo.endAt', { defaultValue: 'تاريخ النهاية' })}
                      type="datetime-local"
                      value={formData.endAt}
                      onChange={(e) => handleInputChange('endAt', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label={t('form.basicInfo.description', { defaultValue: 'الوصف' })}
                      multiline
                      rows={3}
                      value={formData.metadata.description}
                      onChange={(e) =>
                        handleNestedChange('metadata', 'description', e.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.active}
                          onChange={(e) => handleInputChange('active', e.target.checked)}
                        />
                      }
                      label={t('form.basicInfo.active', { defaultValue: 'نشط' })}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Conditions */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('form.conditions', { defaultValue: 'الشروط' })}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.conditions.categoryId', { defaultValue: 'معرف الفئة' })}
                      value={formData.conditions.categoryId}
                      onChange={(e) =>
                        handleNestedChange('conditions', 'categoryId', e.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.conditions.productId', { defaultValue: 'معرف المنتج' })}
                      value={formData.conditions.productId}
                      onChange={(e) =>
                        handleNestedChange('conditions', 'productId', e.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                          label={t('form.conditions.variantId', { defaultValue: 'معرف المتغير' })}
                      value={formData.conditions.variantId}
                      onChange={(e) =>
                        handleNestedChange('conditions', 'variantId', e.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.conditions.brandId', { defaultValue: 'معرف الماركة' })}
                      value={formData.conditions.brandId}
                      onChange={(e) => handleNestedChange('conditions', 'brandId', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>{t('form.conditions.currency', { defaultValue: 'العملة' })}</InputLabel>
                      <Select
                        value={formData.conditions.currency}
                        onChange={(e) =>
                          handleNestedChange('conditions', 'currency', e.target.value)
                        }
                        label={t('form.conditions.currency', { defaultValue: 'العملة' })}
                      >
                        <MenuItem value="USD">دولار أمريكي (USD)</MenuItem>
                        <MenuItem value="SAR">ريال سعودي (SAR)</MenuItem>
                        <MenuItem value="EUR">يورو</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.conditions.minQty', { defaultValue: 'الحد الأدنى للكمية' })}
                      type="number"
                      value={formData.conditions.minQty}
                      onChange={(e) =>
                        handleNestedChange('conditions', 'minQty', parseInt(e.target.value))
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Effects */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('form.effects', { defaultValue: 'التأثيرات' })}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.effects.percentOff', { defaultValue: 'نسبة الخصم (%)' })}
                      type="number"
                      value={formData.effects.percentOff}
                      onChange={(e) =>
                        handleNestedChange('effects', 'percentOff', parseFloat(e.target.value))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.effects.amountOff', { defaultValue: 'مبلغ الخصم' })}
                      type="number"
                      value={formData.effects.amountOff}
                      onChange={(e) =>
                        handleNestedChange('effects', 'amountOff', parseFloat(e.target.value))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.effects.specialPrice', { defaultValue: 'السعر الخاص' })}
                      type="number"
                      value={formData.effects.specialPrice}
                      onChange={(e) =>
                        handleNestedChange('effects', 'specialPrice', parseFloat(e.target.value))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.effects.badge', { defaultValue: 'الشارة' })}
                      value={formData.effects.badge}
                      onChange={(e) => handleNestedChange('effects', 'badge', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label={t('form.effects.giftSku', { defaultValue: 'رمز المنتج المجاني' })}
                      value={formData.effects.giftSku}
                      onChange={(e) => handleNestedChange('effects', 'giftSku', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Usage Limits */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('form.usageLimits', { defaultValue: 'حدود الاستخدام' })}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                        label={t('form.usageLimits.maxUses', { defaultValue: 'الحد الأقصى للاستخدام' })}
                      type="number"
                      value={formData.usageLimits.maxUses}
                      onChange={(e) =>
                        handleNestedChange('usageLimits', 'maxUses', parseInt(e.target.value))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.usageLimits.maxUsesPerUser', { defaultValue: 'الحد الأقصى لكل مستخدم' })}
                      type="number"
                      value={formData.usageLimits.maxUsesPerUser}
                      onChange={(e) =>
                        handleNestedChange(
                          'usageLimits',
                          'maxUsesPerUser',
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Actions */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => navigate('/marketing/price-rules')}
              >
                {t('form.actions.cancel', { defaultValue: 'إلغاء' })}
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={createPriceRule.isPending}
              >
                {createPriceRule.isPending ? t('form.actions.saving', { defaultValue: 'جاري الحفظ...' }) : t('form.actions.save', { defaultValue: 'حفظ' })}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default CreatePriceRulePage;
