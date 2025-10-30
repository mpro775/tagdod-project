import React from 'react';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import { formatCurrency } from '../api/cartApi';
import { useTranslation } from 'react-i18next';

interface CartStatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  isCurrency?: boolean;
}

const colorClasses = {
  blue: 'bg-blue-50 border-blue-200 text-blue-600',
  green: 'bg-green-50 border-green-200 text-green-600',
  red: 'bg-red-50 border-red-200 text-red-600',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
  purple: 'bg-purple-50 border-purple-200 text-purple-600',
};

export const CartStatsCard: React.FC<CartStatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
  isCurrency = false,
}) => {
  const colorClass = colorClasses[color];
  const { t } = useTranslation();
  const formatValue = (val: number | string) => {
    if (isCurrency && typeof val === 'number') {
      return formatCurrency(val, t('cart.stats.currency', { defaultValue: 'USD' }));
    }
    return val.toLocaleString(t('cart.stats.locale', { defaultValue: 'en-US' }));
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Typography className="text-sm font-medium text-gray-600">
          {title}
        </Typography>
        {icon && (
          <div className={`p-2 rounded-full ${colorClass}`}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {formatValue(value)}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">
            {t(subtitle, { defaultValue: subtitle })}
            </p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <span
              className={`text-xs font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? '↗' : '↘'} {t('cart.stats.trend.value', { value: Math.abs(trend.value) })}%
            </span>
            <span className="text-xs text-gray-500 mr-2">
              {t('cart.stats.trend.previousPeriod', { defaultValue: 'من الفترة السابقة' })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
