import React from 'react';
import { Currency } from '../types/currency.types';
import { useCurrency } from '../hooks/useCurrency';

interface PriceDisplayProps {
  amountUSD: number;
  className?: string;
  showOriginal?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'highlight' | 'muted';
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  amountUSD,
  className = '',
  showOriginal = false,
  size = 'md',
  variant = 'default',
}) => {
  const { selectedCurrency, convertFromUSD } = useCurrency();

  const priceInfo = convertFromUSD(amountUSD, selectedCurrency);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const variantClasses = {
    default: 'text-gray-900',
    highlight: 'text-green-600 font-semibold',
    muted: 'text-gray-500',
  };

  return (
    <div className={`price-display ${className}`}>
      <div className={`${sizeClasses[size]} ${variantClasses[variant]}`}>
        {priceInfo.formatted}
      </div>
      
      {showOriginal && selectedCurrency !== Currency.USD && (
        <div className="text-xs text-gray-400 mt-1">
          ≈ ${amountUSD.toFixed(2)} USD
        </div>
      )}
      
      {priceInfo.exchangeRate !== 1 && (
        <div className="text-xs text-gray-400 mt-1">
          سعر الصرف: {priceInfo.exchangeRate.toFixed(4)}
        </div>
      )}
    </div>
  );
};

interface PriceRangeProps {
  minAmountUSD: number;
  maxAmountUSD: number;
  className?: string;
  showOriginal?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'highlight' | 'muted';
}

export const PriceRange: React.FC<PriceRangeProps> = ({
  minAmountUSD,
  maxAmountUSD,
  className = '',
  showOriginal = false,
  size = 'md',
  variant = 'default',
}) => {
  const { selectedCurrency, convertFromUSD } = useCurrency();

  const minPrice = convertFromUSD(minAmountUSD, selectedCurrency);
  const maxPrice = convertFromUSD(maxAmountUSD, selectedCurrency);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const variantClasses = {
    default: 'text-gray-900',
    highlight: 'text-green-600 font-semibold',
    muted: 'text-gray-500',
  };

  return (
    <div className={`price-range ${className}`}>
      <div className={`${sizeClasses[size]} ${variantClasses[variant]}`}>
        {minPrice.formatted} - {maxPrice.formatted}
      </div>
      
      {showOriginal && selectedCurrency !== Currency.USD && (
        <div className="text-xs text-gray-400 mt-1">
          ≈ ${minAmountUSD.toFixed(2)} - ${maxAmountUSD.toFixed(2)} USD
        </div>
      )}
    </div>
  );
};

export default PriceDisplay;
