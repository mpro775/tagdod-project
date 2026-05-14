import React from 'react';
import { Box, Card, CardContent, Typography, Chip, IconButton, Tooltip, CardActions } from '@mui/material';
import { Visibility, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ContactRequest } from '../types/contact-request.types';

interface ContactRequestCardProps { request: ContactRequest; onDelete: (request: ContactRequest) => void; }

export const ContactRequestCard: React.FC<ContactRequestCardProps> = ({ request, onDelete }) => {
  const { t } = useTranslation('contactRequests');
  const navigate = useNavigate();
  const statusColors: Record<string, 'success' | 'warning' | 'info' | 'error' | 'default'> = { new: 'error', in_review: 'warning', contacted: 'info', converted: 'success', closed: 'default' };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="h6">{request.name}</Typography>
          <Chip label={t(`status.${request.status}`)} size="small" color={statusColors[request.status]} />
        </Box>
        <Typography variant="body2" color="text.secondary" mb={1}>{request.phone}</Typography>
        {request.email && <Typography variant="body2" color="text.secondary" mb={1}>{request.email}</Typography>}
        <Chip label={t(`requestTypes.${request.requestType}`)} size="small" color="primary" variant="outlined" sx={{ mr: 0.5 }} />
        {request.subject && <Typography variant="body2" sx={{ mt: 1, fontWeight: 'medium' }}>{request.subject}</Typography>}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{request.message}</Typography>
      </CardContent>
      <CardActions>
        <Tooltip title={t('actions.view')}><IconButton size="small" color="primary" onClick={() => navigate(`/website/contact-requests/${request._id}`)}><Visibility fontSize="small" /></IconButton></Tooltip>
        <Tooltip title={t('actions.delete')}><IconButton size="small" color="error" onClick={() => onDelete(request)}><Delete fontSize="small" /></IconButton></Tooltip>
      </CardActions>
    </Card>
  );
};
