import React from 'react';
import { Box, Container, Typography, Grid, Paper, Avatar, Button, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import type { ProductItem } from '../types/landing';

interface ProductShowcaseProps {
  products: ProductItem[];
}

const ProductShowcase: React.FC<ProductShowcaseProps> = ({ products }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!products || products.length === 0) return null;

  const sortedProducts = [...products]
    .filter((p) => p.showOnLanding)
    .sort((a, b) => a.landingOrder - b.landingOrder);

  if (sortedProducts.length === 0) return null;

  return (
    <Box
      id="products"
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
          bottom: '10%',
          left: '-5%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(144, 238, 144, 0.1) 0%, transparent 70%)',
          filter: 'blur(50px)',
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
            منتجاتنا
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
            حلول ومنتجات مبتكرة
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
            نقدم مجموعة متكاملة من المنتجات والحلول التي تلبي احتياجاتكم في مجال الطاقة والخدمات
          </Typography>
        </Box>

        <Grid
          container
          spacing={4}
          component={motion.div}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {sortedProducts.map((product, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product._id}>
              <Paper
                component={motion.div}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: index * 0.1 } },
                }}
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 4,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: isDark ? '0 20px 40px rgba(0, 0, 0, 0.4)' : '0 20px 40px rgba(0, 0, 0, 0.1)',
                    borderColor: 'primary.main',
                  },
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: 200,
                    borderRadius: 3,
                    overflow: 'hidden',
                    mb: 3,
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {product.image ? (
                    <Box
                      component="img"
                      src={product.image}
                      alt={product.nameAr}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: 'primary.main',
                        fontSize: '2rem',
                      }}
                    >
                      {product.nameAr.charAt(0)}
                    </Avatar>
                  )}
                </Box>

                {product.landingLabelAr && (
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      px: 2,
                      py: 0.5,
                      borderRadius: 50,
                      bgcolor: 'primary.main',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      mb: 1.5,
                    }}
                  >
                    {product.landingLabelAr}
                  </Box>
                )}

                <Typography
                  variant="h6"
                  fontWeight={700}
                  gutterBottom
                  sx={{ color: 'text.primary' }}
                >
                  {product.nameAr}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.7, mb: 2 }}
                >
                  {product.landingDescriptionAr || 'حل متكامل يلبي احتياجاتك'}
                </Typography>

                {product.brand && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 600,
                      display: 'block',
                      mb: 2,
                    }}
                  >
                    البراند: {product.brand}
                  </Typography>
                )}

                <Button
                  href="#contact"
                  size="small"
                  endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                  fullWidth
                  sx={{
                    mt: 1,
                    py: 1,
                    borderRadius: 2,
                    fontWeight: 600,
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'rgba(26, 139, 194, 0.08)',
                    },
                  }}
                >
                  تواصل للاستفسار
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default ProductShowcase;
