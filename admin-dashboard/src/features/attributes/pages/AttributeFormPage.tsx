import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
} from '@mui/material';
import { Save, Cancel, ArrowBack, Info, Settings, Warning, CheckCircle } from '@mui/icons-material';
import { FormInput } from '@/shared/components/Form/FormInput';
import { FormSelect } from '@/shared/components/Form/FormSelect';
import { useAttribute, useCreateAttribute, useUpdateAttribute } from '../hooks/useAttributes';
import { AttributeType } from '../types/attribute.types';
import type { CreateAttributeDto, AttributeFormData } from '../types/attribute.types';

const attributeSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  nameEn: z.string().min(2, 'الاسم بالإنجليزية مطلوب'),
  type: z.nativeEnum(AttributeType),
  description: z.string().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
  isFilterable: z.boolean().optional(),
  isRequired: z.boolean().optional(),
  showInFilters: z.boolean().optional(),
});

const steps = ['المعلومات الأساسية', 'الإعدادات', 'المراجعة'];

export const AttributeFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== 'new' && !!id;
  const [activeStep, setActiveStep] = React.useState(0);

  const methods = useForm<AttributeFormData>({
    resolver: zodResolver(attributeSchema),
    defaultValues: {
      name: '',
      nameEn: '',
      type: AttributeType.SELECT,
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

  const onSubmit = (data: AttributeFormData) => {
    const attrData: CreateAttributeDto = data;

    if (isEditMode) {
      updateAttribute({ id: id!, data: attrData }, { onSuccess: () => navigate('/attributes') });
    } else {
      createAttribute(attrData, { onSuccess: () => navigate('/attributes') });
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
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
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Alert severity="info" icon={<Info />} sx={{ mb: 3 }}>
                أدخل المعلومات الأساسية للسمة. هذه المعلومات ستظهر في واجهة المستخدم.
              </Alert>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormInput name="name" label="اسم السمة (عربي) *" />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormInput name="nameEn" label="Attribute Name (English) *" />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormSelect
                name="type"
                label="نوع السمة *"
                options={[
                  { value: AttributeType.SELECT, label: 'اختيار واحد (Select)' },
                  { value: AttributeType.MULTISELECT, label: 'اختيار متعدد (Multi-select)' },
                  { value: AttributeType.TEXT, label: 'نص (Text)' },
                  { value: AttributeType.NUMBER, label: 'رقم (Number)' },
                  { value: AttributeType.BOOLEAN, label: 'نعم/لا (Boolean)' },
                ]}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormInput name="order" label="الترتيب" type="number" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormInput name="description" label="الوصف" multiline rows={3} />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Alert severity="warning" icon={<Settings />} sx={{ mb: 3 }}>
                قم بتكوين إعدادات السمة حسب احتياجاتك.
              </Alert>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardHeader title="إعدادات العرض" />
                <CardContent>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={<Switch {...methods.register('isActive')} defaultChecked />}
                      label="نشط - السمة متاحة للاستخدام"
                    />
                    <FormControlLabel
                      control={<Switch {...methods.register('isFilterable')} defaultChecked />}
                      label="قابل للفلترة - يمكن للمستخدمين فلترة المنتجات بهذه السمة"
                    />
                    <FormControlLabel
                      control={<Switch {...methods.register('isRequired')} />}
                      label="إلزامي - يجب ملء هذه السمة عند إنشاء منتج"
                    />
                    <FormControlLabel
                      control={<Switch {...methods.register('showInFilters')} defaultChecked />}
                      label="عرض في الفلاتر الجانبية - تظهر في قائمة الفلاتر"
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
      case 2:
        const watchedValues = methods.watch();
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
                راجع المعلومات قبل الحفظ النهائي.
              </Alert>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardHeader title="المعلومات الأساسية" />
                <CardContent>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        الاسم العربي:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {watchedValues.name}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        الاسم الإنجليزي:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {watchedValues.nameEn}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        النوع:
                      </Typography>
                      <Chip label={watchedValues.type} color="primary" size="small" />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        الترتيب:
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
                <CardHeader title="الإعدادات" />
                <CardContent>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {watchedValues.isActive ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Warning color="warning" />
                      )}
                      <Typography variant="body2">نشط</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {watchedValues.isFilterable ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Warning color="warning" />
                      )}
                      <Typography variant="body2">قابل للفلترة</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {watchedValues.isRequired ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Warning color="warning" />
                      )}
                      <Typography variant="body2">إلزامي</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {watchedValues.showInFilters ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Warning color="warning" />
                      )}
                      <Typography variant="body2">عرض في الفلاتر</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
      default:
        return 'خطأ غير معروف';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate('/attributes')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            {isEditMode ? 'تعديل السمة' : 'إضافة سمة جديدة'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isEditMode ? 'تعديل معلومات السمة الموجودة' : 'إنشاء سمة جديدة للمنتجات'}
          </Typography>
        </Box>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
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
          <Paper sx={{ p: 3, mb: 3 }}>{renderStepContent(activeStep)}</Paper>

          {/* Navigation Buttons */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button disabled={activeStep === 0} onClick={handleBack} startIcon={<ArrowBack />}>
                السابق
              </Button>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => navigate('/attributes')}
                >
                  إلغاء
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleReset}
                >
                  إعادة تعيين
                </Button>
                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={isCreating || isUpdating ? <CircularProgress size={20} /> : <Save />}
                    disabled={isCreating || isUpdating}
                  >
                    {isEditMode ? 'تحديث' : 'إنشاء'}
                  </Button>
                ) : (
                  <Button variant="contained" onClick={handleNext} startIcon={<CheckCircle />}>
                    التالي
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        </form>
      </FormProvider>
    </Box>
  );
};
