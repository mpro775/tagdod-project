import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Grid,
  useTheme
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Send,
  Code
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { useNotificationTemplates, useTestNotification } from '../hooks/useNotifications';
import { NotificationTemplate } from '../types/notification.types';

export const NotificationTemplatesPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation('notifications');
  const { isMobile } = useBreakpoint();
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testUserId, setTestUserId] = useState('');

  const { data: templates = [], isLoading } = useNotificationTemplates();
  const { mutate: testNotification, isPending: isTesting } = useTestNotification();

  const handleTestTemplate = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setTestDialogOpen(true);
  };

  const handleSendTest = () => {
    if (selectedTemplate && testUserId) {
      testNotification(
        { 
          userId: testUserId, 
          templateKey: selectedTemplate.key,
          payload: {
            orderId: 'TEST-123',
            amount: '150',
            currency: 'USD',
            requestId: 'REQ-456'
          }
        },
        {
          onSuccess: () => {
            setTestDialogOpen(false);
            setTestUserId('');
            setSelectedTemplate(null);
          }
        }
      );
    }
  };

  const getTemplateDescription = (key: string) => {
    const translationKey = `templates.descriptions.${key}`;
    const translated = t(translationKey);
    // إذا لم توجد ترجمة، استخدم النص الافتراضي
    return translated !== translationKey ? translated : t('templates.descriptions.custom');
  };

  const getTemplateCategory = (key: string) => {
    if (key.includes('ORDER')) return 'orders';
    if (key.includes('SERVICE')) return 'services';
    return 'general';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'orders': return 'primary';
      case 'services': return 'success';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: isMobile ? 1.5 : 3 }}>
        <Typography variant={isMobile ? 'body1' : 'h6'}>
          {t('templates.loading')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 1.5 : 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        mb: isMobile ? 2 : 3,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 2 : 0
      }}>
        <Typography 
          variant={isMobile ? 'h5' : 'h4'}
          sx={{ fontSize: isMobile ? '1.5rem' : undefined }}
        >
          {t('templates.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setEditDialogOpen(true)}
          size={isMobile ? 'small' : 'medium'}
          fullWidth={isMobile}
        >
          {t('templates.addNew')}
        </Button>
      </Box>

      <Typography 
        variant="body1" 
        color="text.secondary" 
        sx={{ mb: isMobile ? 2 : 3, fontSize: isMobile ? '0.875rem' : undefined }}
      >
        {t('templates.description')}
      </Typography>

      {templates.length > 0 ? (
        <Grid container spacing={isMobile ? 1.5 : 2}>
          {templates.map((template) => (
            <Grid key={template.key} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default'
                }}
              >
                <CardContent sx={{ p: isMobile ? 1.5 : 2, flexGrow: 1 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start', 
                    mb: isMobile ? 1.5 : 2,
                    gap: 1
                  }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant={isMobile ? 'subtitle1' : 'h6'} 
                        gutterBottom
                        sx={{ 
                          fontSize: isMobile ? '1rem' : undefined,
                          fontWeight: 600,
                          wordBreak: 'break-word'
                        }}
                      >
                        {template.title}
                      </Typography>
                      <Chip 
                        label={t(`templates.categories.${getTemplateCategory(template.key)}`)}
                        size="small"
                        color={getCategoryColor(getTemplateCategory(template.key)) as any}
                        sx={{ mb: 1 }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                      <Tooltip title={t('templates.actions.test')}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleTestTemplate(template)}
                        >
                          <Send fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('templates.actions.edit')}>
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: isMobile ? 1.5 : 2,
                      fontSize: isMobile ? '0.8rem' : undefined
                    }}
                  >
                    {getTemplateDescription(template.key)}
                  </Typography>

                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mb: 1, 
                      fontWeight: 'medium',
                      fontSize: isMobile ? '0.8rem' : undefined
                    }}
                  >
                    {t('templates.content')}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.100', 
                      p: isMobile ? 0.75 : 1, 
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word'
                    }}
                  >
                    {template.body}
                  </Typography>

                  {template.hasLink && (
                    <Chip 
                      label={t('templates.hasLink')} 
                      size="small" 
                      color="info" 
                      sx={{ mt: 1 }}
                      icon={<Code fontSize="small" />}
                    />
                  )}

                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      display: 'block', 
                      mt: 1,
                      fontSize: isMobile ? '0.7rem' : undefined,
                      wordBreak: 'break-all'
                    }}
                  >
                    {t('templates.key')}: {template.key}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Alert severity="info" sx={{ mt: 1 }}>
          {t('templates.noTemplates')}
        </Alert>
      )}

      {/* Test Template Dialog */}
      <Dialog 
        open={testDialogOpen} 
        onClose={() => setTestDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ fontSize: isMobile ? '1.125rem' : undefined }}>
          {t('templates.testDialog.title')}
        </DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Alert severity="info">
                {t('templates.testDialog.info')}
              </Alert>
              
              <Box>
                <Typography 
                  variant="subtitle2" 
                  gutterBottom
                  sx={{ fontSize: isMobile ? '0.875rem' : undefined }}
                >
                  {t('templates.testDialog.selectedTemplate')}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.100', 
                    p: 1, 
                    borderRadius: 1,
                    fontSize: isMobile ? '0.875rem' : undefined
                  }}
                >
                  {selectedTemplate.title}
                </Typography>
              </Box>

              <TextField
                fullWidth
                label={t('templates.testDialog.userIdLabel')}
                value={testUserId}
                onChange={(e) => setTestUserId(e.target.value)}
                placeholder={t('templates.testDialog.userIdPlaceholder')}
                required
                helperText={t('templates.testDialog.userIdHelper')}
                size={isMobile ? 'small' : 'medium'}
              />

              <Box>
                <Typography 
                  variant="subtitle2" 
                  gutterBottom
                  sx={{ fontSize: isMobile ? '0.875rem' : undefined }}
                >
                  {t('templates.testDialog.preview')}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.100', 
                    p: isMobile ? 1.5 : 2, 
                    borderRadius: 1,
                    fontSize: isMobile ? '0.875rem' : undefined
                  }}
                >
                  <strong>{selectedTemplate.title}</strong>
                  <br />
                  {selectedTemplate.body.replace(/\{\{\s*\w+\s*\}\}/g, t('templates.testDialog.variablePlaceholder'))}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: isMobile ? 2 : 3, pb: isMobile ? 2 : 3 }}>
          <Button 
            onClick={() => setTestDialogOpen(false)}
            size={isMobile ? 'small' : 'medium'}
          >
            {t('templates.actions.cancel')}
          </Button>
          <Button 
            onClick={handleSendTest}
            variant="contained"
            disabled={!testUserId || isTesting}
            startIcon={<Send />}
            size={isMobile ? 'small' : 'medium'}
          >
            {isTesting ? t('templates.actions.sending') : t('templates.actions.sendTest')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ fontSize: isMobile ? '1.125rem' : undefined }}>
          {selectedTemplate ? t('templates.editDialog.editTitle') : t('templates.editDialog.createTitle')}
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2, fontSize: isMobile ? '0.875rem' : undefined }}>
            {t('templates.editDialog.warning')}
          </Alert>
          
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label={t('templates.editDialog.keyLabel')}
              value={selectedTemplate?.key || ''}
              placeholder={t('templates.editDialog.keyPlaceholder')}
              disabled={!!selectedTemplate}
              helperText={t('templates.editDialog.keyHelper')}
              size={isMobile ? 'small' : 'medium'}
            />

            <TextField
              fullWidth
              label={t('templates.editDialog.titleLabel')}
              value={selectedTemplate?.title || ''}
              placeholder={t('templates.editDialog.titlePlaceholder')}
              helperText={t('templates.editDialog.titleHelper')}
              size={isMobile ? 'small' : 'medium'}
            />

            <TextField
              fullWidth
              label={t('templates.editDialog.bodyLabel')}
              value={selectedTemplate?.body || ''}
              placeholder={t('templates.editDialog.bodyPlaceholder')}
              multiline
              rows={isMobile ? 3 : 4}
              helperText={t('templates.editDialog.bodyHelper')}
              size={isMobile ? 'small' : 'medium'}
            />

            <Alert severity="info" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
              {t('templates.editDialog.availableVariables')}
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: isMobile ? 2 : 3, pb: isMobile ? 2 : 3 }}>
          <Button 
            onClick={() => setEditDialogOpen(false)}
            size={isMobile ? 'small' : 'medium'}
          >
            {t('templates.actions.cancel')}
          </Button>
          <Button 
            variant="contained"
            size={isMobile ? 'small' : 'medium'}
          >
            {selectedTemplate ? t('templates.actions.update') : t('templates.actions.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
