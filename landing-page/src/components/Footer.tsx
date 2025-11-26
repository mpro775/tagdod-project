import React from 'react';
import { Box, Container, Typography, Link, Grid, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const Footer: React.FC = () => {
  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6, mt: 'auto', borderTop: 1, borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" color="primary" gutterBottom fontWeight="bold">
              تجدد
            </Typography>
            <Typography variant="body2" color="text.secondary">
              منصتك الأولى للطاقة الشمسية. نوفر لك أفضل المنتجات والخدمات لتجربة طاقة مستدامة.
            </Typography>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" color="text.primary" gutterBottom fontWeight="bold">
              روابط سريعة
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Link component={RouterLink} to="/" color="text.secondary" underline="hover">
                الرئيسية
              </Link>
              <Link component={RouterLink} to="/terms" color="text.secondary" underline="hover">
                الأحكام والشروط
              </Link>
              <Link component={RouterLink} to="/privacy" color="text.secondary" underline="hover">
                سياسة الخصوصية
              </Link>
              <Link component={RouterLink} to="/deleted-account" color="text.secondary" underline="hover">
                كيفية حذف الحساب
              </Link>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" color="text.primary" gutterBottom fontWeight="bold">
              تواصل معنا
            </Typography>
            <Box>
              <IconButton color="primary" aria-label="Facebook">
                <FacebookIcon />
              </IconButton>
              <IconButton color="primary" aria-label="Twitter">
                <TwitterIcon />
              </IconButton>
              <IconButton color="primary" aria-label="Instagram">
                <InstagramIcon />
              </IconButton>
              <IconButton color="primary" aria-label="LinkedIn">
                <LinkedInIcon />
              </IconButton>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              © {new Date().getFullYear()} تجدد. جميع الحقوق محفوظة.
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
