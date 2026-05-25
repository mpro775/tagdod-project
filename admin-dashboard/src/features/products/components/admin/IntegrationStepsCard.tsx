import { useTranslation } from 'react-i18next';
import { Sync, Inventory, CheckCircle } from '@mui/icons-material';
import { Chip, Alert, Stack } from '@mui/material';
import { SectionCard } from '@/shared/design-system';

export const IntegrationStepsCard: React.FC = () => {
    const { t } = useTranslation('products');

    const steps = [
        {
            icon: <Sync fontSize="small" />,
            label: t('integration.step1', '1. السكربت المحلي يرسل البيانات'),
        },
        {
            icon: <Inventory fontSize="small" />,
            label: t('integration.step2', '2. النظام يحفظ في مخزون الظل'),
        },
        {
            icon: <CheckCircle fontSize="small" />,
            label: t('integration.step3', '3. المنتجات المربوطة تتحدث تلقائياً'),
        },
    ];

    return (
        <SectionCard
            title={t('integration.howItWorks', 'كيف يعمل الربط؟')}
            padding="md"
        >
            <Stack spacing={2}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {steps.map((step) => (
                        <Chip
                            key={step.label}
                            icon={step.icon}
                            label={step.label}
                            variant="outlined"
                        />
                    ))}
                </Stack>
                <Alert severity="info">
                    {t(
                        'integration.tip',
                        'نصيحة: المنتجات في "فرص الإضافة" موجودة في أونكس ولم تُضف للموقع بعد. أضفها لتفعيل الربط التلقائي.'
                    )}
                </Alert>
            </Stack>
        </SectionCard>
    );
};