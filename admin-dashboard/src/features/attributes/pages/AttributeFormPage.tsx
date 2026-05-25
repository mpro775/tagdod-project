import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Grid, Skeleton, FormControlLabel, Switch, Typography } from '@mui/material';
import { PageShell, PageHeader, SectionCard, FormActionBar } from '@/shared/design-system';
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
  isActive: z.boolean().optional(),
  isFilterable: z.boolean().optional(),
  isRequired: z.boolean().optional(),
  showInFilters: z.boolean().optional(),
  groupId: z.string().nullable().optional(),
});

type AttributeSchemaType = z.infer<ReturnType<typeof createAttributeSchema>>;

export const AttributeFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('attributes');
  const isEditMode = id !== 'new' && !!id;

  const attributeSchema = createAttributeSchema(t);

  const methods = useForm<AttributeSchemaType>({
    resolver: zodResolver(attributeSchema) as any,
    defaultValues: {
      name: '', nameEn: '', type: AttributeType.TEXT, description: '',
      isActive: true, isFilterable: true, isRequired: false, showInFilters: true, order: 0,
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
    const attrData: Omit<CreateAttributeDto, 'isActive'> = {
      name: data.name, nameEn: data.nameEn, type: data.type,
      description: data.description, order: data.order,
      isFilterable: data.isFilterable, isRequired: data.isRequired,
      showInFilters: data.showInFilters, groupId: data.groupId,
    };
    if (isEditMode) {
      const updateData = { ...attrData, isActive: data.isActive };
      updateAttribute({ id: id!, data: updateData }, { onSuccess: () => navigate('/attributes') });
    } else {
      createAttribute(attrData as any, { onSuccess: () => navigate('/attributes') });
    }
  };

  if (isEditMode && isLoading) {
    return (
      <PageShell spacing="compact" fullHeight>
        <Skeleton variant="rectangular" sx={{ mb: 2, borderRadius: 2, bgcolor: 'background.paper', height: 50 }} />
        <Skeleton variant="rectangular" sx={{ borderRadius: 2, bgcolor: 'background.paper', height: 400 }} />
      </PageShell>
    );
  }

  return (
    <FormProvider {...methods}>
      <PageShell spacing="compact" fullHeight>
        <PageHeader
          variant="compact"
          title={isEditMode ? t('attributes.editAttribute') : t('attributes.createAttribute')}
          breadcrumbs={[
            { label: t('common.home', { ns: 'common' }), to: '/' },
            { label: t('attributes.title'), to: '/attributes' },
            { label: isEditMode ? t('attributes.editAttribute') : t('attributes.createAttribute') },
          ]}
        />

        <SectionCard title={t('form.basicInfo')} description={t('form.basicInfoDesc')}>
          <Grid container spacing={2}>
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
        </SectionCard>

        <SectionCard title={t('form.displaySettings')} description={t('form.settingsDesc')}>
          <Grid container spacing={2}>
            {isEditMode && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="isActive"
                  control={methods.control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch checked={field.value ?? true} onChange={(e) => field.onChange(e.target.checked)} />}
                      label={<Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{t('form.isActive')}</Typography>}
                    />
                  )}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="isFilterable"
                control={methods.control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value ?? true} onChange={(e) => field.onChange(e.target.checked)} />}
                    label={<Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{t('form.isFilterable')}</Typography>}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="isRequired"
                control={methods.control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value ?? false} onChange={(e) => field.onChange(e.target.checked)} />}
                    label={<Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{t('form.isRequired')}</Typography>}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="showInFilters"
                control={methods.control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value ?? true} onChange={(e) => field.onChange(e.target.checked)} />}
                    label={<Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{t('form.showInFilters')}</Typography>}
                  />
                )}
              />
            </Grid>
          </Grid>
        </SectionCard>

        <FormActionBar
          onSubmit={methods.handleSubmit(onSubmit, () => toast.error(t('validation.fillRequiredFields')))}
          onCancel={() => navigate('/attributes')}
          submitLabel={isEditMode ? t('form.update') : t('form.create')}
          cancelLabel={t('form.cancel')}
          loading={isCreating || isUpdating}
        />
      </PageShell>
    </FormProvider>
  );
};