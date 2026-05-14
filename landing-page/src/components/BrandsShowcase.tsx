import React from 'react';
import { Box, Container, Typography, Grid, Paper, Avatar, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import type { BrandItem } from '../types/landing';

interface BrandsShowcaseProps {
  brands: BrandItem[];
}

const BrandsShowcase: React.FC<BrandsShowcaseProps> = ({ brands }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!brands || brands.length === 0) return null;

  const sortedBrands = [...brands]
    .filter((b) => b.showOnLanding)
    .sort((a, b) => a.landingOrder - b.landingOrder);

  if (sortedBrands.length === 0) return null;

  return (
    <Box
      id="brands"
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
          top: '5%',
          left: '10%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26, 139, 194, 0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
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
            شركاؤنا
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
            البراندات التي نتعامل معها
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
            نفخر بشراكاتنا مع أبرز العلامات التجارية في مجال الطاقة والحلول التقنية
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {sortedBrands.map((brand, index) => (
            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={brand._id}>
              <Paper
                component={motion.div}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: isDark ? '0 15px 30px rgba(0, 0, 0, 0.3)' : '0 15px 30px rgba(0, 0, 0, 0.08)',
                    borderColor: 'primary.main',
                  },
                }}
              >
                {brand.logo ? (
                  <Box
                    component="img"
                    src={brand.logo}
                    alt={brand.nameAr}
                    sx={{
                      width: 80,
                      height: 80,
                      objectFit: 'contain',
                      mb: 2,
                      borderRadius: 2,
                    }}
                  />
                ) : (
                  <Avatar
                    sx={{
                      width: 70,
                      height: 70,
                      bgcolor: 'primary.main',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      mb: 2,
                    }}
                  >
                    {brand.nameAr.charAt(0)}
                  </Avatar>
                )}

                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ color: 'text.primary', mb: 0.5 }}
                >
                  {brand.nameAr}
                </Typography>

                {brand.landingDescriptionAr && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.5 }}
                  >
                    {brand.landingDescriptionAr}
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default BrandsShowcase;
