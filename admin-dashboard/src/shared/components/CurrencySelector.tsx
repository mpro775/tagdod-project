import React from 'react';
import { Currency } from '../types/currency.types';
import { useCurrency } from '../hooks/useCurrency';

interface CurrencySelectorProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showCurrentInfo?: boolean;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  className = '',
  size = 'md',
  showLabel = true,
  showCurrentInfo = false,
}) => {
  const {
    selectedCurrency,
    changeCurrency,
    getSupportedCurrencies,
    getCurrentCurrencyInfo,
  } = useCurrency();

  const currencies = getSupportedCurrencies();
  const currentInfo = getCurrentCurrencyInfo();

  const sizeClasses = {
    sm: 'text-sm px-2 py-1.5 min-w-[140px]',
    md: 'text-base px-3 py-2',
    lg: 'text-lg px-4 py-3',
  };

  const iconSizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`currency-selector ${className}`}>
      {showLabel && (
        <label 
          htmlFor="currency-select" 
          className={`block font-medium text-gray-700 mb-1 ${labelSizeClasses[size]}`}
        >
          العملة
        </label>
      )}
      
      <div className="relative">
        <select
          id="currency-select"
          value={selectedCurrency}
          onChange={(e) => changeCurrency(e.target.value as Currency)}
          className={`
            w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            bg-white appearance-none cursor-pointer
            ${sizeClasses[size]}
          `}
        >
          {currencies.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.symbol} - {currency.name}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className={`${iconSizeClasses[size]} text-gray-400`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      
      {showCurrentInfo && (
        <div className="mt-1 text-xs text-gray-500">
          العملة الحالية: {currentInfo.symbol} {currentInfo.name}
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
