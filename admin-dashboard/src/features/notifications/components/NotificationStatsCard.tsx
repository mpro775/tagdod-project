import React from 'react';
import { StatCard } from '@/shared/design-system';

interface NotificationStatsCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  color?: string;
  isLoading?: boolean;
}

export const NotificationStatsCard: React.FC<NotificationStatsCardProps> = React.memo(({
  icon,
  value,
  label,
  isLoading = false,
}) => {
  return (
    <StatCard
      title={label}
      value={typeof value === 'number' ? value.toLocaleString('en-US') : value}
      icon={icon}
      tone="primary"
      loading={isLoading}
    />
  );
});

NotificationStatsCard.displayName = 'NotificationStatsCard';