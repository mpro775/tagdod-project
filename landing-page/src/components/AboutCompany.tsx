import React from 'react';
import { Box, Container, Typography, Grid, Paper, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import type { AboutData } from '../types/landing';

interface AboutCompanyProps {
  about: AboutData | null;
}

const AboutCompany: React.FC<AboutCompanyProps> = ({ about }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!about) return null;

  return (
    <Box
      id="about-company"
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
          right: '-5%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26, 139, 194, 0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              component={motion.div}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
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
                من نحن
              </Typography>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  color: 'text.primary',
                  fontSize: { xs: '2rem', md: '2.5rem' },
                }}
              >
                {about.titleAr}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ lineHeight: 1.9, mb: 4, fontSize: '1.05rem' }}
              >
                {about.descriptionAr}
              </Typography>

              {about.visionAr && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 3,
                    bgcolor: isDark ? 'rgba(26, 139, 194, 0.1)' : 'rgba(26, 139, 194, 0.05)',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(26, 139, 194, 0.2)' : 'rgba(26, 139, 194, 0.1)',
                  }}
                >
                  <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom>
                    الرؤية
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {about.visionAr}
                  </Typography>
                </Paper>
              )}

              {about.missionAr && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: isDark ? 'rgba(144, 238, 144, 0.1)' : 'rgba(144, 238, 144, 0.05)',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(144, 238, 144, 0.2)' : 'rgba(144, 238, 144, 0.1)',
                  }}
                >
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#90EE90' }} gutterBottom>
                    الرسالة
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {about.missionAr}
                  </Typography>
                </Paper>
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              component={motion.div}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              sx={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              {about.image ? (
                <Box
                  component="img"
                  src={about.image}
                  alt={about.titleAr}
                  sx={{
                    width: '100%',
                    maxWidth: 500,
                    borderRadius: 4,
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: 500,
                    height: 350,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #1A8BC2 0%, #4DB8E6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 20px 60px rgba(26, 139, 194, 0.3)',
                  }}
                >
                  <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                    {about.titleAr}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AboutCompany;
