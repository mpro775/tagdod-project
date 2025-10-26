import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info,
  XCircle,
  Download,
  Trash2,
  CheckCircle2,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { errorLogsApi } from '../api/errorLogsApi';
import type { ErrorLog, ErrorStatistics, ErrorTrend } from '../api/errorLogsApi';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { toast } from 'sonner';
import { formatRelativeTime } from '@/shared/utils/format';
import type { ColumnDef } from '@tanstack/react-table';

export function ErrorLogsPage() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [statistics, setStatistics] = useState<ErrorStatistics | null>(null);
  const [trends, setTrends] = useState<ErrorTrend | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  // Filters
  const [level, setLevel] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsData, statsData, trendsData] = await Promise.all([
        errorLogsApi.getErrorLogs({ level, category, search, page, limit: 20 }),
        errorLogsApi.getStatistics(),
        errorLogsApi.getTrends(7),
      ]);

      setErrors(logsData.data);
      setTotalPages(logsData.meta.totalPages);
      setStatistics(statsData);
      setTrends(trendsData);
    } catch (error) {
      console.error('Error fetching error logs:', error);
      toast.error('فشل في تحميل سجلات الأخطاء');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [level, category, search, page]);

  const handleResolveError = async (id: string) => {
    try {
      await errorLogsApi.resolveError(id);
      toast.success('تم حل الخطأ بنجاح');
      fetchData();
    } catch (error) {
      toast.error('فشل في حل الخطأ');
    }
  };

  const handleDeleteError = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الخطأ؟')) return;

    try {
      await errorLogsApi.deleteError(id);
      toast.success('تم حذف الخطأ بنجاح');
      fetchData();
    } catch (error) {
      toast.error('فشل في حذف الخطأ');
    }
  };

  const handleExport = async (format: 'json' | 'csv' | 'txt') => {
    try {
      const result = await errorLogsApi.exportLogs({ format });
      window.open(result.fileUrl, '_blank');
      toast.success('تم تصدير السجلات بنجاح');
    } catch (error) {
      toast.error('فشل في تصدير السجلات');
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'fatal':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'debug':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const variants: Record<string, any> = {
      fatal: 'destructive',
      error: 'destructive',
      warn: 'default',
      debug: 'secondary',
    };

    return (
      <Badge variant={variants[level] || 'default'} className="gap-1">
        {getLevelIcon(level)}
        {level}
      </Badge>
    );
  };

  const getTrendIcon = () => {
    if (!trends) return null;
    
    switch (trends.trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const columns: ColumnDef<ErrorLog>[] = [
    {
      accessorKey: 'level',
      header: 'المستوى',
      cell: ({ row }) => getLevelBadge(row.original.level),
    },
    {
      accessorKey: 'category',
      header: 'الفئة',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.category}</Badge>
      ),
    },
    {
      accessorKey: 'message',
      header: 'الرسالة',
      cell: ({ row }) => (
        <div className="max-w-md truncate" title={row.original.message}>
          {row.original.message}
        </div>
      ),
    },
    {
      accessorKey: 'endpoint',
      header: 'نقطة النهاية',
      cell: ({ row }) => (
        <code className="text-xs bg-secondary px-2 py-1 rounded">
          {row.original.endpoint || '-'}
        </code>
      ),
    },
    {
      accessorKey: 'occurrences',
      header: 'التكرارات',
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.occurrences}</Badge>
      ),
    },
    {
      accessorKey: 'lastOccurrence',
      header: 'آخر ظهور',
      cell: ({ row }) => formatRelativeTime(row.original.lastOccurrence),
    },
    {
      accessorKey: 'resolved',
      header: 'محلول؟',
      cell: ({ row }) => (
        row.original.resolved ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )
      ),
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedError(row.original);
              setShowDetailsDialog(true);
            }}
          >
            عرض
          </Button>
          {!row.original.resolved && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleResolveError(row.original.id)}
            >
              حل
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDeleteError(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الأخطاء والسجلات</h1>
          <p className="text-muted-foreground">
            تتبع وإدارة أخطاء النظام
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
          >
            <Download className="h-4 w-4 ml-2" />
            تصدير CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('json')}
          >
            <Download className="h-4 w-4 ml-2" />
            تصدير JSON
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الأخطاء</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalErrors.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">آخر 24 ساعة</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.last24Hours.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معدل الأخطاء</CardTitle>
              {getTrendIcon()}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.errorRate.toFixed(2)}%</div>
              {trends && (
                <p className="text-xs text-muted-foreground mt-1">
                  {trends.trend === 'increasing' ? 'في ازدياد' : trends.trend === 'decreasing' ? 'في انخفاض' : 'مستقر'}
                  {' '}({trends.changePercentage > 0 ? '+' : ''}{trends.changePercentage.toFixed(1)}%)
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">آخر 7 أيام</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.last7Days.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>تصفية السجلات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">البحث</label>
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث في الرسائل..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">المستوى</label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع المستويات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع المستويات</SelectItem>
                  <SelectItem value="fatal">Fatal</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">الفئة</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الفئات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع الفئات</SelectItem>
                  <SelectItem value="database">قاعدة البيانات</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="authentication">المصادقة</SelectItem>
                  <SelectItem value="validation">التحقق</SelectItem>
                  <SelectItem value="business_logic">منطق الأعمال</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setLevel('');
                  setCategory('');
                  setSearch('');
                }}
                className="w-full"
              >
                <Filter className="h-4 w-4 ml-2" />
                إعادة تعيين
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجلات الأخطاء</CardTitle>
          <CardDescription>
            عرض {errors.length} من إجمالي السجلات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={errors}
            loading={loading}
          />
          
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              الصفحة {page} من {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                السابق
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                التالي
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل الخطأ</DialogTitle>
          </DialogHeader>
          
          {selectedError && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">المستوى</label>
                  <div className="mt-1">{getLevelBadge(selectedError.level)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">الفئة</label>
                  <div className="mt-1">
                    <Badge variant="outline">{selectedError.category}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">التكرارات</label>
                  <div className="mt-1 font-bold">{selectedError.occurrences}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">آخر ظهور</label>
                  <div className="mt-1">{new Date(selectedError.lastOccurrence).toLocaleString('ar-YE')}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">الرسالة</label>
                <p className="mt-1 p-3 bg-secondary rounded-md">{selectedError.message}</p>
              </div>

              {selectedError.endpoint && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">نقطة النهاية</label>
                  <code className="mt-1 block p-3 bg-secondary rounded-md text-sm">
                    {selectedError.method} {selectedError.endpoint}
                  </code>
                </div>
              )}

              {selectedError.stack && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Stack Trace</label>
                  <pre className="mt-1 p-3 bg-secondary rounded-md text-xs overflow-x-auto">
                    {selectedError.stack}
                  </pre>
                </div>
              )}

              {selectedError.metadata && Object.keys(selectedError.metadata).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">معلومات إضافية</label>
                  <pre className="mt-1 p-3 bg-secondary rounded-md text-xs overflow-x-auto">
                    {JSON.stringify(selectedError.metadata, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex gap-2">
                {!selectedError.resolved && (
                  <Button onClick={() => {
                    handleResolveError(selectedError.id);
                    setShowDetailsDialog(false);
                  }}>
                    <CheckCircle2 className="h-4 w-4 ml-2" />
                    حل الخطأ
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteError(selectedError.id);
                    setShowDetailsDialog(false);
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-2" />
                  حذف
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

