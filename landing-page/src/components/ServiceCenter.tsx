import React from 'react';
import { Box, Container, Typography, Grid, Paper, Stack, Button, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BuildIcon from '@mui/icons-material/Build';
import type { ServiceCenterData } from '../types/landing';

interface ServiceCenterProps {
  serviceCenter: ServiceCenterData | null;
}

const ServiceCenter: React.FC<ServiceCenterProps> = ({ serviceCenter }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!serviceCenter) return null;

  return (
    <Box
      id="service-center"
      sx={{
        py: { xs: 10, md: 14 },
        bgcolor: 'background.default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '-10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26, 139, 194, 0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

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
            مركز الصيانة
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
            {serviceCenter.titleAr}
          </Typography>
          {serviceCenter.descriptionAr && (
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
              {serviceCenter.descriptionAr}
            </Typography>
          )}
        </Box>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
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
                {serviceCenter.phone && (
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
                      <PhoneIcon />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        رقم الاتصال
                      </Typography>
                      <Typography variant="h6" fontWeight={600} sx={{ color: 'text.primary' }}>
                        {serviceCenter.phone}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {serviceCenter.workingHoursAr && (
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
                      <AccessTimeIcon />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        أوقات الدوام
                      </Typography>
                      <Typography variant="body1" fontWeight={500} sx={{ color: 'text.primary' }}>
                        {serviceCenter.workingHoursAr}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {serviceCenter.addressAr && (
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
                        {serviceCenter.addressAr}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              component={motion.div}
              initial={{ opacity: 0, x: 30 }}
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
                الخدمات المقدمة
              </Typography>

              {serviceCenter.servicesAr && serviceCenter.servicesAr.length > 0 ? (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {serviceCenter.servicesAr.map((service, index) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={index}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          p: 2,
                          borderRadius: 2,
                          bgcolor: isDark ? 'rgba(26, 139, 194, 0.1)' : 'rgba(26, 139, 194, 0.05)',
                        }}
                      >
                        <BuildIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                        <Typography variant="body1" sx={{ color: 'text.primary' }}>
                          {service}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  صيانة الأجهزة الكهربائية - تركيب الأنظمة - فحص دوري - دعم فني
                </Typography>
              )}

              <Box sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  href="#contact"
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: 3,
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #1A8BC2 0%, #4DB8E6 100%)',
                    boxShadow: '0 8px 25px rgba(26, 139, 194, 0.3)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 35px rgba(26, 139, 194, 0.4)',
                    },
                  }}
                >
                  طلب صيانة
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ServiceCenter;
