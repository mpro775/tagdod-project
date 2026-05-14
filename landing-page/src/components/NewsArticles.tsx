import React from 'react';
import { Box, Container, Typography, Grid, Paper, Chip, Button, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import type { ArticleItem } from '../types/landing';

interface NewsArticlesProps {
  articles: ArticleItem[];
}

const typeLabels: Record<string, string> = {
  news: 'خبر',
  article: 'مقال',
};

const NewsArticles: React.FC<NewsArticlesProps> = ({ articles }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!articles || articles.length === 0) {
    return (
      <Box
        id="news-articles"
        sx={{
          py: { xs: 10, md: 14 },
          bgcolor: isDark ? '#0d1117' : '#f5f7fa',
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center" py={6}>
            <Typography variant="h6" color="text.secondary">
              سيتم نشر آخر الأخبار والمقالات قريبًا.
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  const sortedArticles = [...articles]
    .filter((a) => a.status === 'published' && a.showOnLanding)
    .sort((a, b) => a.landingOrder - b.landingOrder)
    .slice(0, 4);

  if (sortedArticles.length === 0) {
    return (
      <Box
        id="news-articles"
        sx={{
          py: { xs: 10, md: 14 },
          bgcolor: isDark ? '#0d1117' : '#f5f7fa',
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center" py={6}>
            <Typography variant="h6" color="text.secondary">
              سيتم نشر آخر الأخبار والمقالات قريبًا.
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      id="news-articles"
      sx={{
        py: { xs: 10, md: 14 },
        bgcolor: isDark ? '#0d1117' : '#f5f7fa',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
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
            آخر الأخبار
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
            الأخبار والمقالات
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
            تابع آخر أخبارنا ومقالاتنا في مجال الطاقة والحلول التقنية
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {sortedArticles.map((article, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={article._id}>
              <Paper
                component={motion.div}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 4,
                  overflow: 'hidden',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.4s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: isDark ? '0 20px 40px rgba(0, 0, 0, 0.4)' : '0 20px 40px rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                <Box
                  component={RouterLink}
                  to={`/news/${article.slug}`}
                  sx={{
                    width: '100%',
                    height: 180,
                    overflow: 'hidden',
                    position: 'relative',
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    textDecoration: 'none',
                    display: 'block',
                  }}
                >
                  {article.coverImage ? (
                    <Box
                      component="img"
                      src={article.coverImage}
                      alt={article.titleAr}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #1A8BC2 0%, #0d5a80 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
                        {typeLabels[article.type]}
                      </Typography>
                    </Box>
                  )}

                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                    }}
                  >
                    <Chip
                      label={typeLabels[article.type] || article.type}
                      size="small"
                      sx={{
                        bgcolor: article.type === 'news' ? 'error.main' : 'primary.main',
                        color: 'white',
                      }}
                    />
                  </Box>
                </Box>

                <Box sx={{ p: 2.5 }}>
                  <Typography
                    component={RouterLink}
                    to={`/news/${article.slug}`}
                    variant="h6"
                    fontWeight={700}
                    gutterBottom
                    sx={{
                      color: 'text.primary',
                      fontSize: '1rem',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textDecoration: 'none',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {article.titleAr}
                  </Typography>

                  {article.excerptAr && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.6,
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {article.excerptAr}
                    </Typography>
                  )}

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mt: 2,
                      mb: 2,
                    }}
                  >
                    {article.publishDate && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(article.publishDate).toLocaleDateString('ar-SA')}
                        </Typography>
                      </Box>
                    )}

                    {article.readTime && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {article.readTime} دقيقة
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Button
                    component={RouterLink}
                    to={`/news/${article.slug}`}
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
                    اقرأ المزيد
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default NewsArticles;
