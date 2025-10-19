import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CircularProgress, Typography } from '@mui/material';
import { Button } from '@mui/material';
import { Input } from '@mui/material';
import { Alert } from '@mui/material';
import { Save, AttachMoney } from '@mui/icons-material';

interface ExchangeRates {
  usdToYer: number;
  usdToSar: number;
  lastUpdated?: string;
}

export default function SimpleExchangeRatesPage() {
  const [rates, setRates] = useState<ExchangeRates>({
    usdToYer: 250,
    usdToSar: 3.75,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchCurrentRates();
  }, []);

  const fetchCurrentRates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/exchange-rates');
      if (response.ok) {
        const data = await response.json();
        setRates({
          usdToYer: data.usdToYer,
          usdToSar: data.usdToSar,
          lastUpdated: data.lastUpdatedAt,
        });
      }
    } catch {
      setMessage({ type: 'error', text: 'فشل في جلب أسعار الصرف' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch('/api/admin/exchange-rates/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usdToYer: rates.usdToYer,
          usdToSar: rates.usdToSar,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'تم تحديث أسعار الصرف بنجاح' });
        await fetchCurrentRates();
      } else {
        throw new Error('فشل في تحديث أسعار الصرف');
      }
    } catch {
      setMessage({ type: 'error', text: 'فشل في تحديث أسعار الصرف' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ExchangeRates, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setRates((prev) => ({ ...prev, [field]: numValue }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <CircularProgress className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">إدارة أسعار الصرف</h1>
        <p className="text-gray-600 mt-2">قم بتحديث أسعار الصرف للعملات المدعومة</p>
      </div>

      {message && (
        <Alert
          className={`mb-6 ${
            message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
          }`}
        >
          <Typography className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
            {message.text}
          </Typography>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <Typography className="flex items-center gap-2">
            <AttachMoney className="h-5 w-5" />
            أسعار الصرف الحالية
          </Typography>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* الدولار إلى الريال اليمني */}
            <div className="space-y-2">
              <Typography component="label" htmlFor="usdToYer" className="text-sm font-medium">
                الدولار الأمريكي إلى الريال اليمني
              </Typography>
              <div className="relative">
                <Input
                  id="usdToYer"
                  type="number"
                  inputProps={{
                    step: '0.01',
                    min: '0.01',
                  }}
                  value={rates.usdToYer}
                  onChange={(e) => handleInputChange('usdToYer', e.target.value)}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  ر.ي
                </span>
              </div>
              <p className="text-xs text-gray-500">1 دولار = {rates.usdToYer} ريال يمني</p>
            </div>

            {/* الدولار إلى الريال السعودي */}
            <div className="space-y-2">
              <Typography component="label" htmlFor="usdToSar" className="text-sm font-medium">
                الدولار الأمريكي إلى الريال السعودي
              </Typography>
              <div className="relative">
                <Input
                  id="usdToSar"
                  type="number"
                  inputProps={{
                    step: '0.01',
                    min: '0.01',
                  }}
                  value={rates.usdToSar}
                  onChange={(e) => handleInputChange('usdToSar', e.target.value)}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  ر.س
                </span>
              </div>
              <p className="text-xs text-gray-500">1 دولار = {rates.usdToSar} ريال سعودي</p>
            </div>
          </div>

          {rates.lastUpdated && (
            <div className="text-sm text-gray-500 border-t pt-4">
              آخر تحديث: {new Date(rates.lastUpdated).toLocaleString('ar-SA')}
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
              {saving ? <CircularProgress className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* معلومات إضافية */}
      <Card className="mt-6">
        <CardHeader>
          <Typography>معلومات مهمة</Typography>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• جميع المنتجات في النظام تسعر بالدولار الأمريكي</li>
            <li>• سيتم تحويل الأسعار تلقائياً للعملاء حسب العملة المختارة</li>
            <li>• تحديث الأسعار يؤثر على جميع المنتجات والفواتير فوراً</li>
            <li>• تأكد من صحة الأسعار قبل الحفظ</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
