import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  CircularProgress,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  CardHeader,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Save, Cancel, ArrowBack, ArrowForward, Info, Settings, Warning, CheckCircle, Refresh } from '@mui/icons-material';
import { FormInput } from '@/shared/components/Form/FormInput';
import { FormSelect } from '@/shared/components/Form/FormSelect';
import { useAttribute, useCreateAttribute, useUpdateAttribute } from '../hooks/useAttributes';
import { AttributeType } from '../types/attribute.types';
import type { CreateAttributeDto, AttributeFormData } from '../types/attribute.types';

const createAttributeSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(2, t('validation.nameRequired')),
  nameEn: z.string().min(2, t('validation.nameEnRequired')),
  type: z.nativeEnum(AttributeType),
  description: z.string().optional(),
  order: z.coerce.number().optional(),
  isActive: z.boolean().optional(), // للعرض في UI فقط، لا يرسل في create
  isFilterable: z.boolean().optional(),
  isRequired: z.boolean().optional(),
  showInFilters: z.boolean().optional(),
  groupId: z.string().nullable().optional(),
});

const createSteps = (t: (key: string) => string) => [
  t('form.basicInfo'),
  t('form.settings'),
  t('form.review')
];

export const AttributeFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('attributes');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down(400));
  const isEditMode = id !== 'new' && !!id;
  const [activeStep, setActiveStep] = React.useState(0);
  
  // تحديد اتجاه السهم حسب اللغة: العربية = ArrowForward، الإنجليزية = ArrowBack
  const PreviousIcon = i18n.language === 'ar' ? ArrowForward : ArrowBack;

  const attributeSchema = createAttributeSchema(t);
  type AttributeSchemaType = z.infer<typeof attributeSchema>;
  const steps = createSteps(t);

  const methods = useForm<AttributeSchemaType>({
    resolver: zodResolver(attributeSchema) as any,
    defaultValues: {
      name: '',
      nameEn: '',
      type: AttributeType.TEXT,
      isActive: true,
      isFilterable: true,
      isRequired: false,
      showInFilters: true,
      order: 0,
    },
  });

  const { data: attribute, isLoading } = useAttribute(id!);
  const { mutate: createAttribute, isPending: isCreating } = useCreateAttribute();
  const { mutate: updateAttribute, isPending: isUpdating } = useUpdateAttribute();

  useEffect(() => {
    if (isEditMode && attribute) {
      methods.reset(attribute as AttributeFormData);
    }
  }, [attribute, isEditMode, methods]);

  const onSubmit = (data: any) => {
    // CreateAttributeDto في Backend لا يحتوي على isActive
    const attrData: Omit<CreateAttributeDto, 'isActive'> = {
      name: data.name,
      nameEn: data.nameEn,
      type: data.type,
      description: data.description,
      order: data.order,
      isFilterable: data.isFilterable,
      isRequired: data.isRequired,
      showInFilters: data.showInFilters,
      groupId: data.groupId,
    };

    if (isEditMode) {
      // UpdateAttributeDto يحتوي على isActive
      const updateData = { ...attrData, isActive: data.isActive };
      updateAttribute({ id: id!, data: updateData }, { 
        onSuccess: () => navigate('/attributes')
      });
    } else {
      createAttribute(attrData as any, { 
        onSuccess: () => navigate('/attributes')
      });
    }
  };

  const handleNext = async () => {
    // التحقق من صحة الحقول في الخطوة الحالية قبل الانتقال
    const fieldsToValidate = getFieldsForStep(activeStep);
    const isValid = await methods.trigger(fieldsToValidate);
    
    if (isValid) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const getFieldsForStep = (step: number): (keyof AttributeSchemaType)[] => {
    switch (step) {
      case 0:
        return ['name', 'nameEn', 'type'];
      case 1:
        return ['isActive', 'isFilterable', 'isRequired', 'showInFilters'];
      default:
        return [];
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    methods.reset();
  };

  if (isEditMode && isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid size={{ xs: 12 }}>
              <Alert severity="info" icon={<Info />} sx={{ mb: { xs: 2, sm: 3 } }}>
                {t('form.basicInfoDesc')}
              </Alert>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormInput name="name" label={t('form.attributeNameAr')} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormInput name="nameEn" label={t('form.attributeNameEn')} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormSelect
                name="type"
                label={t('form.attributeType')}
                options={[
                  { value: AttributeType.TEXT, label: t('types.text') },
                  { value: AttributeType.COLOR, label: t('types.color') },
                ]}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormInput name="order" label={t('fields.order')} type="number" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormInput name="description" label={t('fields.description')} multiline rows={3} />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid size={{ xs: 12 }}>
              <Alert severity="warning" icon={<Settings />} sx={{ mb: { xs: 2, sm: 3 } }}>
                {t('form.settingsDesc')}
              </Alert>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardHeader title={t('form.displaySettings')} />
                <CardContent>
                  <Stack spacing={2}>
                    <Controller
                      name="isActive"
                      control={methods.control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={field.value ?? true}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          }
                          label={t('form.isActive')}
                        />
                      )}
                    />
                    <Controller
                      name="isFilterable"
                      control={methods.control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={field.value ?? true}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          }
                          label={t('form.isFilterable')}
                        />
                      )}
                    />
                    <Controller
                      name="isRequired"
                      control={methods.control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={field.value ?? false}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          }
                          label={t('form.isRequired')}
                        />
                      )}
                    />
                    <Controller
                      name="showInFilters"
                      control={methods.control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={field.value ?? true}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          }
                          label={t('form.showInFilters')}
                        />
                      )}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
      case 2:
        const watchedValues = methods.watch();
        const errors = methods.formState.errors;
        const hasErrors = Object.keys(errors).length > 0;
        return (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid size={{ xs: 12 }}>
              {hasErrors ? (
                <Alert severity="error" icon={<Warning />} sx={{ mb: { xs: 2, sm: 3 } }}>
                  {t('form.reviewError')}
                </Alert>
              ) : (
                <Alert severity="success" icon={<CheckCircle />} sx={{ mb: { xs: 2, sm: 3 } }}>
                  {t('form.reviewSuccess')}
                </Alert>
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardHeader title={t('form.basicInfo')} />
                <CardContent>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {t('form.attributeNameAr').replace(' *', '')}:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {watchedValues.name}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {t('form.attributeNameEn').replace(' *', '')}:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {watchedValues.nameEn}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {t('fields.type')}:
                      </Typography>
                      <Chip label={watchedValues.type} color="primary" size="small" />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {t('fields.order')}:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {watchedValues.order}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardHeader title={t('form.settings')} />
                <CardContent>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {watchedValues.isActive ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Warning color="warning" />
                      )}
                      <Typography variant="body2">{t('status.active')}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {watchedValues.isFilterable ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Warning color="warning" />
                      )}
                      <Typography variant="body2">{t('fields.filterable')}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {watchedValues.isRequired ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Warning color="warning" />
                      )}
                      <Typography variant="body2">{t('fields.required')}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {watchedValues.showInFilters ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Warning color="warning" />
                      )}
                      <Typography variant="body2">{t('form.showInFilters').split(' - ')[0]}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
      default:
        return t('common.error');
    }
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, py: { xs: 2, sm: 3 }, pb: { xs: 4, sm: 3 } }}>
      {/* Header - Responsive */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: { xs: 2, sm: 3, md: 4 }, gap: 1 }}>
        <IconButton 
          onClick={() => navigate('/attributes')} 
          sx={{ 
            mr: { xs: 0, sm: 2 },
            flexShrink: 0,
          }}
        >
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="h4" 
            fontWeight="bold"
            sx={{ 
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
              mb: { xs: 0.5, sm: 1 },
            }}
          >
            {isEditMode ? t('attributes.editAttribute') : t('attributes.createAttribute')}
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              display: { xs: 'none', sm: 'block' },
            }}
          >
            {isEditMode ? 'تعديل معلومات السمة الموجودة' : 'إنشاء سمة جديدة للمنتجات'}
          </Typography>
        </Box>
      </Box>

      {/* Stepper - Responsive */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 }, overflowX: 'auto' }}>
        <Stepper 
          activeStep={activeStep} 
          alternativeLabel={false}
          orientation="horizontal"
          sx={{
            '& .MuiStepLabel-root': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            },
            '& .MuiStepLabel-label': {
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
            },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Form Content */}
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>{renderStepContent(activeStep)}</Paper>

          {/* Navigation Buttons - Responsive */}
          <Paper sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1.5, sm: 2 }}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              {/* Previous Button */}
              <Tooltip title={t('form.previous')} arrow placement="top">
                <span>
                  <Button
                    type="button"
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    startIcon={<PreviousIcon />}
                    fullWidth={isMobile}
                    size={isMobile ? 'small' : 'medium'}
                    sx={{
                      minWidth: isSmallMobile ? 'auto' : { xs: '120px', sm: 'auto' },
                      '& .MuiButton-startIcon': {
                        marginLeft: isSmallMobile ? 0 : undefined,
                        marginRight: isSmallMobile ? 0 : undefined,
                      },
                    }}
                  >
                    {!isSmallMobile && t('form.previous')}
                  </Button>
                </span>
              </Tooltip>

              {/* Action Buttons Group */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1, sm: 1.5 }}
                sx={{ 
                  width: { xs: '100%', sm: 'auto' },
                  '& > *': {
                    width: { xs: '100%', sm: 'auto' },
                  },
                }}
              >
                {/* Cancel Button */}
                <Tooltip title={t('form.cancel')} arrow placement="top">
                  <span>
                    <Button
                      type="button"
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={() => navigate('/attributes')}
                      fullWidth={isMobile}
                      size={isMobile ? 'small' : 'medium'}
                      sx={{
                        minWidth: isSmallMobile ? 'auto' : { xs: '100px', sm: 'auto' },
                        '& .MuiButton-startIcon': {
                          marginLeft: isSmallMobile ? 0 : undefined,
                          marginRight: isSmallMobile ? 0 : undefined,
                        },
                      }}
                    >
                      {!isSmallMobile && t('form.cancel')}
                    </Button>
                  </span>
                </Tooltip>

                {/* Reset Button */}
                <Tooltip title={t('form.reset')} arrow placement="top">
                  <span>
                    <Button
                      type="button"
                      variant="outlined"
                      color="secondary"
                      onClick={handleReset}
                      startIcon={<Refresh />}
                      fullWidth={isMobile}
                      size={isMobile ? 'small' : 'medium'}
                      sx={{
                        minWidth: isSmallMobile ? 'auto' : { xs: '100px', sm: 'auto' },
                        '& .MuiButton-startIcon': {
                          marginLeft: isSmallMobile ? 0 : undefined,
                          marginRight: isSmallMobile ? 0 : undefined,
                        },
                      }}
                    >
                      {!isSmallMobile && t('form.reset')}
                    </Button>
                  </span>
                </Tooltip>

                {/* Submit/Next Button */}
                {activeStep === steps.length - 1 ? (
                  <Tooltip title={isEditMode ? t('form.update') : t('form.create')} arrow placement="top">
                    <span>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={isCreating || isUpdating ? <CircularProgress size={isMobile ? 16 : 20} /> : <Save />}
                        disabled={isCreating || isUpdating}
                        fullWidth={isMobile}
                        size={isMobile ? 'small' : 'medium'}
                        sx={{
                          minWidth: isSmallMobile ? 'auto' : { xs: '140px', sm: 'auto' },
                          '& .MuiButton-startIcon': {
                            marginLeft: isSmallMobile ? 0 : undefined,
                            marginRight: isSmallMobile ? 0 : undefined,
                          },
                        }}
                      >
                        {!isSmallMobile && (isEditMode ? t('form.update') : t('form.create'))}
                      </Button>
                    </span>
                  </Tooltip>
                ) : (
                  <Tooltip title={t('form.next')} arrow placement="top">
                    <span>
                      <Button
                        type="button"
                        variant="contained"
                        onClick={handleNext}
                        startIcon={<CheckCircle />}
                        fullWidth={isMobile}
                        size={isMobile ? 'small' : 'medium'}
                        sx={{
                          minWidth: isSmallMobile ? 'auto' : { xs: '100px', sm: 'auto' },
                          '& .MuiButton-startIcon': {
                            marginLeft: isSmallMobile ? 0 : undefined,
                            marginRight: isSmallMobile ? 0 : undefined,
                          },
                        }}
                      >
                        {!isSmallMobile && t('form.next')}
                      </Button>
                    </span>
                  </Tooltip>
                )}
              </Stack>
            </Stack>
          </Paper>
        </form>
      </FormProvider>
    </Box>
  );
};
