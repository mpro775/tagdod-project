import React from 'react';
import { Card, CardContent, CardHeader, Typography, Badge } from '@mui/material';
import {
  Shield,
  Warning as AlertTriangle,
  Key,
  AdminPanelSettings as CrownIcon,
  CheckCircle as CheckCircleIcon,
  Lock,
  Dataset as DatabaseIcon,
  Settings,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { AuditStats } from '../types/audit.types';

interface AuditStatsCardsProps {
  stats: AuditStats | undefined;
  isLoading: boolean;
}

export const AuditStatsCards: React.FC<AuditStatsCardsProps> = ({ stats, isLoading }) => {
  const { t } = useTranslation('audit');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">{t('stats.noData', { defaultValue: 'لا توجد بيانات متاحة' })}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statsData = [
    {
      title: t('stats.totalLogs', { defaultValue: 'عدد السجلات' }),
      value: stats.totalLogs,
      icon: DatabaseIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: t('stats.totalLogsDesc', { defaultValue: 'عدد السجلات المسجلة' }),
    },
    {
      title: t('stats.sensitiveLogs', { defaultValue: 'عدد السجلات الحساسة' }),
      value: stats.sensitiveLogs,
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: t('stats.sensitiveLogsDesc', { defaultValue: 'عدد السجلات الحساسة المسجلة' }),
    },
    {
      title: t('stats.permissionChanges', { defaultValue: 'عدد تغييرات الصلاحيات' }),
      value: stats.permissionChanges,
      icon: Key,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: t('stats.permissionChangesDesc', { defaultValue: 'عدد تغييرات الصلاحيات المسجلة' }),
    },
    {
      title: t('stats.roleChanges', { defaultValue: 'عدد تغييرات الأدوار' }),
      value: stats.roleChanges,
      icon: CrownIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: t('stats.roleChangesDesc', { defaultValue: 'عدد تغييرات الأدوار المسجلة' }),
    },
    {
      title: t('stats.capabilityDecisions', { defaultValue: 'عدد قرارات القدرات' }),
      value: stats.capabilityDecisions,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: t('stats.capabilityDecisionsDesc', { defaultValue: 'عدد قرارات القدرات المسجلة' }),
    },
    {
      title: t('stats.adminActions', { defaultValue: 'عدد إجراءات الإدارة' }    ),
      value: stats.adminActions,
      icon: Settings,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: t('stats.adminActionsDesc', { defaultValue: 'عدد إجراءات الإدارة المسجلة' }),
    },
    {
      title: t('stats.authEvents', { defaultValue: 'عدد أحداث المصادقة' }),
      value: stats.authEvents,
      icon: Lock,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      description: t('stats.authEventsDesc', { defaultValue: 'عدد أحداث المصادقة المسجلة' }),
    },
    {
      title: t('stats.sensitivityRate', { defaultValue: 'نسبة الحساسية' }),
      value: stats.totalLogs > 0 ? Math.round((stats.sensitiveLogs / stats.totalLogs) * 100) : 0,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: t('stats.sensitivityRateDesc', { defaultValue: 'نسبة الحساسية المسجلة' }),
      suffix: '%',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Typography variant="body2" className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </Typography>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value.toLocaleString()}
                {stat.suffix}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              {stat.title === t('stats.sensitivityRate', { defaultValue: 'نسبة الحساسية' }) && (
                <div className="mt-2">
                  <Badge
                    variant="standard"
                    color={stat.value > 20 ? 'error' : stat.value > 10 ? 'warning' : 'info'}
                    className="text-xs"
                  >
                    {stat.value > 20 ? t('stats.highSensitivity', { defaultValue: 'عالي' }) : stat.value > 10 ? t('stats.mediumSensitivity', { defaultValue: 'متوسط' }) : t('stats.lowSensitivity', { defaultValue: 'منخفض' })}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
