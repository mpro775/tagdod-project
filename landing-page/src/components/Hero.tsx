import React from 'react';
import { Box, Container, Typography, Button, Grid, Stack, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import AppleIcon from '@mui/icons-material/Apple';
import AndroidIcon from '@mui/icons-material/Android';

const Hero: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      id="hero"
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        color: 'white',
        pt: { xs: 8, md: 12 },
        pb: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography
                variant="h2"
                component="h1"
                fontWeight="bold"
                gutterBottom
                sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}
              >
                طاقة شمسية لمستقبل مشرق
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, lineHeight: 1.6 }}>
                اكتشف أحدث حلول الطاقة الشمسية مع تطبيق تجدد. تسوق، قارن، واحصل على أفضل العروض بكل سهولة.
              </Typography>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<AppleIcon />}
                  href="#"
                  sx={{ 
                    py: 1.5, 
                    px: 4, 
                    borderRadius: 50, 
                    fontSize: '1.1rem',
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'grey.100',
                    }
                  }}
                >
                  App Store
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<AndroidIcon />}
                  href="#"
                  sx={{ 
                    py: 1.5, 
                    px: 4, 
                    borderRadius: 50, 
                    fontSize: '1.1rem',
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    }
                  }}
                >
                  Google Play
                </Button>
              </Stack>
            </motion.div>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: { xs: 'none', md: 'block' } }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Box
                component="img"
                src="https://placehold.co/400x800/png?text=App+Mockup"
                alt="App Screenshot"
                sx={{
                  width: '100%',
                  maxWidth: 400,
                  display: 'block',
                  mx: 'auto',
                  filter: 'drop-shadow(0px 20px 30px rgba(0,0,0,0.2))',
                }}
              />
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Hero;
