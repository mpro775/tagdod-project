import React from 'react';
import { Box, Container, Typography, Paper, Divider } from '@mui/material';

const PrivacyPage: React.FC = () => {
  return (
    <Box sx={{ py: 8, bgcolor: 'background.default', minHeight: '80vh' }}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4 }}>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom color="primary">
            سياسة الخصوصية
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            آخر تحديث: {new Date().toLocaleDateString('ar-EG')}
          </Typography>
          
          <Divider sx={{ my: 4 }} />

          <Box sx={{ '& > h6': { mt: 4, mb: 2, fontWeight: 'bold' }, '& > p': { mb: 2, lineHeight: 1.8, color: 'text.secondary' } }}>
            <Typography variant="h6">1. مقدمة</Typography>
            <Typography variant="body1">
              نحن في تجدد نلتزم بحماية خصوصيتكم. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتكم الشخصية عند استخدام تطبيقنا وخدماتنا.
            </Typography>

            <Typography variant="h6">2. المعلومات التي نجمعها</Typography>
            <Typography variant="body1">
              نجمع أنواعاً مختلفة من المعلومات لتوفير وتحسين خدماتنا:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 4, mb: 2 }}>
              <li>المعلومات الشخصية: الاسم، البريد الإلكتروني، رقم الهاتف، العنوان</li>
              <li>معلومات الحساب: اسم المستخدم، كلمة المرور (مشفرة)</li>
              <li>معلومات الاستخدام: سجل الأنشطة، التفضيلات، التفاعلات مع التطبيق</li>
              <li>معلومات الجهاز: نوع الجهاز، نظام التشغيل، معرف الجهاز الفريد</li>
            </Typography>

            <Typography variant="h6">3. كيفية استخدام المعلومات</Typography>
            <Typography variant="body1">
              نستخدم المعلومات التي نجمعها لـ:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 4, mb: 2 }}>
              <li>توفير وصيانة وتحسين خدماتنا</li>
              <li>معالجة الطلبات والمدفوعات</li>
              <li>إرسال الإشعارات والتحديثات</li>
              <li>تحليل استخدام التطبيق لتحسين تجربة المستخدم</li>
              <li>الامتثال للالتزامات القانونية</li>
            </Typography>

            <Typography variant="h6">4. مشاركة المعلومات</Typography>
            <Typography variant="body1">
              نحن لا نبيع معلوماتكم الشخصية. قد نشارك معلوماتكم فقط في الحالات التالية:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 4, mb: 2 }}>
              <li>مع مقدمي الخدمات الموثوقين الذين يساعدوننا في تشغيل خدماتنا</li>
              <li>عندما يتطلب القانون ذلك أو لحماية حقوقنا</li>
              <li>مع موافقتكم الصريحة</li>
            </Typography>

            <Typography variant="h6">5. أمان المعلومات</Typography>
            <Typography variant="body1">
              نتخذ تدابير أمنية مناسبة لحماية معلوماتكم الشخصية من الوصول غير المصرح به أو التغيير أو الكشف أو التدمير. ومع ذلك، لا يمكن ضمان الأمان المطلق لأي معلومات عبر الإنترنت.
            </Typography>

            <Typography variant="h6">6. حقوقكم</Typography>
            <Typography variant="body1">
              لديكم الحق في:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 4, mb: 2 }}>
              <li>الوصول إلى معلوماتكم الشخصية</li>
              <li>تصحيح المعلومات غير الدقيقة</li>
              <li>طلب حذف معلوماتكم الشخصية</li>
              <li>الاعتراض على معالجة معلوماتكم</li>
              <li>طلب نقل بياناتكم</li>
            </Typography>

            <Typography variant="h6">7. ملفات تعريف الارتباط</Typography>
            <Typography variant="body1">
              نستخدم ملفات تعريف الارتباط (Cookies) لتتبع نشاطكم على التطبيق وتحسين تجربتكم. يمكنكم تعطيل ملفات تعريف الارتباط من خلال إعدادات المتصفح.
            </Typography>

            <Typography variant="h6">8. التغييرات على سياسة الخصوصية</Typography>
            <Typography variant="body1">
              قد نحدث سياسة الخصوصية هذه من وقت لآخر. سنخطركم بأي تغييرات من خلال نشر السياسة الجديدة على هذه الصفحة وتحديث تاريخ "آخر تحديث".
            </Typography>

            <Typography variant="h6">9. الاتصال بنا</Typography>
            <Typography variant="body1">
              إذا كان لديكم أي أسئلة حول سياسة الخصوصية هذه، يرجى الاتصال بنا عبر البريد الإلكتروني أو من خلال قسم الدعم في التطبيق.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PrivacyPage;

