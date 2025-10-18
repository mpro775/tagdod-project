import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
} from '@mui/material';
import { Settings as SettingsIcon, Language, Palette, Security, Analytics } from '@mui/icons-material';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';

const SettingsPage: React.FC = () => {
  const { theme, toggleTheme, language, setLanguage } = useThemeStore();
  const { user } = useAuthStore();
  const [enableAnalytics, setEnableAnalytics] = useState(true);
  const [enableNotifications, setEnableNotifications] = useState(true);

  const handleLanguageChange = (event: any) => {
    setLanguage(event.target.value);
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleAnalyticsToggle = () => {
    setEnableAnalytics(!enableAnalytics);
  };

  const handleNotificationsToggle = () => {
    setEnableNotifications(!enableNotifications);
  };

  const environmentInfo = {
    'VITE_APP_NAME': import.meta.env.VITE_APP_NAME,
    'VITE_API_BASE_URL': import.meta.env.VITE_API_BASE_URL,
    'VITE_API_TIMEOUT': import.meta.env.VITE_API_TIMEOUT,
    'VITE_GA4_ID': import.meta.env.VITE_GA4_ID,
    'VITE_TURNSTILE_SITEKEY': import.meta.env.VITE_TURNSTILE_SITEKEY,
    'VITE_ENABLE_ANALYTICS': import.meta.env.VITE_ENABLE_ANALYTICS,
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <SettingsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          الإعدادات
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* User Profile Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security />
                معلومات المستخدم
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  الاسم
                </Typography>
                <Typography variant="body1">
                  {user?.name || 'غير محدد'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  البريد الإلكتروني
                </Typography>
                <Typography variant="body1">
                  {user?.email || 'غير محدد'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  الأدوار
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  {user?.roles?.map((role) => (
                    <Chip
                      key={role}
                      label={role}
                      color={role === 'super_admin' ? 'error' : role === 'admin' ? 'warning' : 'default'}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Appearance Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Palette />
                المظهر
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>اللغة</InputLabel>
                <Select
                  value={language}
                  label="اللغة"
                  onChange={handleLanguageChange}
                >
                  <MenuItem value="ar">العربية</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={theme === 'dark'}
                    onChange={handleThemeToggle}
                  />
                }
                label={theme === 'dark' ? 'الوضع المظلم' : 'الوضع الفاتح'}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Preferences */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Analytics />
                التفضيلات
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={enableAnalytics}
                    onChange={handleAnalyticsToggle}
                  />
                }
                label="تفعيل التحليلات"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={enableNotifications}
                    onChange={handleNotificationsToggle}
                  />
                }
                label="تفعيل الإشعارات"
                sx={{ display: 'block', mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Environment Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SettingsIcon />
                معلومات البيئة
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {Object.entries(environmentInfo).map(([key, value]) => (
                  <Box key={key} sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                      {key}:
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {value || 'غير محدد'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                الإجراءات
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="outlined" color="primary">
                  تصدير الإعدادات
                </Button>
                <Button variant="outlined" color="secondary">
                  استيراد الإعدادات
                </Button>
                <Button variant="outlined" color="error">
                  إعادة تعيين الإعدادات
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage;
