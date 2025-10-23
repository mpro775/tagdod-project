import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import {
  MoreHorizontal,
  Eye,
  AlertTriangle,
  Clock,
  User,
  Shield,
  ExternalLink,
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

interface AuditLogsTableProps {
  logs: AuditLog[];
  isLoading: boolean;
  onViewDetails: (log: AuditLog) => void;
}

export const AuditLogsTable: React.FC<AuditLogsTableProps> = ({
  logs,
  isLoading,
  onViewDetails,
}) => {
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
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'primary':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ar });
    } catch {
      return timestamp;
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8">
        <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">لا توجد سجلات</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          لم يتم العثور على سجلات تدقيق تطابق المعايير المحددة
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الوقت</TableHead>
            <TableHead>المستخدم</TableHead>
            <TableHead>نوع العملية</TableHead>
            <TableHead>المورد</TableHead>
            <TableHead>البيانات</TableHead>
            <TableHead>الحساسية</TableHead>
            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log._id} className="hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatTimestamp(log.timestamp)}</span>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {log.user?.name || 'مستخدم غير معروف'}
                    </span>
                  </div>
                  {log.performedByUser && log.performedByUser._id !== log.user?._id && (
                    <div className="text-xs text-muted-foreground">
                      بواسطة: {log.performedByUser.name}
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="space-y-1">
                  <Badge
                    variant="outline"
                    className={`${getActionColor(log.action)} border-0`}
                  >
                    {AUDIT_ACTION_LABELS[log.action]}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    {AUDIT_RESOURCE_LABELS[log.resource]}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="space-y-1">
                  <span className="text-sm font-medium">
                    {AUDIT_RESOURCE_LABELS[log.resource]}
                  </span>
                  {log.resourceId && (
                    <div className="text-xs text-muted-foreground">
                      ID: {truncateText(log.resourceId, 20)}
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="space-y-1">
                  {log.oldValues && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">قبل:</span>{' '}
                      {truncateText(JSON.stringify(log.oldValues), 30)}
                    </div>
                  )}
                  {log.newValues && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">بعد:</span>{' '}
                      {truncateText(JSON.stringify(log.newValues), 30)}
                    </div>
                  )}
                  {log.reason && (
                    <div className="text-xs text-muted-foreground">
                      السبب: {truncateText(log.reason, 40)}
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="space-y-1">
                  {log.isSensitive && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      حساس
                    </Badge>
                  )}
                  <Badge
                    variant={getSeverityColor(
                      AUDIT_ACTION_SEVERITY[log.action]
                    )}
                    className="text-xs"
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
              </TableCell>

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails(log)}>
                      <Eye className="h-4 w-4 mr-2" />
                      عرض التفاصيل
                    </DropdownMenuItem>
                    {log.ipAddress && (
                      <DropdownMenuItem>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        IP: {log.ipAddress}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
