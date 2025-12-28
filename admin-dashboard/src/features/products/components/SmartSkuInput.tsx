/**
 * Smart SKU Input Component
 * حقل إدخال SKU الذكي مع التحقق من أونكس
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    TextField,
    Box,
    Typography,
    CircularProgress,
    Alert,
    InputAdornment,
} from '@mui/material';
import {
    CheckCircle,
    Warning,
    HelpOutline,
} from '@mui/icons-material';
import { useCheckSku } from '../hooks/useInventoryIntegration';

// Debounce hook
const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

export interface SmartSkuInputProps {
    value: string;
    onChange: (value: string) => void;
    onSkuValidated?: (result: { existsInOnyx: boolean; onyxStock?: number }) => void;
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
    label?: string;
}

export const SmartSkuInput: React.FC<SmartSkuInputProps> = ({
    value,
    onChange,
    onSkuValidated,
    disabled = false,
    error = false,
    helperText,
    label,
}) => {
    const { t } = useTranslation(['products', 'common']);
    const [inputValue, setInputValue] = useState(value);

    // Sync external value changes
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    // Debounce the SKU value (500ms)
    const debouncedSku = useDebounce(inputValue, 500);

    // Only enable query when we have a debounced value
    const shouldCheck = debouncedSku.length >= 3;

    const { data: skuResult, isLoading, isFetching } = useCheckSku(debouncedSku, shouldCheck);

    // Notify parent when validation result changes
    useEffect(() => {
        if (skuResult && onSkuValidated) {
            onSkuValidated({
                existsInOnyx: skuResult.existsInOnyx,
                onyxStock: skuResult.onyxStock,
            });
        }
    }, [skuResult, onSkuValidated]);

    // Handle input change
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(newValue);
    }, [onChange]);

    // Determine status
    const isChecking = (isLoading || isFetching) && shouldCheck;
    const showResult = !isChecking && skuResult && shouldCheck;
    const existsInOnyx = showResult && skuResult?.existsInOnyx;
    const notInOnyx = showResult && !skuResult?.existsInOnyx;

    return (
        <Box>
            <TextField
                fullWidth
                label={label || t('products:form.sku', 'رمز الصنف (SKU)')}
                value={inputValue}
                onChange={handleChange}
                disabled={disabled}
                error={error}
                helperText={helperText}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            {isChecking && (
                                <CircularProgress size={20} />
                            )}
                            {existsInOnyx && (
                                <CheckCircle color="success" />
                            )}
                            {notInOnyx && (
                                <Warning color="warning" />
                            )}
                            {!shouldCheck && inputValue.length > 0 && (
                                <HelpOutline color="disabled" />
                            )}
                        </InputAdornment>
                    ),
                    sx: {
                        fontFamily: 'monospace',
                    },
                }}
                placeholder={t('products:form.skuPlaceholder', 'مثال: 01-001')}
            />

            {/* Validation Feedback */}
            {isChecking && (
                <Alert
                    severity="info"
                    sx={{ mt: 1 }}
                    icon={<CircularProgress size={16} />}
                >
                    {t('products:integration.skuCheck.checking', 'جارٍ التحقق من رمز الصنف...')}
                </Alert>
            )}

            {existsInOnyx && (
                <Alert severity="success" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                        {t('products:integration.skuCheck.found', 'تم التحقق: الصنف موجود في أونكس والكمية الحالية {{quantity}}. سيتم ربط المخزون تلقائياً.', {
                            quantity: skuResult?.onyxStock?.toLocaleString('ar-SA') ?? 0,
                        })}
                    </Typography>
                </Alert>
            )}

            {notInOnyx && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                        {t('products:integration.skuCheck.notFound', 'تنبيه: هذا الرمز غير موجود في مخزون أونكس الحالي.')}
                    </Typography>
                </Alert>
            )}
        </Box>
    );
};

export default SmartSkuInput;
