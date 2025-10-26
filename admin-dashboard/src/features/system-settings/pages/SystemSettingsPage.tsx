import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Settings, Save, Mail, CreditCard, Truck, Shield, Bell, Search as SearchIcon } from 'lucide-react';
import { systemSettingsApi } from '../api/systemSettingsApi';
import type { SystemSetting } from '../api/systemSettingsApi';
import { toast } from 'sonner';

export function SystemSettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const allSettings = await systemSettingsApi.getAllSettings();
      
      const settingsMap: Record<string, any> = {};
      allSettings.forEach((setting: SystemSetting) => {
        settingsMap[setting.key] = setting.value;
      });
      
      setSettings(settingsMap);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('فشل في تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (category: string) => {
    try {
      setSaving(true);
      
      // Get all settings for this category
      const categorySettings: Record<string, any> = {};
      Object.keys(settings).forEach((key) => {
        // This is a simple approach - in production you'd want proper category mapping
        categorySettings[key] = settings[key];
      });

      await systemSettingsApi.bulkUpdate(categorySettings);
      toast.success('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      toast.error('فشل في حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Settings className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">إعدادات النظام</h1>
        <p className="text-muted-foreground">
          إدارة جميع إعدادات النظام من مكان واحد
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 ml-2" />
            عام
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 ml-2" />
            البريد
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="h-4 w-4 ml-2" />
            الدفع
          </TabsTrigger>
          <TabsTrigger value="shipping">
            <Truck className="h-4 w-4 ml-2" />
            الشحن
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 ml-2" />
            الأمان
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 ml-2" />
            الإشعارات
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>الإعدادات العامة</CardTitle>
              <CardDescription>إعدادات الموقع الأساسية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>اسم الموقع</Label>
                  <Input
                    value={settings.site_name || ''}
                    onChange={(e) => updateSetting('site_name', e.target.value)}
                    placeholder="TagDoD"
                  />
                </div>

                <div className="space-y-2">
                  <Label>وصف الموقع</Label>
                  <Input
                    value={settings.site_description || ''}
                    onChange={(e) => updateSetting('site_description', e.target.value)}
                    placeholder="منصة خدمات الطاقة الشمسية"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>اللغة الافتراضية</Label>
                    <Input
                      value={settings.default_language || ''}
                      onChange={(e) => updateSetting('default_language', e.target.value)}
                      placeholder="ar"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>العملة الافتراضية</Label>
                    <Input
                      value={settings.default_currency || ''}
                      onChange={(e) => updateSetting('default_currency', e.target.value)}
                      placeholder="YER"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>المنطقة الزمنية</Label>
                  <Input
                    value={settings.timezone || ''}
                    onChange={(e) => updateSetting('timezone', e.target.value)}
                    placeholder="Asia/Aden"
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>وضع الصيانة</Label>
                    <p className="text-sm text-muted-foreground">
                      تفعيل وضع الصيانة للموقع
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenance_mode || false}
                    onCheckedChange={(checked) => updateSetting('maintenance_mode', checked)}
                  />
                </div>

                {settings.maintenance_mode && (
                  <div className="space-y-2">
                    <Label>رسالة وضع الصيانة</Label>
                    <Input
                      value={settings.maintenance_message || ''}
                      onChange={(e) => updateSetting('maintenance_message', e.target.value)}
                      placeholder="الموقع تحت الصيانة..."
                    />
                  </div>
                )}
              </div>

              <Button onClick={() => handleSave('general')} disabled={saving}>
                <Save className="h-4 w-4 ml-2" />
                حفظ الإعدادات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات البريد الإلكتروني</CardTitle>
              <CardDescription>إعدادات SMTP والبريد</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SMTP Host</Label>
                    <Input
                      value={settings.smtp_host || ''}
                      onChange={(e) => updateSetting('smtp_host', e.target.value)}
                      placeholder="smtp.gmail.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>SMTP Port</Label>
                    <Input
                      type="number"
                      value={settings.smtp_port || ''}
                      onChange={(e) => updateSetting('smtp_port', parseInt(e.target.value))}
                      placeholder="587"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>SMTP User</Label>
                  <Input
                    value={settings.smtp_user || ''}
                    onChange={(e) => updateSetting('smtp_user', e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label>SMTP Password</Label>
                  <Input
                    type="password"
                    value={settings.smtp_password || ''}
                    onChange={(e) => updateSetting('smtp_password', e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>بريد المرسل</Label>
                    <Input
                      value={settings.from_email || ''}
                      onChange={(e) => updateSetting('from_email', e.target.value)}
                      placeholder="noreply@tagdod.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>اسم المرسل</Label>
                    <Input
                      value={settings.from_name || ''}
                      onChange={(e) => updateSetting('from_name', e.target.value)}
                      placeholder="TagDoD"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>SMTP Secure (TLS)</Label>
                    <p className="text-sm text-muted-foreground">
                      استخدام اتصال آمن
                    </p>
                  </div>
                  <Switch
                    checked={settings.smtp_secure || false}
                    onCheckedChange={(checked) => updateSetting('smtp_secure', checked)}
                  />
                </div>
              </div>

              <Button onClick={() => handleSave('email')} disabled={saving}>
                <Save className="h-4 w-4 ml-2" />
                حفظ الإعدادات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الدفع</CardTitle>
              <CardDescription>إعدادات طرق الدفع</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>الدفع عند الاستلام (COD)</Label>
                    <p className="text-sm text-muted-foreground">
                      تفعيل خيار الدفع عند الاستلام
                    </p>
                  </div>
                  <Switch
                    checked={settings.cod_enabled || false}
                    onCheckedChange={(checked) => updateSetting('cod_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>الدفع بالبطاقات</Label>
                    <p className="text-sm text-muted-foreground">
                      تفعيل الدفع بالبطاقات الائتمانية
                    </p>
                  </div>
                  <Switch
                    checked={settings.card_enabled || false}
                    onCheckedChange={(checked) => updateSetting('card_enabled', checked)}
                  />
                </div>

                {settings.card_enabled && (
                  <>
                    <div className="space-y-2">
                      <Label>Stripe Public Key</Label>
                      <Input
                        value={settings.stripe_public_key || ''}
                        onChange={(e) => updateSetting('stripe_public_key', e.target.value)}
                        placeholder="pk_..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Stripe Secret Key</Label>
                      <Input
                        type="password"
                        value={settings.stripe_secret_key || ''}
                        onChange={(e) => updateSetting('stripe_secret_key', e.target.value)}
                        placeholder="sk_..."
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label>رسوم الدفع (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.payment_fee_percentage || ''}
                    onChange={(e) => updateSetting('payment_fee_percentage', parseFloat(e.target.value))}
                    placeholder="2.5"
                  />
                </div>
              </div>

              <Button onClick={() => handleSave('payment')} disabled={saving}>
                <Save className="h-4 w-4 ml-2" />
                حفظ الإعدادات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الشحن</CardTitle>
              <CardDescription>إعدادات الشحن والتوصيل</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>الشحن المجاني</Label>
                    <p className="text-sm text-muted-foreground">
                      تفعيل الشحن المجاني
                    </p>
                  </div>
                  <Switch
                    checked={settings.free_shipping_enabled || false}
                    onCheckedChange={(checked) => updateSetting('free_shipping_enabled', checked)}
                  />
                </div>

                {settings.free_shipping_enabled && (
                  <div className="space-y-2">
                    <Label>الحد الأدنى للشحن المجاني (ريال)</Label>
                    <Input
                      type="number"
                      value={settings.free_shipping_threshold || ''}
                      onChange={(e) => updateSetting('free_shipping_threshold', parseInt(e.target.value))}
                      placeholder="100000"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>تكلفة الشحن الافتراضية (ريال)</Label>
                  <Input
                    type="number"
                    value={settings.default_shipping_cost || ''}
                    onChange={(e) => updateSetting('default_shipping_cost', parseInt(e.target.value))}
                    placeholder="5000"
                  />
                </div>

                <div className="space-y-2">
                  <Label>مدة التوصيل المتوقعة (أيام)</Label>
                  <Input
                    type="number"
                    value={settings.estimated_delivery_days || ''}
                    onChange={(e) => updateSetting('estimated_delivery_days', parseInt(e.target.value))}
                    placeholder="3"
                  />
                </div>
              </div>

              <Button onClick={() => handleSave('shipping')} disabled={saving}>
                <Save className="h-4 w-4 ml-2" />
                حفظ الإعدادات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الأمان</CardTitle>
              <CardDescription>إعدادات الأمان والحماية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>المصادقة الثنائية (2FA)</Label>
                    <p className="text-sm text-muted-foreground">
                      إجبار المصادقة الثنائية لجميع المستخدمين
                    </p>
                  </div>
                  <Switch
                    checked={settings.force_2fa || false}
                    onCheckedChange={(checked) => updateSetting('force_2fa', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>مدة صلاحية الجلسة (دقائق)</Label>
                  <Input
                    type="number"
                    value={settings.session_timeout || ''}
                    onChange={(e) => updateSetting('session_timeout', parseInt(e.target.value))}
                    placeholder="60"
                  />
                </div>

                <div className="space-y-2">
                  <Label>الحد الأقصى لمحاولات الدخول</Label>
                  <Input
                    type="number"
                    value={settings.max_login_attempts || ''}
                    onChange={(e) => updateSetting('max_login_attempts', parseInt(e.target.value))}
                    placeholder="5"
                  />
                </div>

                <div className="space-y-2">
                  <Label>مدة الحظر بعد الفشل (دقائق)</Label>
                  <Input
                    type="number"
                    value={settings.lockout_duration || ''}
                    onChange={(e) => updateSetting('lockout_duration', parseInt(e.target.value))}
                    placeholder="15"
                  />
                </div>
              </div>

              <Button onClick={() => handleSave('security')} disabled={saving}>
                <Save className="h-4 w-4 ml-2" />
                حفظ الإعدادات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الإشعارات</CardTitle>
              <CardDescription>إدارة الإشعارات والتنبيهات</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>إشعارات البريد الإلكتروني</Label>
                    <p className="text-sm text-muted-foreground">
                      تفعيل الإشعارات عبر البريد
                    </p>
                  </div>
                  <Switch
                    checked={settings.email_notifications_enabled || false}
                    onCheckedChange={(checked) => updateSetting('email_notifications_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>إشعارات SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      تفعيل الإشعارات عبر الرسائل النصية
                    </p>
                  </div>
                  <Switch
                    checked={settings.sms_notifications_enabled || false}
                    onCheckedChange={(checked) => updateSetting('sms_notifications_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>إشعارات Push</Label>
                    <p className="text-sm text-muted-foreground">
                      تفعيل الإشعارات الفورية
                    </p>
                  </div>
                  <Switch
                    checked={settings.push_notifications_enabled || false}
                    onCheckedChange={(checked) => updateSetting('push_notifications_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>إشعار الطلبات الجديدة</Label>
                    <p className="text-sm text-muted-foreground">
                      إشعار عند استلام طلب جديد
                    </p>
                  </div>
                  <Switch
                    checked={settings.notify_new_orders || false}
                    onCheckedChange={(checked) => updateSetting('notify_new_orders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>إشعار المخزون المنخفض</Label>
                    <p className="text-sm text-muted-foreground">
                      إشعار عند انخفاض المخزون
                    </p>
                  </div>
                  <Switch
                    checked={settings.notify_low_stock || false}
                    onCheckedChange={(checked) => updateSetting('notify_low_stock', checked)}
                  />
                </div>
              </div>

              <Button onClick={() => handleSave('notifications')} disabled={saving}>
                <Save className="h-4 w-4 ml-2" />
                حفظ الإعدادات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
