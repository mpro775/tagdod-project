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
  Alert,
  Stack,
} from '@mui/material';
import { Save, Cancel, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCreatePriceRule } from '../hooks/useMarketing';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';

const CreatePriceRulePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('marketing');
  const { isMobile } = useBreakpoint();
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
      // Error is handled by the hook with toast notification
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
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/marketing/price-rules')}
          sx={{ mb: 2 }}
          size={isMobile ? 'small' : 'medium'}
        >
          {t('form.cancel')}
        </Button>
        <Typography 
          variant="h4" 
          gutterBottom
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
        >
          {t('priceRules.createNew')}
        </Typography>
      </Box>

      {createPriceRule.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {t('messages.unknownError')}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                  {t('form.basicInfo')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.ruleTitle')}
                      value={formData.metadata.title}
                      onChange={(e) => handleNestedChange('metadata', 'title', e.target.value)}
                      required
                      size={isMobile ? 'small' : 'medium'}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.priority')}
                      type="number"
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                      required
                      size={isMobile ? 'small' : 'medium'}
                      InputProps={{
                        inputProps: { min: 1 }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.startDate')}
                      type="datetime-local"
                      value={formData.startAt}
                      onChange={(e) => handleInputChange('startAt', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      required
                      size={isMobile ? 'small' : 'medium'}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.endDate')}
                      type="datetime-local"
                      value={formData.endAt}
                      onChange={(e) => handleInputChange('endAt', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      required
                      size={isMobile ? 'small' : 'medium'}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label={t('form.ruleDescription')}
                      multiline
                      rows={3}
                      value={formData.metadata.description}
                      onChange={(e) =>
                        handleNestedChange('metadata', 'description', e.target.value)
                      }
                      size={isMobile ? 'small' : 'medium'}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.active}
                          onChange={(e) => handleInputChange('active', e.target.checked)}
                          size={isMobile ? 'small' : 'medium'}
                        />
                      }
                      label={t('form.active')}
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
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                  {t('form.conditions')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.categoryId')}
                      value={formData.conditions.categoryId}
                      onChange={(e) =>
                        handleNestedChange('conditions', 'categoryId', e.target.value)
                      }
                      size={isMobile ? 'small' : 'medium'}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.productId')}
                      value={formData.conditions.productId}
                      onChange={(e) =>
                        handleNestedChange('conditions', 'productId', e.target.value)
                      }
                      size={isMobile ? 'small' : 'medium'}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.variantId')}
                      value={formData.conditions.variantId}
                      onChange={(e) =>
                        handleNestedChange('conditions', 'variantId', e.target.value)
                      }
                      size={isMobile ? 'small' : 'medium'}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.brandId')}
                      value={formData.conditions.brandId}
                      onChange={(e) => handleNestedChange('conditions', 'brandId', e.target.value)}
                      size={isMobile ? 'small' : 'medium'}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                      <InputLabel>{t('form.currency')}</InputLabel>
                      <Select
                        value={formData.conditions.currency}
                        onChange={(e) =>
                          handleNestedChange('conditions', 'currency', e.target.value)
                        }
                        label={t('form.currency')}
                      >
                        <MenuItem value="USD">دولار أمريكي (USD)</MenuItem>
                        <MenuItem value="SAR">ريال سعودي (SAR)</MenuItem>
                        <MenuItem value="EUR">يورو (EUR)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.minQty')}
                      type="number"
                      value={formData.conditions.minQty}
                      onChange={(e) =>
                        handleNestedChange('conditions', 'minQty', parseInt(e.target.value))
                      }
                      size={isMobile ? 'small' : 'medium'}
                      InputProps={{
                        inputProps: { min: 1 }
                      }}
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
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                  {t('form.effects')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.percentOff')}
                      type="number"
                      value={formData.effects.percentOff}
                      onChange={(e) =>
                        handleNestedChange('effects', 'percentOff', parseFloat(e.target.value))
                      }
                      size={isMobile ? 'small' : 'medium'}
                      InputProps={{
                        inputProps: { min: 0, max: 100 }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.amountOff')}
                      type="number"
                      value={formData.effects.amountOff}
                      onChange={(e) =>
                        handleNestedChange('effects', 'amountOff', parseFloat(e.target.value))
                      }
                      size={isMobile ? 'small' : 'medium'}
                      InputProps={{
                        inputProps: { min: 0 }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.specialPrice')}
                      type="number"
                      value={formData.effects.specialPrice}
                      onChange={(e) =>
                        handleNestedChange('effects', 'specialPrice', parseFloat(e.target.value))
                      }
                      size={isMobile ? 'small' : 'medium'}
                      InputProps={{
                        inputProps: { min: 0 }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.badge')}
                      value={formData.effects.badge}
                      onChange={(e) => handleNestedChange('effects', 'badge', e.target.value)}
                      placeholder={t('placeholders.badge')}
                      size={isMobile ? 'small' : 'medium'}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label={t('form.giftSku')}
                      value={formData.effects.giftSku}
                      onChange={(e) => handleNestedChange('effects', 'giftSku', e.target.value)}
                      placeholder={t('placeholders.giftSku')}
                      size={isMobile ? 'small' : 'medium'}
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
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                  {t('form.usageLimits')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.maxUses')}
                      type="number"
                      value={formData.usageLimits.maxUses}
                      onChange={(e) =>
                        handleNestedChange('usageLimits', 'maxUses', parseInt(e.target.value))
                      }
                      size={isMobile ? 'small' : 'medium'}
                      InputProps={{
                        inputProps: { min: 0 }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.maxUsesPerUser')}
                      type="number"
                      value={formData.usageLimits.maxUsesPerUser}
                      onChange={(e) =>
                        handleNestedChange(
                          'usageLimits',
                          'maxUsesPerUser',
                          parseInt(e.target.value)
                        )
                      }
                      size={isMobile ? 'small' : 'medium'}
                      InputProps={{
                        inputProps: { min: 0 }
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Actions */}
          <Grid size={{ xs: 12 }}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2}
              sx={{ 
                justifyContent: 'flex-end',
                width: '100%'
              }}
            >
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => navigate('/marketing/price-rules')}
                fullWidth={isMobile}
                size={isMobile ? 'medium' : 'large'}
              >
                {t('dialogs.cancel')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={createPriceRule.isPending}
                fullWidth={isMobile}
                size={isMobile ? 'medium' : 'large'}
              >
                {createPriceRule.isPending ? t('dialogs.saving') : t('dialogs.save')}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default CreatePriceRulePage;
