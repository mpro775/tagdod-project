import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { Languages, Plus, Download, Upload, Search, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { i18nApi } from '../api/i18nApi';
import type { Translation, TranslationStats } from '../api/i18nApi';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

const NAMESPACES = [
  'common',
  'auth',
  'products',
  'orders',
  'services',
  'users',
  'settings',
  'errors',
  'validation',
  'notifications',
];

export function I18nManagementPage() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [stats, setStats] = useState<TranslationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);

  // Filters
  const [namespace, setNamespace] = useState('');
  const [search, setSearch] = useState('');
  const [missingOnly, setMissingOnly] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    key: '',
    ar: '',
    en: '',
    namespace: 'common',
    description: '',
  });

  const [importData, setImportData] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [translationsData, statsData] = await Promise.all([
        i18nApi.getTranslations({ namespace, search, missingOnly }),
        i18nApi.getStatistics(),
      ]);

      setTranslations(translationsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching translations:', error);
      toast.error('فشل في تحميل الترجمات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [namespace, search, missingOnly]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTranslation) {
        await i18nApi.updateTranslation(editingTranslation.key, {
          ar: formData.ar,
          en: formData.en,
          namespace: formData.namespace,
          description: formData.description,
        });
        toast.success('تم تحديث الترجمة بنجاح');
      } else {
        await i18nApi.createTranslation(formData);
        toast.success('تم إنشاء الترجمة بنجاح');
      }

      setShowDialog(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في حفظ الترجمة');
    }
  };

  const handleEdit = (translation: Translation) => {
    setEditingTranslation(translation);
    setFormData({
      key: translation.key,
      ar: translation.ar,
      en: translation.en,
      namespace: translation.namespace,
      description: translation.description || '',
    });
    setShowDialog(true);
  };

  const handleDelete = async (key: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الترجمة؟')) return;

    try {
      await i18nApi.deleteTranslation(key);
      toast.success('تم حذف الترجمة بنجاح');
      fetchData();
    } catch (error) {
      toast.error('فشل في حذف الترجمة');
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const result = await i18nApi.exportTranslations({ format, namespace });
      
      const blob = new Blob(
        [format === 'json' ? JSON.stringify(result.data, null, 2) : result.data],
        { type: format === 'json' ? 'application/json' : 'text/csv' }
      );
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `translations-${namespace || 'all'}.${format}`;
      a.click();
      
      toast.success('تم التصدير بنجاح');
    } catch (error) {
      toast.error('فشل في التصدير');
    }
  };

  const handleImport = async () => {
    try {
      const data = JSON.parse(importData);
      const result = await i18nApi.bulkImport({
        translations: data,
        namespace,
        overwrite: true,
      });

      toast.success(`تم استيراد ${result.imported} ترجمة، تحديث ${result.updated}`);
      setShowImportDialog(false);
      setImportData('');
      fetchData();
    } catch (error) {
      toast.error('فشل في الاستيراد - تأكد من صحة البيانات');
    }
  };

  const resetForm = () => {
    setFormData({
      key: '',
      ar: '',
      en: '',
      namespace: 'common',
      description: '',
    });
    setEditingTranslation(null);
  };

  const columns: ColumnDef<Translation>[] = [
    {
      accessorKey: 'key',
      header: 'المفتاح',
      cell: ({ row }) => (
        <code className="text-xs bg-secondary px-2 py-1 rounded">
          {row.original.key}
        </code>
      ),
    },
    {
      accessorKey: 'ar',
      header: 'العربية',
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.original.ar}>
          {row.original.ar || (
            <span className="text-muted-foreground italic">-</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'en',
      header: 'الإنجليزية',
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.original.en}>
          {row.original.en || (
            <span className="text-muted-foreground italic">-</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'namespace',
      header: 'المساحة',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.namespace}</Badge>
      ),
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(row.original)}
          >
            تعديل
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDelete(row.original.key)}
          >
            حذف
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
          <h1 className="text-3xl font-bold">إدارة نصوص التعريب</h1>
          <p className="text-muted-foreground">
            إدارة الترجمات بالعربية والإنجليزية
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('json')}
          >
            <Download className="h-4 w-4 ml-2" />
            تصدير JSON
          </Button>
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
            onClick={() => setShowImportDialog(true)}
          >
            <Upload className="h-4 w-4 ml-2" />
            استيراد
          </Button>
          <Button
            size="sm"
            onClick={() => {
              resetForm();
              setShowDialog(true);
            }}
          >
            <Plus className="h-4 w-4 ml-2" />
            إضافة ترجمة
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الترجمات</CardTitle>
              <Languages className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTranslations}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">اكتمال العربية</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.arabicCompleteness.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.missingArabic} ترجمة مفقودة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">اكتمال الإنجليزية</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.englishCompleteness.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.missingEnglish} ترجمة مفقودة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المساحات</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(stats.byNamespace).length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>تصفية الترجمات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>البحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث في المفتاح أو النص..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>المساحة</Label>
              <Select value={namespace} onValueChange={setNamespace}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع المساحات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع المساحات</SelectItem>
                  {NAMESPACES.map((ns) => (
                    <SelectItem key={ns} value={ns}>
                      {ns}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant={missingOnly ? 'default' : 'outline'}
                onClick={() => setMissingOnly(!missingOnly)}
                className="w-full"
              >
                <AlertCircle className="h-4 w-4 ml-2" />
                الترجمات المفقودة فقط
              </Button>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setNamespace('');
                  setSearch('');
                  setMissingOnly(false);
                }}
                className="w-full"
              >
                إعادة تعيين
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>الترجمات</CardTitle>
          <CardDescription>
            عرض {translations.length} ترجمة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={translations} loading={loading} />
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTranslation ? 'تعديل الترجمة' : 'إضافة ترجمة جديدة'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>المفتاح *</Label>
              <Input
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder="auth.welcome"
                required
                disabled={!!editingTranslation}
              />
            </div>

            <div className="space-y-2">
              <Label>المساحة *</Label>
              <Select
                value={formData.namespace}
                onValueChange={(value) => setFormData({ ...formData, namespace: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NAMESPACES.map((ns) => (
                    <SelectItem key={ns} value={ns}>
                      {ns}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>النص بالعربية *</Label>
              <Textarea
                value={formData.ar}
                onChange={(e) => setFormData({ ...formData, ar: e.target.value })}
                placeholder="النص بالعربية"
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>النص بالإنجليزية *</Label>
              <Textarea
                value={formData.en}
                onChange={(e) => setFormData({ ...formData, en: e.target.value })}
                placeholder="English text"
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>الوصف</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف الترجمة"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                إلغاء
              </Button>
              <Button type="submit">
                {editingTranslation ? 'تحديث' : 'إضافة'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>استيراد ترجمات</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>بيانات JSON</Label>
              <Textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder={'{\n  "key1": { "ar": "نص1", "en": "Text1" },\n  "key2": { "ar": "نص2", "en": "Text2" }\n}'}
                rows={10}
                className="font-mono text-xs"
              />
            </div>

            <p className="text-sm text-muted-foreground">
              * سيتم استبدال الترجمات الموجودة بنفس المفتاح
            </p>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowImportDialog(false)}
              >
                إلغاء
              </Button>
              <Button onClick={handleImport}>استيراد</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
