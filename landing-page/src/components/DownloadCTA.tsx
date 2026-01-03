import React from 'react';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import AppleIcon from '@mui/icons-material/Apple';
import ShopIcon from '@mui/icons-material/Shop';

const DownloadCTA: React.FC = () => {
    return (
        <Box
            id="download"
            sx={{
                py: { xs: 10, md: 14 },
                background: 'linear-gradient(135deg, #1A8BC2 0%, #0d5a80 50%, #1a1a2e 100%)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background Decorations */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    overflow: 'hidden',
                }}
            >
                {/* Gradient Orbs */}
                <Box
                    component={motion.div}
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    sx={{
                        position: 'absolute',
                        top: '-20%',
                        left: '-10%',
                        width: 500,
                        height: 500,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(144, 238, 144, 0.3) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                    }}
                />
                <Box
                    component={motion.div}
                    animate={{
                        scale: [1.3, 1, 1.3],
                        opacity: [0.2, 0.3, 0.2],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    sx={{
                        position: 'absolute',
                        bottom: '-30%',
                        right: '-10%',
                        width: 600,
                        height: 600,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(26, 139, 194, 0.4) 0%, transparent 70%)',
                        filter: 'blur(80px)',
                    }}
                />
            </Box>

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    sx={{
                        textAlign: 'center',
                        maxWidth: 800,
                        mx: 'auto',
                    }}
                >
                    <Typography
                        variant="h2"
                        component="h2"
                        sx={{
                            fontWeight: 800,
                            color: 'white',
                            mb: 3,
                            fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                            lineHeight: 1.2,
                        }}
                    >
                        حمّل التطبيق الآن
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontWeight: 400,
                            lineHeight: 1.8,
                            mb: 5,
                            mx: 'auto',
                            maxWidth: 600,
                            fontSize: { xs: '1rem', md: '1.15rem' },
                        }}
                    >
                        انضم إلى آلاف المستخدمين واستمتع بتجربة تسوق سلسة ومميزة لمنتجات الطاقة الشمسية
                    </Typography>

                    {/* Download Buttons */}
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={3}
                        justifyContent="center"
                        alignItems="center"
                        component={motion.div}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        sx={{ gap: { xs: 2, sm: 3 } }}
                    >
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<AppleIcon />}
                            href="#"
                            sx={{
                                py: 1.75,
                                px: 4,
                                borderRadius: '16px',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                bgcolor: 'white',
                                color: '#1A8BC2',
                                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
                                transition: 'all 0.3s ease',
                                minWidth: { xs: '100%', sm: 200 },
                                '&:hover': {
                                    bgcolor: 'white',
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
                                },
                            }}
                        >
                            App Store
                        </Button>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<ShopIcon />}
                            href="https://play.google.com/store/apps/details?id=com.tagadod.app"
                            target="_blank"
                            sx={{
                                py: 1.75,
                                px: 4,
                                borderRadius: '16px',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                bgcolor: '#90EE90',
                                color: '#1a1a2e',
                                boxShadow: '0 8px 30px rgba(144, 238, 144, 0.3)',
                                transition: 'all 0.3s ease',
                                minWidth: { xs: '100%', sm: 200 },
                                ml: { xs: 0, sm: 3 },
                                mt: { xs: 2, sm: 0 },
                                '&:hover': {
                                    bgcolor: '#7DD87D',
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 12px 40px rgba(144, 238, 144, 0.4)',
                                },
                            }}
                        >
                            Google Play
                        </Button>
                    </Stack>
                </Box>
            </Container>
        </Box>
    );
};

export default DownloadCTA;
