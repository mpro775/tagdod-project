import { useSimpleCurrency } from '../hooks/useSimpleCurrency';

interface SimplePriceDisplayProps {
  amountUSD: number;
  showOriginal?: boolean;
  className?: string;
}

export default function SimplePriceDisplay({ 
  amountUSD, 
  showOriginal = false, 
  className = '' 
}: SimplePriceDisplayProps) {
  const { convertFromUSD, selectedCurrency } = useSimpleCurrency();
  
  const { formatted } = convertFromUSD(amountUSD);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-semibold text-lg">
        {formatted}
      </span>
      
      {showOriginal && selectedCurrency !== 'USD' && (
        <span className="text-sm text-gray-500">
          (${amountUSD})
        </span>
      )}
    </div>
  );
}
