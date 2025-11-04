import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Currency } from '../types/currency.types';
import { useCurrency } from '../hooks/useCurrency';

interface CurrencySelectorProps {
  className?: string;
  size?: 'small' | 'medium';
  showLabel?: boolean;
  showCurrentInfo?: boolean;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  className = '',
  size = 'medium',
  showLabel = true,
  showCurrentInfo = false,
}) => {
  const { t } = useTranslation('common');
  const {
    selectedCurrency,
    changeCurrency,
    getSupportedCurrencies,
    getCurrentCurrencyInfo,
  } = useCurrency();

  const currencies = getSupportedCurrencies();
  const currentInfo = getCurrentCurrencyInfo();

  const handleChange = (event: SelectChangeEvent<string>) => {
    changeCurrency(event.target.value as Currency);
  };

  // Get translated currency name
  const getCurrencyName = (code: string) => {
    return t(`common.currencies.${code.toLowerCase()}`);
  };

  return (
    <div className={`currency-selector ${className}`}>
      <FormControl size={size} sx={{ minWidth: 140 }}>
        {showLabel && <InputLabel>{t('common.currency')}</InputLabel>}
        <Select
          value={selectedCurrency}
          onChange={handleChange}
          label={showLabel ? t('common.currency') : undefined}
          sx={{
            backgroundColor: 'background.paper',
          }}
        >
          {currencies.map((currency) => (
            <MenuItem key={currency.code} value={currency.code}>
              {currency.symbol} {getCurrencyName(currency.code)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {showCurrentInfo && (
        <div className="mt-1 text-xs text-gray-500">
          {t('common.currency')}: {currentInfo.symbol} {getCurrencyName(currentInfo.code)}
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
