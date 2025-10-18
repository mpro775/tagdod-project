import React, { useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Loading, Empty, Error } from '@/components/State';
import { Turnstile, useTurnstile } from '@/components/Security';
import { trackFormSubmit, trackWaitlistSignup } from '@/lib/analytics';

type DemoState = 'loading' | 'empty' | 'error' | 'success' | null;

const DemoPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentState, setCurrentState] = useState<DemoState>(null);
  const [email, setEmail] = useState('');
  const turnstile = useTurnstile();

  const handleStateChange = (state: DemoState) => {
    setCurrentState(state);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!turnstile.isVerified) {
      alert('يرجى إكمال التحقق الأمني');
      return;
    }

    trackFormSubmit('waitlist_signup');
    trackWaitlistSignup(email, 'demo_page');
    
    setCurrentState('success');
  };

  const renderCurrentState = () => {
    switch (currentState) {
      case 'loading':
        return <Loading message="جاري التحميل..." />;
      
      case 'empty':
        return (
          <Empty
            message="لا توجد بيانات"
            description="لم يتم العثور على أي عناصر في هذه القائمة"
            actionLabel="إضافة عنصر جديد"
            onAction={() => setCurrentState(null)}
          />
        );
      
      case 'error':
        return (
          <Error
            message="حدث خطأ"
            description="حدث خطأ أثناء تحميل البيانات"
            onRetry={() => setCurrentState(null)}
            error="Network Error: Connection timeout"
            showDetails
          />
        );
      
      case 'success':
        return (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="success.main">
              ✅ تم الإرسال بنجاح!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              شكراً لك على التسجيل في قائمة الانتظار
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => setCurrentState(null)}
              sx={{ mt: 2 }}
            >
              إعادة المحاولة
            </Button>
          </Box>
        );
      
      default:
        return (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              اختر حالة للعرض
            </Typography>
            <Typography variant="body2" color="text.secondary">
              استخدم الأزرار أدناه لاختبار مكونات الحالة المختلفة
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        صفحة التجربة
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        هذه الصفحة تعرض مكونات الحالة الموحدة والتحقق الأمني
      </Typography>

      <Grid container spacing={3}>
        {/* State Components Demo */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                مكونات الحالة الموحدة
              </Typography>
              
              <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button 
                  variant="outlined" 
                  onClick={() => handleStateChange('loading')}
                  disabled={currentState === 'loading'}
                >
                  Loading
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => handleStateChange('empty')}
                  disabled={currentState === 'empty'}
                >
                  Empty
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => handleStateChange('error')}
                  disabled={currentState === 'error'}
                >
                  Error
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => handleStateChange(null)}
                >
                  Reset
                </Button>
              </Box>

              <Box sx={{ minHeight: 300, border: '1px dashed #ccc', borderRadius: 1 }}>
                {renderCurrentState()}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Turnstile Demo */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                التحقق الأمني
              </Typography>
              
              <form onSubmit={handleFormSubmit}>
                <TextField
                  fullWidth
                  label="البريد الإلكتروني"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />

                <Turnstile
                  onVerify={turnstile.handleVerify}
                  onError={turnstile.handleError}
                  onExpire={turnstile.handleExpire}
                  sx={{ mb: 2 }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={!turnstile.isVerified}
                >
                  {turnstile.isVerified ? 'إرسال' : 'أكمل التحقق أولاً'}
                </Button>
              </form>

              {turnstile.isVerified && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="success.contrastText">
                    ✅ التحقق الأمني مكتمل
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Responsive Lists Demo */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                تجربة القوائم المتجاوبة
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                اختبر النظام الجديد للقوائم المتجاوبة التي تتحول تلقائياً من DataGrid إلى البطاقات على الموبايل
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/demo/responsive-lists')}
                sx={{ mt: 1 }}
              >
                تجربة القوائم المتجاوبة
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DemoPage;
