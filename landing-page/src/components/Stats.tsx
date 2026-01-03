import React, { useEffect, useState, useRef } from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';
import { motion, useInView } from 'framer-motion';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import EngineeringIcon from '@mui/icons-material/Engineering';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

interface StatItemProps {
    icon: React.ReactNode;
    value: number;
    suffix: string;
    label: string;
    delay: number;
}

const AnimatedCounter: React.FC<{ value: number; suffix: string; inView: boolean }> = ({
    value,
    suffix,
    inView
}) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!inView) return;

        let startTime: number;
        const duration = 2000;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(easeOutQuart * value));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [value, inView]);

    return (
        <span>
            {count.toLocaleString('ar-SA')}{suffix}
        </span>
    );
};

const StatItem: React.FC<StatItemProps> = ({ icon, value, suffix, label, delay }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <Grid size={{ xs: 6, md: 3 }}>
            <Box
                ref={ref}
                component={motion.div}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay }}
                sx={{
                    textAlign: 'center',
                    p: 4,
                }}
            >
                <Box
                    sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '24px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                        color: '#90EE90',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'scale(1.1) rotate(5deg)',
                            background: 'rgba(144, 238, 144, 0.2)',
                        },
                    }}
                >
                    {icon}
                </Box>
                <Typography
                    variant="h3"
                    sx={{
                        fontWeight: 800,
                        color: 'white',
                        fontSize: { xs: '2rem', md: '2.75rem' },
                        mb: 1,
                    }}
                >
                    <AnimatedCounter value={value} suffix={suffix} inView={isInView} />
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontWeight: 500,
                    }}
                >
                    {label}
                </Typography>
            </Box>
        </Grid>
    );
};

const stats = [
    {
        icon: <PeopleIcon sx={{ fontSize: 36 }} />,
        value: 10000,
        suffix: '+',
        label: 'مستخدم نشط',
    },
    {
        icon: <InventoryIcon sx={{ fontSize: 36 }} />,
        value: 500,
        suffix: '+',
        label: 'منتج متاح',
    },
    {
        icon: <EngineeringIcon sx={{ fontSize: 36 }} />,
        value: 50,
        suffix: '+',
        label: 'مهندس محترف',
    },
    {
        icon: <ThumbUpIcon sx={{ fontSize: 36 }} />,
        value: 98,
        suffix: '%',
        label: 'رضا العملاء',
    },
];

const Stats: React.FC = () => {
    return (
        <Box
            sx={{
                py: { xs: 8, md: 10 },
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background Decorations */}
            <Box
                component={motion.div}
                animate={{
                    rotate: [0, 360],
                }}
                transition={{
                    duration: 60,
                    repeat: Infinity,
                    ease: 'linear',
                }}
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '150%',
                    height: '150%',
                    background: `
            radial-gradient(circle at 20% 20%, rgba(26, 139, 194, 0.1) 0%, transparent 40%),
            radial-gradient(circle at 80% 80%, rgba(144, 238, 144, 0.1) 0%, transparent 40%)
          `,
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
                    mb={6}
                >
                    <Typography
                        variant="h3"
                        component="h2"
                        sx={{
                            fontWeight: 800,
                            color: 'white',
                            mb: 2,
                        }}
                    >
                        أرقام نفتخر بها
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontWeight: 400,
                            maxWidth: 500,
                            mx: 'auto',
                        }}
                    >
                        نمو مستمر وثقة متزايدة من عملائنا
                    </Typography>
                </Box>

                {/* Stats Grid */}
                <Grid container>
                    {stats.map((stat, index) => (
                        <StatItem
                            key={index}
                            icon={stat.icon}
                            value={stat.value}
                            suffix={stat.suffix}
                            label={stat.label}
                            delay={index * 0.1}
                        />
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default Stats;
