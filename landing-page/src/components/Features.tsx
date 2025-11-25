import React from 'react';
import { Box, Container, Typography, Grid, Paper, Avatar } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const features = [
  {
    icon: <ShoppingCartIcon fontSize="large" />,
    title: 'تسوق سهل وسريع',
    description: 'تصفح آلاف المنتجات واطلب ما تحتاجه بضغطة زر واحدة.',
  },
  {
    icon: <LocalShippingIcon fontSize="large" />,
    title: 'توصيل موثوق',
    description: 'نصلك أينما كنت في أسرع وقت ممكن مع شركاء لوجستيين موثوقين.',
  },
  {
    icon: <SupportAgentIcon fontSize="large" />,
    title: 'دعم فني متواصل',
    description: 'فريقنا جاهز لمساعدتك والإجابة على استفساراتك على مدار الساعة.',
  },
  {
    icon: <VerifiedUserIcon fontSize="large" />,
    title: 'منتجات مضمونة',
    description: 'جميع منتجاتنا أصلية ومكفولة لضمان أفضل أداء واستدامة.',
  },
];

const Features: React.FC = () => {
  return (
    <Box sx={{ py: 10, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={8}>
          <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom color="primary">
            لماذا تختار تجدد؟
          </Typography>
          <Typography variant="h6" color="text.secondary">
            نقدم لك تجربة متكاملة لتلبية جميع احتياجاتك من الطاقة الشمسية
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  textAlign: 'center',
                  borderRadius: 4,
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 3,
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  {feature.icon}
                </Avatar>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
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
