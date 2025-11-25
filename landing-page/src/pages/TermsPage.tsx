import React from 'react';
import { Box, Container, Typography, Paper, Divider } from '@mui/material';

const TermsPage: React.FC = () => {
  return (
    <Box sx={{ py: 8, bgcolor: 'background.default', minHeight: '80vh' }}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4 }}>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom color="primary">
            الأحكام والشروط
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            آخر تحديث: {new Date().toLocaleDateString('ar-EG')}
          </Typography>
          
          <Divider sx={{ my: 4 }} />

          <Box sx={{ '& > h6': { mt: 4, mb: 2, fontWeight: 'bold' }, '& > p': { mb: 2, lineHeight: 1.8, color: 'text.secondary' } }}>
            <Typography variant="h6">1. مقدمة</Typography>
            <Typography variant="body1">
              مرحباً بكم في تطبيق تجدد. تحكم هذه الشروط والأحكام استخدامكم لتطبيقنا وخدماتنا. باستخدام التطبيق، فإنكم توافقون على هذه الشروط بالكامل.
            </Typography>

            <Typography variant="h6">2. الحساب والتسجيل</Typography>
            <Typography variant="body1">
              يجب عليكم تقديم معلومات دقيقة وكاملة عند إنشاء حساب. أنتم مسؤولون عن الحفاظ على سرية حسابكم وكلمة المرور الخاصة بكم.
            </Typography>

            <Typography variant="h6">3. المنتجات والخدمات</Typography>
            <Typography variant="body1">
              نسعى جاهدين لعرض منتجاتنا بأكبر قدر ممكن من الدقة. ومع ذلك، لا نضمن أن أوصاف المنتجات أو أي محتوى آخر دقيق أو كامل أو موثوق أو حديث أو خالي من الأخطاء.
            </Typography>

            <Typography variant="h6">4. الملكية الفكرية</Typography>
            <Typography variant="body1">
              جميع المحتويات الموجودة في التطبيق، بما في ذلك النصوص والرسومات والشعارات والصور، هي ملك لشركة تجدد ومحمية بموجب قوانين حقوق النشر.
            </Typography>

            <Typography variant="h6">5. التعديلات</Typography>
            <Typography variant="body1">
              نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم نشر التغييرات على هذه الصفحة، ويعتبر استمرار استخدامكم للتطبيق قبولاً لهذه التغييرات.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default TermsPage;
