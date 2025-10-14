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
  Divider,
  CircularProgress,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { FormInput } from '@/shared/components/Form/FormInput';
import { FormSelect } from '@/shared/components/Form/FormSelect';
import { useAttribute, useCreateAttribute, useUpdateAttribute } from '../hooks/useAttributes';
import { AttributeType } from '../types/attribute.types';
import type { CreateAttributeDto } from '../types/attribute.types';

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

type AttributeFormData = z.infer<typeof attributeSchema>;

export const AttributeFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== 'new' && !!id;

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

  if (isEditMode && isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {isEditMode ? 'تعديل السمة' : 'إضافة سمة جديدة'}
        </Typography>
        <Divider sx={{ my: 3 }} />

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
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
                <FormInput name="description" label="الوصف" multiline rows={2} />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  الإعدادات
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControlLabel
                    control={<Switch {...methods.register('isActive')} defaultChecked />}
                    label="نشط"
                  />
                  <FormControlLabel
                    control={<Switch {...methods.register('isFilterable')} defaultChecked />}
                    label="قابل للفلترة"
                  />
                  <FormControlLabel
                    control={<Switch {...methods.register('isRequired')} />}
                    label="إلزامي عند إنشاء منتج"
                  />
                  <FormControlLabel
                    control={<Switch {...methods.register('showInFilters')} defaultChecked />}
                    label="عرض في الفلاتر الجانبية"
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" gap={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={isCreating || isUpdating ? <CircularProgress size={20} /> : <Save />}
                    disabled={isCreating || isUpdating}
                  >
                    حفظ
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={() => navigate('/attributes')}
                  >
                    إلغاء
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </FormProvider>
      </Paper>
    </Box>
  );
};

