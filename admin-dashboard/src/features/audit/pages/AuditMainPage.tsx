import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
  Shield,
  BarChart3,
  FileText,
  Settings,
  AlertTriangle,
  Activity,
  Users,
  Key,
  Database,
  Clock,
} from 'lucide-react';
import { AuditLogsPage } from './AuditLogsPage';
import { AuditAnalyticsPage } from './AuditAnalyticsPage';
import { useAuditStats } from '../hooks/useAudit';

export const AuditMainPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('logs');
  const { stats, isLoading } = useAuditStats();

  const quickStats = [
    {
      title: 'إجمالي السجلات',
      value: stats?.totalLogs || 0,
      icon: Database,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'العمليات الحساسة',
      value: stats?.sensitiveLogs || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'الإجراءات الإدارية',
      value: stats?.adminActions || 0,
      icon: Settings,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'أحداث المصادقة',
      value: stats?.authEvents || 0,
      icon: Key,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">نظام التدقيق</h1>
          <p className="text-muted-foreground">
            مراقبة وتتبع جميع العمليات في النظام
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            الإعدادات
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : stat.value.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.title === 'العمليات الحساسة' && stats?.totalLogs
                    ? `${Math.round((stat.value / stats.totalLogs) * 100)}% من إجمالي العمليات`
                    : 'آخر تحديث'}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            سجلات التدقيق
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            التحليلات والإحصائيات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <AuditLogsPage />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AuditAnalyticsPage />
        </TabsContent>
      </Tabs>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            حالة نظام التدقيق
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <Activity className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">النظام نشط</p>
                <p className="text-xs text-muted-foreground">جميع العمليات يتم تسجيلها</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">آخر تحديث</p>
                <p className="text-xs text-muted-foreground">
                  {new Date().toLocaleString('ar-SA')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-100">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">المستخدمون النشطون</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.authEvents || 0} حدث مصادقة
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
