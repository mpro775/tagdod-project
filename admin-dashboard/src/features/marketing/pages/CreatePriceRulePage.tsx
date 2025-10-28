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
import { useCreatePriceRule } from '../hooks/useMarketing';

const CreatePriceRulePage: React.FC = () => {
  const navigate = useNavigate();
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
      currency: 'SAR',
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
        إنشاء قاعدة سعر جديدة
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  المعلومات الأساسية
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="العنوان"
                      value={formData.metadata.title}
                      onChange={(e) => handleNestedChange('metadata', 'title', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="الأولوية"
                      type="number"
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="تاريخ البداية"
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
                      label="تاريخ النهاية"
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
                      label="الوصف"
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
                      label="نشط"
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
                  الشروط
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="معرف الفئة"
                      value={formData.conditions.categoryId}
                      onChange={(e) =>
                        handleNestedChange('conditions', 'categoryId', e.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="معرف المنتج"
                      value={formData.conditions.productId}
                      onChange={(e) =>
                        handleNestedChange('conditions', 'productId', e.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="معرف المتغير"
                      value={formData.conditions.variantId}
                      onChange={(e) =>
                        handleNestedChange('conditions', 'variantId', e.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="معرف الماركة"
                      value={formData.conditions.brandId}
                      onChange={(e) => handleNestedChange('conditions', 'brandId', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>العملة</InputLabel>
                      <Select
                        value={formData.conditions.currency}
                        onChange={(e) =>
                          handleNestedChange('conditions', 'currency', e.target.value)
                        }
                        label="العملة"
                      >
                        <MenuItem value="SAR">ريال سعودي</MenuItem>
                        <MenuItem value="USD">دولار أمريكي</MenuItem>
                        <MenuItem value="EUR">يورو</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="الحد الأدنى للكمية"
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
                  التأثيرات
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="نسبة الخصم (%)"
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
                      label="مبلغ الخصم"
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
                      label="السعر الخاص"
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
                      label="الشارة"
                      value={formData.effects.badge}
                      onChange={(e) => handleNestedChange('effects', 'badge', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="رمز المنتج المجاني"
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
                  حدود الاستخدام
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="الحد الأقصى للاستخدام"
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
                      label="الحد الأقصى لكل مستخدم"
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
                إلغاء
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={createPriceRule.isPending}
              >
                {createPriceRule.isPending ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default CreatePriceRulePage;
