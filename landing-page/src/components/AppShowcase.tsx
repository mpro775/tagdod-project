import React from 'react';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import iconImage from '../assets/images/icon.png';

const steps = [
    {
        number: '01',
        icon: <PhoneAndroidIcon sx={{ fontSize: 28 }} />,
        title: 'حمّل التطبيق',
        description: 'قم بتحميل تطبيق تجدد من متجر التطبيقات',
    },
    {
        number: '02',
        icon: <SearchIcon sx={{ fontSize: 28 }} />,
        title: 'تصفح المنتجات',
        description: 'استكشف مجموعتنا الواسعة من منتجات الطاقة الشمسية',
    },
    {
        number: '03',
        icon: <ShoppingCartIcon sx={{ fontSize: 28 }} />,
        title: 'أضف إلى السلة',
        description: 'اختر المنتجات المناسبة وأضفها إلى سلة التسوق',
    },
    {
        number: '04',
        icon: <LocalShippingIcon sx={{ fontSize: 28 }} />,
        title: 'استلم طلبك',
        description: 'أكمل الطلب واستلمه بسرعة على باب منزلك',
    },
];

const AppShowcase: React.FC = () => {
    return (
        <Box
            id="about"
            sx={{
                py: { xs: 10, md: 14 },
                bgcolor: 'white',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background Pattern */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(26, 139, 194, 0.05) 1px, transparent 0)
          `,
                    backgroundSize: '40px 40px',
                }}
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Grid container spacing={8} alignItems="center">
                    {/* Phone Mockup */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <Box
                            component={motion.div}
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                position: 'relative',
                            }}
                        >
                            {/* Background Glow */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: 300,
                                    height: 300,
                                    borderRadius: '50%',
                                    background: 'radial-gradient(circle, rgba(26, 139, 194, 0.2) 0%, transparent 70%)',
                                    filter: 'blur(40px)',
                                }}
                            />

                            {/* Phone Frame */}
                            <Box
                                component={motion.div}
                                animate={{ y: [0, -10, 0] }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                                sx={{
                                    position: 'relative',
                                    width: { xs: 240, md: 280 },
                                    height: { xs: 480, md: 560 },
                                    background: 'linear-gradient(180deg, #2d2d44 0%, #1a1a2e 100%)',
                                    borderRadius: '36px',
                                    padding: '10px',
                                    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.3)',
                                }}
                            >
                                {/* Screen */}
                                <Box
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '28px',
                                        overflow: 'hidden',
                                        background: 'linear-gradient(180deg, #1A8BC2 0%, #0d5a80 100%)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={iconImage}
                                        alt="تجدد"
                                        sx={{
                                            width: 100,
                                            height: 100,
                                            mb: 2,
                                        }}
                                    />
                                    <Typography
                                        variant="h5"
                                        sx={{ color: 'white', fontWeight: 700 }}
                                    >
                                        تجدد
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}
                                    >
                                        الطاقة المتجددة بين يديك
                                    </Typography>
                                </Box>

                                {/* Notch */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 18,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: 80,
                                        height: 24,
                                        bgcolor: '#1a1a2e',
                                        borderRadius: 16,
                                    }}
                                />
                            </Box>
                        </Box>
                    </Grid>

                    {/* Steps */}
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Box
                            component={motion.div}
                            initial={{ opacity: 0, x: 50 }}
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
                                كيف يعمل التطبيق
                            </Typography>
                            <Typography
                                variant="h3"
                                component="h2"
                                sx={{
                                    fontWeight: 800,
                                    color: '#1a1a2e',
                                    mb: 2,
                                }}
                            >
                                4 خطوات بسيطة
                            </Typography>
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ mb: 5, maxWidth: 500, lineHeight: 1.8 }}
                            >
                                ابدأ رحلتك مع الطاقة المتجددة بخطوات سهلة وبسيطة
                            </Typography>

                            {/* Steps List */}
                            <Grid container spacing={3}>
                                {steps.map((step, index) => (
                                    <Grid size={{ xs: 12, sm: 6 }} key={index}>
                                        <Paper
                                            component={motion.div}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                borderRadius: 3,
                                                bgcolor: '#fafafa',
                                                border: '1px solid rgba(0,0,0,0.06)',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    bgcolor: 'white',
                                                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                                                    transform: 'translateY(-4px)',
                                                },
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                                <Box
                                                    sx={{
                                                        width: 50,
                                                        height: 50,
                                                        borderRadius: 2,
                                                        background: 'linear-gradient(135deg, #1A8BC2 0%, #4DB8E6 100%)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {step.icon}
                                                </Box>
                                                <Box>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: '#90EE90',
                                                            fontWeight: 700,
                                                            fontSize: '0.75rem',
                                                        }}
                                                    >
                                                        الخطوة {step.number}
                                                    </Typography>
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            fontWeight: 700,
                                                            color: '#1a1a2e',
                                                            mb: 0.5,
                                                            fontSize: '1rem',
                                                        }}
                                                    >
                                                        {step.title}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ lineHeight: 1.6 }}
                                                    >
                                                        {step.description}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default AppShowcase;
