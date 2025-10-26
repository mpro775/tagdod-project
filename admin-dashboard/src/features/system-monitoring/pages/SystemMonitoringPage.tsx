import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { 
  Activity, 
  Database, 
  HardDrive, 
  Cpu, 
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Server,
} from 'lucide-react';
import { systemMonitoringApi } from '../api/systemMonitoringApi';
import type { SystemHealth, ResourceUsage } from '../api/systemMonitoringApi';
import { toast } from 'sonner';
import { formatBytes, formatUptime } from '@/shared/utils/format';
import { MetricsChart } from '../components/MetricsChart';
import { ApiPerformanceChart } from '../components/ApiPerformanceChart';

export function SystemMonitoringPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [resources, setResources] = useState<ResourceUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = async () => {
    try {
      const [healthData, resourcesData] = await Promise.all([
        systemMonitoringApi.getSystemHealth(),
        systemMonitoringApi.getResourceUsage(),
      ]);
      
      setHealth(healthData);
      setResources(resourcesData);
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
      toast.error('فشل في تحميل بيانات المراقبة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage > 90) return 'text-red-600';
    if (usage > 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">جاري تحميل بيانات المراقبة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">مراقبة النظام</h1>
          <p className="text-muted-foreground">
            مراقبة الأداء والموارد في الوقت الفعلي
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'إيقاف التحديث التلقائي' : 'تفعيل التحديث التلقائي'}
          </Button>
          <Button
            size="sm"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>
      </div>

      {/* System Status */}
      {health && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>حالة النظام</CardTitle>
                <CardDescription>نظرة عامة على صحة النظام</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${getStatusColor(health.status)}`} />
                <Badge variant={health.status === 'healthy' ? 'default' : 'destructive'}>
                  {health.status === 'healthy' ? 'سليم' : health.status === 'warning' ? 'تحذير' : 'حرج'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">وقت التشغيل</div>
                <div className="text-2xl font-bold">{formatUptime(health.uptime)}</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">متوسط وقت الاستجابة</div>
                <div className="text-2xl font-bold">{health.avgApiResponseTime.toFixed(2)}ms</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">معدل الأخطاء</div>
                <div className={`text-2xl font-bold ${getUsageColor(health.errorRate)}`}>
                  {health.errorRate.toFixed(2)}%
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">الطلبات النشطة</div>
                <div className="text-2xl font-bold">{health.activeRequests}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources */}
      {resources && (
        <Tabs defaultValue="resources" className="space-y-4">
          <TabsList>
            <TabsTrigger value="resources">
              <Activity className="h-4 w-4 ml-2" />
              الموارد
            </TabsTrigger>
            <TabsTrigger value="database">
              <Database className="h-4 w-4 ml-2" />
              قاعدة البيانات
            </TabsTrigger>
            <TabsTrigger value="cache">
              <Server className="h-4 w-4 ml-2" />
              Cache
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resources" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* CPU */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">المعالج (CPU)</CardTitle>
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <span className={getUsageColor(resources.cpu.usage)}>
                      {resources.cpu.usage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          resources.cpu.usage > 90 ? 'bg-red-500' :
                          resources.cpu.usage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${resources.cpu.usage}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {resources.cpu.cores} نواة
                  </div>
                </CardContent>
              </Card>

              {/* Memory */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">الذاكرة (RAM)</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <span className={getUsageColor(resources.memory.usagePercentage)}>
                      {resources.memory.usagePercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          resources.memory.usagePercentage > 90 ? 'bg-red-500' :
                          resources.memory.usagePercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${resources.memory.usagePercentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {formatBytes(resources.memory.used)} / {formatBytes(resources.memory.total)}
                  </div>
                </CardContent>
              </Card>

              {/* Disk */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">القرص</CardTitle>
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <span className={getUsageColor(resources.disk.usagePercentage)}>
                      {resources.disk.usagePercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          resources.disk.usagePercentage > 90 ? 'bg-red-500' :
                          resources.disk.usagePercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${resources.disk.usagePercentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {formatBytes(resources.disk.used)} / {formatBytes(resources.disk.total)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="database">
            {health && (
              <Card>
                <CardHeader>
                  <CardTitle>MongoDB</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">الحالة</div>
                      <div className="flex items-center gap-2">
                        {health.databaseStatus.connected ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className="font-medium">
                          {health.databaseStatus.connected ? 'متصل' : 'غير متصل'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">وقت الاستجابة</div>
                      <div className="text-xl font-bold">
                        {health.databaseStatus.responseTime}ms
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">عدد المجموعات</div>
                      <div className="text-xl font-bold">
                        {health.databaseStatus.collections}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">الحجم الإجمالي</div>
                      <div className="text-xl font-bold">
                        {formatBytes(health.databaseStatus.totalSize)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cache">
            {health && (
              <Card>
                <CardHeader>
                  <CardTitle>Redis Cache</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">الحالة</div>
                      <div className="flex items-center gap-2">
                        {health.redisStatus.connected ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className="font-medium">
                          {health.redisStatus.connected ? 'متصل' : 'غير متصل'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">وقت الاستجابة</div>
                      <div className="text-xl font-bold">
                        {health.redisStatus.responseTime}ms
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">معدل الإصابة</div>
                      <div className="text-xl font-bold text-green-600">
                        {health.redisStatus.hitRate.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">استخدام الذاكرة</div>
                      <div className="text-xl font-bold">
                        {health.redisStatus.memoryUsage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Charts Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">الرسوم البيانية - آخر 24 ساعة</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MetricsChart 
            metricType="cpu" 
            title="استخدام المعالج (CPU)" 
            color="#3b82f6"
          />
          <MetricsChart 
            metricType="memory" 
            title="استخدام الذاكرة (RAM)" 
            color="#10b981"
          />
        </div>

        <MetricsChart 
          metricType="disk" 
          title="استخدام القرص" 
          color="#f59e0b"
        />

        <ApiPerformanceChart />
      </div>

      {/* Last Updated */}
      {health && (
        <div className="text-sm text-muted-foreground text-center">
          آخر تحديث: {new Date(health.lastUpdated).toLocaleString('ar-YE')}
        </div>
      )}
    </div>
  );
}

