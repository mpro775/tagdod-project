import React from 'react';
import { Box, Container, Typography, Paper, Divider, Alert, Button, Stack } from '@mui/material';
import { Warning, DeleteForever, Info } from '@mui/icons-material';

const DeletedAccountPage: React.FC = () => {
  return (
    <Box sx={{ py: 8, bgcolor: 'background.default', minHeight: '80vh' }}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <DeleteForever color="error" sx={{ fontSize: 40 }} />
            <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
              كيفية حذف الحساب
            </Typography>
          </Box>
          
          <Alert severity="warning" icon={<Warning />} sx={{ mb: 4 }}>
            <Typography variant="body2" fontWeight="bold">
              تحذير: حذف الحساب عملية لا يمكن التراجع عنها
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              سيتم حذف جميع بياناتك ومعلوماتك بشكل نهائي ولا يمكن استعادتها.
            </Typography>
          </Alert>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ '& > h6': { mt: 4, mb: 2, fontWeight: 'bold' }, '& > p': { mb: 2, lineHeight: 1.8, color: 'text.secondary' } }}>
            <Typography variant="h6">خطوات حذف الحساب</Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              لحذف حسابك في تطبيق تجدد، اتبع الخطوات التالية:
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                1. تسجيل الدخول إلى حسابك
              </Typography>
              <Typography variant="body2" color="text.secondary">
                تأكد من تسجيل الدخول إلى حسابك في التطبيق باستخدام بيانات الاعتماد الخاصة بك.
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                2. الانتقال إلى إعدادات الحساب
              </Typography>
              <Typography variant="body2" color="text.secondary">
                افتح قائمة التطبيق وانتقل إلى "الإعدادات" أو "الملف الشخصي"، ثم اختر "إعدادات الحساب".
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                3. اختيار حذف الحساب
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ابحث عن خيار "حذف الحساب" أو "إلغاء الاشتراك" في أسفل صفحة الإعدادات.
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                4. تأكيد الحذف
              </Typography>
              <Typography variant="body2" color="text.secondary">
                سيطلب منك التطبيق تأكيد رغبتك في حذف الحساب. اقرأ التحذيرات بعناية وأدخل كلمة المرور لتأكيد العملية.
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                5. إتمام العملية
              </Typography>
              <Typography variant="body2" color="text.secondary">
                بعد التأكيد، سيتم حذف حسابك بشكل نهائي. قد تستغرق العملية بضع دقائق.
              </Typography>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" gutterBottom>ماذا يحدث عند حذف الحساب؟</Typography>
            <Alert severity="info" icon={<Info />} sx={{ mb: 3 }}>
              <Typography variant="body2" component="div">
                عند حذف حسابك، سيتم:
                <ul style={{ marginTop: 8, paddingRight: 20 }}>
                  <li>حذف جميع معلوماتك الشخصية</li>
                  <li>حذف سجل الطلبات والمشتريات</li>
                  <li>حذف التفضيلات والإعدادات</li>
                  <li>إلغاء جميع الاشتراكات النشطة</li>
                  <li>حذف جميع البيانات المرتبطة بحسابك</li>
                </ul>
              </Typography>
            </Alert>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>بدائل حذف الحساب</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              قبل حذف حسابك، قد ترغب في التفكير في البدائل التالية:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 4, mb: 2, color: 'text.secondary' }}>
              <li>تعطيل الإشعارات بدلاً من حذف الحساب</li>
              <li>تعديل إعدادات الخصوصية</li>
              <li>حذف معلومات معينة بدلاً من الحساب بالكامل</li>
              <li>التواصل مع الدعم للحصول على المساعدة</li>
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" gutterBottom>استعادة الحساب</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              بعد حذف الحساب، لا يمكن استعادته. إذا كنت تريد استخدام التطبيق مرة أخرى، ستحتاج إلى إنشاء حساب جديد.
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" gutterBottom>هل تحتاج مساعدة؟</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              إذا واجهت أي مشاكل أثناء محاولة حذف حسابك أو لديك أسئلة، يرجى التواصل مع فريق الدعم لدينا.
            </Typography>
            
            <Stack direction="row" spacing={2}>
              <Button variant="contained" color="primary">
                التواصل مع الدعم
              </Button>
              <Button variant="outlined" color="primary" href="/">
                العودة للصفحة الرئيسية
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default DeletedAccountPage;

