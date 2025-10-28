import { useSimpleCurrency } from '../hooks/useSimpleCurrency';
import { Currency } from '../hooks/useSimpleCurrency';

const currencies: { value: Currency; label: string; symbol: string }[] = [
  { value: 'USD', label: 'دولار أمريكي', symbol: '$' },
  { value: 'YER', label: 'ريال يمني', symbol: '$' },
  { value: 'SAR', label: 'ريال سعودي', symbol: '$' },
];

interface SimpleCurrencySelectorProps {
  className?: string;
}

export default function SimpleCurrencySelector({ className = '' }: SimpleCurrencySelectorProps) {
  const { selectedCurrency, setSelectedCurrency } = useSimpleCurrency();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-gray-700">العملة:</span>
      <div className="flex bg-gray-100 rounded-lg p-1">
        {currencies.map((currency) => (
          <button
            key={currency.value}
            onClick={() => setSelectedCurrency(currency.value)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              selectedCurrency === currency.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {currency.symbol} {currency.label}
          </button>
        ))}
      </div>
    </div>
  );
}
