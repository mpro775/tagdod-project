import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
} from '@mui/material';
import {
  Engineering,
  Assignment,
  LocationOn,
  Email,
  Schedule,
  AttachMoney,
  Star,
  CheckCircle,
  Block,
} from '@mui/icons-material';
import { formatDate, formatCurrency } from '@/shared/utils/formatters';

interface ServiceDialogProps {
  open: boolean;
  onClose: () => void;
  service?: any;
  type: 'request' | 'engineer' | 'offer';
  title: string;
}

export const ServiceDialog: React.FC<ServiceDialogProps> = ({
  open,
  onClose,
  service,
  type,
  title,
}) => {
  if (!service) return null;

  const renderRequestDetails = () => (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              معلومات الطلب
            </Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 56, height: 56 }}>
                <Assignment />
              </Avatar>
              <Box>
                <Typography variant="h6">{service.title}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {service.type}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                الوصف:
              </Typography>
              <Typography variant="body2">{service.description}</Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              معلومات العميل
            </Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ mr: 2, bgcolor: 'success.main', width: 56, height: 56 }}>
                {service.customer?.firstName?.charAt(0) || '?'}
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {service.customer?.firstName} {service.customer?.lastName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {service.customer?.phone}
                </Typography>
              </Box>
            </Box>
            {service.customer?.email && (
              <Box display="flex" alignItems="center" mb={1}>
                <Email sx={{ mr: 1, fontSize: '1rem', color: 'text.secondary' }} />
                <Typography variant="body2" color="textSecondary">
                  {service.customer.email}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              تفاصيل إضافية
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <LocationOn sx={{ mr: 1, fontSize: '1rem', color: 'text.secondary' }} />
                  <Typography variant="body2" color="textSecondary">
                    الموقع: {service.location || 'غير محدد'}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Schedule sx={{ mr: 1, fontSize: '1rem', color: 'text.secondary' }} />
                  <Typography variant="body2" color="textSecondary">
                    التاريخ: {formatDate(service.createdAt)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderEngineerDetails = () => (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              معلومات المهندس
            </Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 56, height: 56 }}>
                {service.engineerName?.charAt(0) || '?'}
              </Avatar>
              <Box>
                <Typography variant="h6">{service.engineerName}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {service.engineerPhone}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              الإحصائيات
            </Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ mr: 2, bgcolor: 'success.main', width: 56, height: 56 }}>
                <Star />
              </Avatar>
              <Box>
                <Typography variant="h6">{service.averageRating?.toFixed(1) || '0.0'}</Typography>
                <Typography variant="body2" color="textSecondary">
                  متوسط التقييم
                </Typography>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" mb={1}>
              <Typography variant="body2" color="textSecondary">
                الطلبات المكتملة: {service.completedRequests || 0}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" mb={1}>
              <Typography variant="body2" color="textSecondary">
                معدل الإنجاز: {service.completionRate?.toFixed(1) || '0.0'}%
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              الحالة
            </Typography>
            <Stack direction="row" spacing={2}>
              <Chip
                label={service.isActive ? 'نشط' : 'غير نشط'}
                color={service.isActive ? 'success' : 'default'}
                icon={service.isActive ? <CheckCircle /> : <Block />}
              />
              {service.specialization && (
                <Chip label={service.specialization} color="info" variant="outlined" />
              )}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderOfferDetails = () => (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              معلومات العرض
            </Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 56, height: 56 }}>
                <AttachMoney />
              </Avatar>
              <Box>
                <Typography variant="h6">{formatCurrency(service.amount)}</Typography>
                <Typography variant="body2" color="textSecondary">
                  قيمة العرض
                </Typography>
              </Box>
            </Box>
            {service.note && (
              <Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  ملاحظات:
                </Typography>
                <Typography variant="body2">{service.note}</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              معلومات المهندس
            </Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ mr: 2, bgcolor: 'success.main', width: 56, height: 56 }}>
                <Engineering />
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {service.engineer?.firstName} {service.engineer?.lastName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {service.engineer?.phone}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              معلومات الطلب
            </Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ mr: 2, bgcolor: 'info.main', width: 56, height: 56 }}>
                <Assignment />
              </Avatar>
              <Box>
                <Typography variant="h6">{service.request?.title}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {service.request?.type}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" mb={1}>
              <LocationOn sx={{ mr: 1, fontSize: '1rem', color: 'text.secondary' }} />
              <Typography variant="body2" color="textSecondary">
                المسافة: {service.distanceKm ? `${service.distanceKm} كم` : 'غير محدد'}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" mb={1}>
              <Schedule sx={{ mr: 1, fontSize: '1rem', color: 'text.secondary' }} />
              <Typography variant="body2" color="textSecondary">
                التاريخ: {formatDate(service.createdAt)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderContent = () => {
    switch (type) {
      case 'request':
        return renderRequestDetails();
      case 'engineer':
        return renderEngineerDetails();
      case 'offer':
        return renderOfferDetails();
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{renderContent()}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>إغلاق</Button>
      </DialogActions>
    </Dialog>
  );
};
