import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Chip,
  CircularProgress,
  Button,
  Divider,
  useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import TagIcon from '@mui/icons-material/Tag';
import { landingService } from '../services/landing.service';
import type { ArticleItem } from '../types/landing';
import { setSEO } from '../lib/seo';

const typeLabels: Record<string, string> = {
  news: 'خبر',
  article: 'مقال',
};

const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [article, setArticle] = useState<ArticleItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) {
        setError('المقال غير موجود');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await landingService.getArticleBySlug(slug);
        setArticle(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch article:', err);
        setError('فشل في تحميل المقال');
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  useEffect(() => {
    if (article) {
      setSEO({
        title: article.metaTitleAr || article.titleAr,
        description: article.metaDescriptionAr || article.excerptAr,
        image: article.coverImage,
        url: `${import.meta.env.VITE_SITE_URL || 'https://tagadod.app'}/news/${article.slug}`,
        type: 'article',
      });
    }
  }, [article]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress size={60} sx={{ color: '#1A8BC2', mb: 3 }} />
        <Typography variant="h6" color="text.secondary">
          جاري تحميل المقال...
        </Typography>
      </Box>
    );
  }

  if (error || !article) {
    return (
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 4,
        }}
      >
        <Typography variant="h4" color="error.main" gutterBottom>
          عذرًا
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ maxWidth: 400, mb: 3 }}>
          {error || 'المقال غير موجود'}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          startIcon={<ArrowBackIcon />}
          sx={{
            background: 'linear-gradient(135deg, #1A8BC2 0%, #4DB8E6 100%)',
          }}
        >
          العودة للصفحة الرئيسية
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        bgcolor: 'background.default',
        minHeight: '100vh',
      }}
    >
      <Container maxWidth="md">
        <Button
          component={RouterLink}
          to="/"
          startIcon={<ArrowBackIcon />}
          sx={{
            mb: 4,
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'action.hover',
              color: 'primary.main',
            },
          }}
        >
          العودة للصفحة الرئيسية
        </Button>

        <Box
          sx={{
            width: '100%',
            height: { xs: 250, md: 400 },
            borderRadius: 4,
            overflow: 'hidden',
            mb: 5,
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
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
              <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                {typeLabels[article.type]}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ mb: 3 }}>
          <Chip
            label={typeLabels[article.type] || article.type}
            size="small"
            sx={{
              bgcolor: article.type === 'news' ? 'error.main' : 'primary.main',
              color: 'white',
              mb: 2,
            }}
          />
        </Box>

        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 800,
            mb: 3,
            color: 'text.primary',
            fontSize: { xs: '1.75rem', md: '2.5rem' },
            lineHeight: 1.4,
          }}
        >
          {article.titleAr}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            mb: 4,
            pb: 3,
            borderBottom: '1px solid',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          }}
        >
          {article.publishDate && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayIcon sx={{ fontSize: 18, color: 'primary.main' }} />
              <Typography variant="body2" color="text.secondary">
                {new Date(article.publishDate).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
            </Box>
          )}

          {article.readTime && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon sx={{ fontSize: 18, color: 'primary.main' }} />
              <Typography variant="body2" color="text.secondary">
                {article.readTime} دقيقة قراءة
              </Typography>
            </Box>
          )}

          {article.authorName && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ fontSize: 18, color: 'primary.main' }} />
              <Typography variant="body2" color="text.secondary">
                {article.authorName}
              </Typography>
            </Box>
          )}
        </Box>

        {article.excerptAr && (
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              mb: 4,
              fontWeight: 400,
              lineHeight: 1.8,
              fontStyle: 'italic',
              borderRight: '4px solid',
              borderColor: 'primary.main',
              pr: 3,
            }}
          >
            {article.excerptAr}
          </Typography>
        )}

        <Box
          sx={{
            mb: 5,
            '& p': {
              mb: 2,
              lineHeight: 1.9,
              fontSize: '1.05rem',
              color: 'text.primary',
            },
            '& h2': {
              mt: 4,
              mb: 2,
              fontWeight: 700,
              color: 'text.primary',
            },
            '& h3': {
              mt: 3,
              mb: 2,
              fontWeight: 600,
              color: 'text.primary',
            },
            '& ul, & ol': {
              mb: 2,
              pr: 4,
            },
            '& li': {
              mb: 1,
              lineHeight: 1.8,
            },
            '& blockquote': {
              borderRight: '4px solid',
              borderColor: 'primary.main',
              bgcolor: isDark ? 'rgba(26, 139, 194, 0.1)' : 'rgba(26, 139, 194, 0.05)',
              p: 3,
              my: 3,
              borderRadius: 2,
              fontStyle: 'italic',
            },
          }}
        >
          {article.contentAr ? (
            article.contentAr.split('\n').map((paragraph, index) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <Typography key={index} variant="h2" component="h2" sx={{ mt: 4, mb: 2 }}>
                    {paragraph.replace('## ', '')}
                  </Typography>
                );
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <Typography key={index} variant="h3" component="h3" sx={{ mt: 3, mb: 2 }}>
                    {paragraph.replace('### ', '')}
                  </Typography>
                );
              }
              if (paragraph.startsWith('> ')) {
                return (
                  <Box key={index} component="blockquote">
                    <Typography variant="body1">{paragraph.replace('> ', '')}</Typography>
                  </Box>
                );
              }
              if (paragraph.trim()) {
                return (
                  <Typography key={index} variant="body1" component="p">
                    {paragraph}
                  </Typography>
                );
              }
              return <Divider key={index} sx={{ my: 2, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }} />;
            })
          ) : (
            <Typography variant="body1" color="text.secondary">
              محتوى المقال غير متاح حاليًا.
            </Typography>
          )}
        </Box>

        {article.tags && article.tags.length > 0 && (
          <Box sx={{ mb: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TagIcon sx={{ fontSize: 18, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600} color="text.primary">
                الوسوم
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {article.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 4 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Button
            component={RouterLink}
            to="/"
            variant="contained"
            size="large"
            startIcon={<ArrowBackIcon />}
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: 3,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #1A8BC2 0%, #4DB8E6 100%)',
              boxShadow: '0 8px 25px rgba(26, 139, 194, 0.3)',
              '&:hover': {
                boxShadow: '0 12px 35px rgba(26, 139, 194, 0.4)',
              },
            }}
          >
            العودة للصفحة الرئيسية
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default ArticleDetailPage;
