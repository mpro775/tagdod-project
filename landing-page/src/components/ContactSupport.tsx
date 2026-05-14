import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  MenuItem,
  Stack,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SendIcon from '@mui/icons-material/Send';
import { landingService } from '../services/landing.service';
import type { ContactRequestPayload, ContactInfo } from '../types/landing';

interface ContactSupportProps {
  contactInfo: ContactInfo | null;
}

const requestTypes = [
  { value: 'general', label: 'استفسار عام' },
  { value: 'technical_support', label: 'دعم فني' },
  { value: 'service_center', label: 'مركز صيانة' },
  { value: 'maintenance', label: 'طلب صيانة' },
  { value: 'contracting', label: 'طلب مقاولة' },
  { value: 'partnership', label: 'شراكة' },
  { value: 'other', label: 'أخرى' },
];

const ContactSupport: React.FC<ContactSupportProps> = ({ contactInfo }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [formData, setFormData] = useState<Omit<ContactRequestPayload, 'requestType'> & { requestType: ContactRequestPayload['requestType'] }>({
    name: '',
    phone: '',
    email: '',
    city: '',
    requestType: 'general',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await landingService.submitContactRequest({
        ...formData,
        source: 'landing_page',
      } as ContactRequestPayload);

      if (response.success) {
        setSubmitStatus('success');
        setSubmitMessage(response.message || 'تم إرسال طلبك بنجاح، سنتواصل معك قريبًا');
        setFormData({
          name: '',
          phone: '',
          email: '',
          city: '',
          requestType: 'general',
          message: '',
        });
      } else {
        setSubmitStatus('error');
        setSubmitMessage(response.message || 'حدث خطأ أثناء الإرسال');
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage(error instanceof Error ? error.message : 'حدث خطأ أثناء الإرسال');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      id="contact"
      sx={{
        py: { xs: 10, md: 14 },
        bgcolor: isDark ? '#0d1117' : '#f5f7fa',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          textAlign="center"
          mb={8}
        >
          <Typography
            variant="overline"
            sx={{
              color: 'primary.main',
              fontWeight: 600,
              letterSpacing: 2,
              mb: 2,
              display: 'block',
            }}
          >
            تواصل معنا
          </Typography>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              color: 'text.primary',
            }}
          >
            نحن هنا لمساعدتك
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              maxWidth: 600,
              mx: 'auto',
              fontWeight: 400,
              lineHeight: 1.8,
            }}
          >
            أرسل لنا استفسارك أو طلبك وسنتواصل معك في أقرب وقت ممكن
          </Typography>
        </Box>

        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper
              component={motion.div}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              elevation={0}
              sx={{
                p: 4,
                height: '100%',
                borderRadius: 4,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              }}
            >
              <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: 'text.primary' }}>
                معلومات التواصل
              </Typography>

              <Stack spacing={3} sx={{ mt: 3 }}>
                {contactInfo?.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: 3,
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                      }}
                    >
                      <EmailIcon />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        البريد الإلكتروني
                      </Typography>
                      <Typography variant="body1" fontWeight={500} sx={{ color: 'text.primary' }}>
                        {contactInfo.email}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {contactInfo?.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: 3,
                        bgcolor: 'secondary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1a1a2e',
                      }}
                    >
                      <PhoneIcon />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        رقم الهاتف
                      </Typography>
                      <Typography variant="body1" fontWeight={500} sx={{ color: 'text.primary' }}>
                        {contactInfo.phone}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {contactInfo?.addressAr && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: 3,
                        bgcolor: 'error.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                      }}
                    >
                      <LocationOnIcon />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        العنوان
                      </Typography>
                      <Typography variant="body1" fontWeight={500} sx={{ color: 'text.primary' }}>
                        {contactInfo.addressAr}
                        {contactInfo.cityAr ? `، ${contactInfo.cityAr}` : ''}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {contactInfo?.workingHoursAr && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: 3,
                        bgcolor: 'warning.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z" />
                      </svg>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        أوقات الدوام
                      </Typography>
                      <Typography variant="body1" fontWeight={500} sx={{ color: 'text.primary' }}>
                        {contactInfo.workingHoursAr}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Paper
              component={motion.div}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              }}
            >
              <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: 'text.primary' }}>
                أرسل طلبك
              </Typography>

              {submitStatus === 'success' && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {submitMessage}
                </Alert>
              )}

              {submitStatus === 'error' && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {submitMessage}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="الاسم"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="رقم الهاتف"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="البريد الإلكتروني (اختياري)"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="المدينة (اختياري)"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      select
                      label="نوع الطلب"
                      name="requestType"
                      value={formData.requestType}
                      onChange={handleChange}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    >
                      {requestTypes.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="الرسالة"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      multiline
                      rows={4}
                      variant="outlined"
                      sx={{ mb: 3 }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      endIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                      disabled={isSubmitting}
                      fullWidth
                      sx={{
                        py: 1.75,
                        borderRadius: 3,
                        fontWeight: 600,
                        fontSize: '1.05rem',
                        background: 'linear-gradient(135deg, #1A8BC2 0%, #4DB8E6 100%)',
                        boxShadow: '0 8px 25px rgba(26, 139, 194, 0.3)',
                        '&:hover': {
                          boxShadow: '0 12px 35px rgba(26, 139, 194, 0.4)',
                        },
                      }}
                    >
                      {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ContactSupport;
