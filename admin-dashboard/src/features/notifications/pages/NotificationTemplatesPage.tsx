import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Send,
  Code
} from '@mui/icons-material';
import { useNotificationTemplates, useTestNotification } from '../hooks/useNotifications';
import { NotificationTemplate } from '../types/notification.types';

export const NotificationTemplatesPage: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testUserId, setTestUserId] = useState('');

  const { data: templates = [], isLoading } = useNotificationTemplates();
  const { mutate: testNotification, isPending: isTesting } = useTestNotification();

  const handleTestTemplate = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setTestDialogOpen(true);
  };

  const handleSendTest = () => {
    if (selectedTemplate && testUserId) {
      testNotification(
        { 
          userId: testUserId, 
          templateKey: selectedTemplate.key,
          payload: {
            orderId: 'TEST-123',
            amount: '150',
            currency: 'SAR',
            requestId: 'REQ-456'
          }
        },
        {
          onSuccess: () => {
            setTestDialogOpen(false);
            setTestUserId('');
            setSelectedTemplate(null);
          }
        }
      );
    }
  };

  const getTemplateDescription = (key: string) => {
    const descriptions: Record<string, string> = {
      ORDER_CONFIRMED: 'إشعار تأكيد الطلب',
      ORDER_SHIPPED: 'إشعار شحن الطلب',
      ORDER_DELIVERED: 'إشعار تسليم الطلب',
      SERVICE_REQUEST_OPENED: 'إشعار فتح طلب خدمة',
      NEW_ENGINEER_OFFER: 'إشعار عرض مهندس جديد',
      OFFER_ACCEPTED: 'إشعار قبول العرض',
      SERVICE_STARTED: 'إشعار بدء الخدمة',
      SERVICE_COMPLETED: 'إشعار اكتمال الخدمة',
      SERVICE_RATED: 'إشعار تسجيل التقييم',
      SERVICE_REQUEST_CANCELLED: 'إشعار إلغاء طلب الخدمة'
    };
    return descriptions[key] || 'قالب مخصص';
  };

  const getTemplateCategory = (key: string) => {
    if (key.includes('ORDER')) return 'الطلبات';
    if (key.includes('SERVICE')) return 'الخدمات';
    return 'عام';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'الطلبات': return 'primary';
      case 'الخدمات': return 'success';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>جاري تحميل القوالب...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          قوالب الإشعارات
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setEditDialogOpen(true)}
        >
          إضافة قالب جديد
        </Button>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        إدارة قوالب الإشعارات المستخدمة في النظام. يمكنك تعديل القوالب الموجودة أو إضافة قوالب جديدة.
      </Typography>

      {templates.length > 0 ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 2 }}>
          {templates.map((template) => (
            <Card key={template.key} sx={{ height: 'fit-content' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {template.title}
                    </Typography>
                    <Chip 
                      label={getTemplateCategory(template.key)}
                      size="small"
                      color={getCategoryColor(getTemplateCategory(template.key)) as any}
                      sx={{ mb: 1 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="اختبار القالب">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleTestTemplate(template)}
                      >
                        <Send fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="تعديل">
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {getTemplateDescription(template.key)}
                </Typography>

                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
                  المحتوى:
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    bgcolor: 'grey.100', 
                    p: 1, 
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }}
                >
                  {template.body}
                </Typography>

                {template.hasLink && (
                  <Chip 
                    label="يحتوي على رابط" 
                    size="small" 
                    color="info" 
                    sx={{ mt: 1 }}
                    icon={<Code />}
                  />
                )}

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  المفتاح: {template.key}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Alert severity="info">
          لا توجد قوالب متاحة حالياً
        </Alert>
      )}

      {/* Test Template Dialog */}
      <Dialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>اختبار القالب</DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Alert severity="info">
                سيتم إرسال تنبيه تجريبي باستخدام هذا القالب
              </Alert>
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  القالب المحدد:
                </Typography>
                <Typography variant="body2" sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                  {selectedTemplate.title}
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="معرف المستخدم للاختبار"
                value={testUserId}
                onChange={(e) => setTestUserId(e.target.value)}
                placeholder="أدخل معرف المستخدم"
                required
                helperText="معرف المستخدم الذي سيستقبل التنبيه التجريبي"
              />

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  معاينة المحتوى:
                </Typography>
                <Typography variant="body2" sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                  <strong>{selectedTemplate.title}</strong>
                  <br />
                  {selectedTemplate.body.replace(/\{\{\s*\w+\s*\}\}/g, '[متغير]')}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>
            إلغاء
          </Button>
          <Button 
            onClick={handleSendTest}
            variant="contained"
            disabled={!testUserId || isTesting}
            startIcon={<Send />}
          >
            {isTesting ? 'جاري الإرسال...' : 'إرسال اختبار'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTemplate ? 'تعديل القالب' : 'إضافة قالب جديد'}
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            تحذير: تعديل القوالب الموجودة قد يؤثر على الإشعارات الموجودة في النظام
          </Alert>
          
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="مفتاح القالب"
              value={selectedTemplate?.key || ''}
              placeholder="ORDER_CONFIRMED"
              disabled={!!selectedTemplate}
              helperText="معرف فريد للقالب (لا يمكن تغييره بعد الإنشاء)"
            />

            <TextField
              fullWidth
              label="عنوان الإشعار"
              value={selectedTemplate?.title || ''}
              placeholder="تم تأكيد طلبك"
              helperText="العنوان الذي سيظهر في الإشعار"
            />

            <TextField
              fullWidth
              label="محتوى الإشعار"
              value={selectedTemplate?.body || ''}
              placeholder="رقم الطلب {{orderId}} بمبلغ {{amount}} {{currency}}"
              multiline
              rows={4}
              helperText="استخدم {{متغير}} لإدراج المتغيرات الديناميكية"
            />

            <Alert severity="info">
              المتغيرات المتاحة: orderId, amount, currency, requestId, engineerName
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            إلغاء
          </Button>
          <Button variant="contained">
            {selectedTemplate ? 'تحديث' : 'إنشاء'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
