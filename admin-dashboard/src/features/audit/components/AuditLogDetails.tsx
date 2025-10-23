import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Clock,
  User,
  Shield,
  AlertTriangle,
  Key,
  Database,
  Monitor,
  Globe,
  FileText,
  Activity,
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  AuditLog,
  AUDIT_ACTION_LABELS,
  AUDIT_RESOURCE_LABELS,
  AUDIT_ACTION_COLORS,
  AUDIT_ACTION_SEVERITY,
} from '../types/audit.types';

interface AuditLogDetailsProps {
  log: AuditLog | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogDetails: React.FC<AuditLogDetailsProps> = ({
  log,
  isOpen,
  onClose,
}) => {
  if (!log) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'secondary';
      case 'medium':
        return 'outline';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const getActionColor = (action: string) => {
    const color = AUDIT_ACTION_COLORS[action as keyof typeof AUDIT_ACTION_COLORS];
    switch (color) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'primary':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ar });
    } catch {
      return timestamp;
    }
  };

  const formatJsonData = (data: any) => {
    if (!data) return null;
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            تفاصيل سجل التدقيق
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                المعلومات الأساسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">الوقت:</span>
                  </div>
                  <p className="text-sm">{formatTimestamp(log.timestamp)}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">نوع العملية:</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${getActionColor(log.action)} border`}
                  >
                    {AUDIT_ACTION_LABELS[log.action]}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">نوع المورد:</span>
                  </div>
                  <Badge variant="secondary">
                    {AUDIT_RESOURCE_LABELS[log.resource]}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">مستوى الخطورة:</span>
                  </div>
                  <Badge
                    variant={getSeverityColor(
                      AUDIT_ACTION_SEVERITY[log.action]
                    )}
                  >
                    {AUDIT_ACTION_SEVERITY[log.action] === 'critical'
                      ? 'حرج'
                      : AUDIT_ACTION_SEVERITY[log.action] === 'high'
                      ? 'عالي'
                      : AUDIT_ACTION_SEVERITY[log.action] === 'medium'
                      ? 'متوسط'
                      : 'منخفض'}
                  </Badge>
                </div>
              </div>

              {log.resourceId && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">معرف المورد:</span>
                  <p className="text-sm font-mono bg-muted p-2 rounded">
                    {log.resourceId}
                  </p>
                </div>
              )}

              {log.reason && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">السبب:</span>
                  <p className="text-sm bg-muted p-2 rounded">{log.reason}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                معلومات المستخدم
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium">المستخدم المتأثر:</span>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {log.user?.name || 'غير معروف'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {log.user?.email}
                    </p>
                    {log.user?.phone && (
                      <p className="text-xs text-muted-foreground">
                        {log.user.phone}
                      </p>
                    )}
                  </div>
                </div>

                {log.performedByUser && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">من قام بالعملية:</span>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {log.performedByUser.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.performedByUser.email}
                      </p>
                      {log.performedByUser.phone && (
                        <p className="text-xs text-muted-foreground">
                          {log.performedByUser.phone}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Technical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                المعلومات التقنية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {log.ipAddress && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">عنوان IP:</span>
                    </div>
                    <p className="text-sm font-mono bg-muted p-2 rounded">
                      {log.ipAddress}
                    </p>
                  </div>
                )}

                {log.sessionId && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">معرف الجلسة:</span>
                    <p className="text-sm font-mono bg-muted p-2 rounded">
                      {log.sessionId}
                    </p>
                  </div>
                )}
              </div>

              {log.userAgent && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">متصفح المستخدم:</span>
                  <p className="text-sm bg-muted p-2 rounded break-all">
                    {log.userAgent}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Changes */}
          {(log.oldValues || log.newValues) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  تغييرات البيانات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {log.oldValues && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">القيم القديمة:</span>
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                      {formatJsonData(log.oldValues)}
                    </pre>
                  </div>
                )}

                {log.newValues && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">القيم الجديدة:</span>
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                      {formatJsonData(log.newValues)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          {log.metadata && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  البيانات الإضافية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                  {formatJsonData(log.metadata)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Sensitivity Warning */}
          {log.isSensitive && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">تحذير: عملية حساسة</span>
                </div>
                <p className="text-sm text-red-700 mt-2">
                  هذه العملية تحتوي على معلومات حساسة وتتطلب مراجعة إضافية.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
