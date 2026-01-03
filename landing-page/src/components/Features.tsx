import React from 'react';
import { Box, Container, Typography, Grid, Paper, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';

const features = [
  {
    icon: <ShoppingCartIcon sx={{ fontSize: 32 }} />,
    title: 'تسوق سهل وسريع',
    description: 'تصفح آلاف المنتجات واطلب ما تحتاجه بضغطة زر واحدة مع واجهة سهلة الاستخدام.',
    gradient: 'linear-gradient(135deg, #1A8BC2 0%, #4DB8E6 100%)',
  },
  {
    icon: <LocalShippingIcon sx={{ fontSize: 32 }} />,
    title: 'توصيل سريع',
    description: 'نصلك أينما كنت في أسرع وقت ممكن مع شركاء لوجستيين موثوقين.',
    gradient: 'linear-gradient(135deg, #90EE90 0%, #7DD87D 100%)',
  },
  {
    icon: <SupportAgentIcon sx={{ fontSize: 32 }} />,
    title: 'دعم فني متواصل',
    description: 'فريقنا جاهز لمساعدتك والإجابة على استفساراتك على مدار الساعة.',
    gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
  },
  {
    icon: <VerifiedUserIcon sx={{ fontSize: 32 }} />,
    title: 'منتجات مضمونة',
    description: 'جميع منتجاتنا أصلية ومكفولة لضمان أفضل أداء واستدامة.',
    gradient: 'linear-gradient(135deg, #FFA500 0%, #FFB84D 100%)',
  },
  {
    icon: <SpeedIcon sx={{ fontSize: 32 }} />,
    title: 'أداء عالي',
    description: 'منتجات بأعلى معايير الجودة توفر لك أفضل كفاءة في استخدام الطاقة.',
    gradient: 'linear-gradient(135deg, #9B59B6 0%, #B07CC6 100%)',
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 32 }} />,
    title: 'دفع آمن',
    description: 'نظام دفع مشفر وآمن يحمي بياناتك ومعاملاتك المالية.',
    gradient: 'linear-gradient(135deg, #1A8BC2 0%, #90EE90 100%)',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const Features: React.FC = () => {
  return (
    <Box
      id="features"
      sx={{
        py: { xs: 10, md: 14 },
        bgcolor: '#fafafa',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Decoration */}
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
        {/* Section Header */}
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
            لماذا تختارنا
          </Typography>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              background: 'linear-gradient(135deg, #1a1a2e 0%, #1A8BC2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            مميزات تجعلنا الأفضل
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
            نقدم لك تجربة متكاملة لتلبية جميع احتياجاتك من الطاقة الشمسية بأعلى معايير الجودة
          </Typography>
        </Box>

        {/* Features Grid */}
        <Grid
          container
          spacing={4}
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 4 }}
              key={index}
              component={motion.div}
              variants={itemVariants}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 4,
                  bgcolor: 'white',
                  border: '1px solid',
                  borderColor: 'rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: feature.gradient,
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  },
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    borderColor: 'transparent',
                    '&::before': {
                      opacity: 1,
                    },
                    '& .feature-icon': {
                      transform: 'scale(1.1) rotate(5deg)',
                    },
                  },
                }}
              >
                <Avatar
                  className="feature-icon"
                  sx={{
                    width: 70,
                    height: 70,
                    background: feature.gradient,
                    color: 'white',
                    mb: 3,
                    transition: 'transform 0.3s ease',
                    boxShadow: `0 8px 20px ${feature.gradient.includes('#1A8BC2') ? 'rgba(26, 139, 194, 0.3)' : 'rgba(144, 238, 144, 0.3)'}`,
                  }}
                >
                  {feature.icon}
                </Avatar>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  gutterBottom
                  sx={{ color: '#1a1a2e' }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ lineHeight: 1.8 }}
                >
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Features;
