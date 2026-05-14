import React from 'react';
import { Box, Container, Typography, Grid, Paper, Chip, Button, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import type { ProjectItem } from '../types/landing';

interface ProjectsShowcaseProps {
  projects: ProjectItem[];
}

const projectTypeLabels: Record<string, string> = {
  system: 'منظومة',
  contracting: 'مقاولة',
  maintenance: 'صيانة',
  installation: 'تركيب',
  supply: 'توريد',
  partnership: 'شراكة',
  other: 'أخرى',
};

const projectStatusLabels: Record<string, string> = {
  planned: 'مخطط',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
};

const statusColors: Record<string, string> = {
  planned: 'warning.main',
  in_progress: 'info.main',
  completed: 'success.main',
};

const ProjectsShowcase: React.FC<ProjectsShowcaseProps> = ({ projects }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!projects || projects.length === 0) {
    return (
      <Box
        id="projects"
        sx={{
          py: { xs: 10, md: 14 },
          bgcolor: 'background.default',
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center" py={6}>
            <Typography variant="h6" color="text.secondary">
              نعمل حاليًا على توثيق مشاريعنا، وسيتم نشرها قريبًا.
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  const sortedProjects = [...projects]
    .filter((p) => p.isPublished && p.showOnLanding)
    .sort((a, b) => a.landingOrder - b.landingOrder);

  if (sortedProjects.length === 0) {
    return (
      <Box
        id="projects"
        sx={{
          py: { xs: 10, md: 14 },
          bgcolor: 'background.default',
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center" py={6}>
            <Typography variant="h6" color="text.secondary">
              نعمل حاليًا على توثيق مشاريعنا، وسيتم نشرها قريبًا.
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      id="projects"
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
            مشاريعنا
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
            مشاريع ومنظومات نفخر بها
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
            نقدم حلولاً متكاملة في مجالات المنظومات والمقاولات والصيانة بتنفيذ احترافي
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {sortedProjects.map((project, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={project._id}>
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
                    transform: 'translateY(-4px)',
                    boxShadow: isDark ? '0 20px 40px rgba(0, 0, 0, 0.4)' : '0 20px 40px rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: 220,
                    overflow: 'hidden',
                    position: 'relative',
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                  }}
                >
                  {project.coverImage ? (
                    <Box
                      component="img"
                      src={project.coverImage}
                      alt={project.titleAr}
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
                        background: 'linear-gradient(135deg, #1A8BC2 0%, #4DB8E6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                        {project.titleAr}
                      </Typography>
                    </Box>
                  )}

                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      display: 'flex',
                      gap: 1,
                    }}
                  >
                    <Chip
                      label={projectTypeLabels[project.type] || project.type}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        backdropFilter: 'blur(10px)',
                      }}
                    />
                    <Chip
                      label={projectStatusLabels[project.status] || project.status}
                      size="small"
                      sx={{
                        bgcolor: statusColors[project.status] || 'grey.500',
                        color: 'white',
                      }}
                    />
                  </Box>
                </Box>

                <Box sx={{ p: 3 }}>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    gutterBottom
                    sx={{ color: 'text.primary' }}
                  >
                    {project.titleAr}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.7, mb: 2 }}
                  >
                    {project.shortDescriptionAr || project.descriptionAr}
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                    {project.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOnIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                        <Typography variant="body2" color="text.secondary">
                          {project.location}
                        </Typography>
                      </Box>
                    )}
                    {project.startDate && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarTodayIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(project.startDate).toLocaleDateString('ar-SA')}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {project.metrics && project.metrics.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {project.metrics.slice(0, 3).map((metric, i) => (
                        <Chip
                          key={i}
                          label={`${metric.labelAr}: ${metric.value}`}
                          size="small"
                          variant="outlined"
                          sx={{ borderColor: 'primary.main', color: 'primary.main' }}
                        />
                      ))}
                    </Box>
                  )}

                  {project.tags && project.tags.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {project.tags.slice(0, 4).map((tag, i) => (
                        <Chip
                          key={i}
                          label={tag}
                          size="small"
                          sx={{ bgcolor: 'rgba(26, 139, 194, 0.1)', color: 'primary.main' }}
                        />
                      ))}
                    </Box>
                  )}

                  <Button
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
                    عرض التفاصيل
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

export default ProjectsShowcase;
