import { Box, Typography } from '@mui/material';
import { Map as MapIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { Address } from '../types/address.types';

interface AddressMapProps {
  address: Address;
}

export function AddressMap({ address }: AddressMapProps) {
  const { t } = useTranslation('addresses');

  // Check if coordinates are available
  if (!address.coords || !address.coords.lat || !address.coords.lng) {
    return (
      <Box
        sx={{
          mt: 3,
          p: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          textAlign: 'center',
          bgcolor: 'background.paper',
        }}
      >
        <MapIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          {t('map.noCoordinates', { defaultValue: 'لا توجد إحداثيات متاحة لهذا العنوان' })}
        </Typography>
      </Box>
    );
  }

  const { lat, lng } = address.coords;

  // Google Maps API Key from environment variables (optional)
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Google Maps Embed API URL
  // If API key is provided, use it. Otherwise, use a direct link approach
  const mapUrl = googleMapsApiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${lat},${lng}&zoom=15`
    : `https://maps.google.com/maps?q=${lat},${lng}&hl=ar&z=15&output=embed`;

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <MapIcon color="primary" />
        <Typography variant="h6" fontWeight="bold">
          {t('map.title', { defaultValue: '📍 موقع العنوان على الخريطة' })}
        </Typography>
      </Box>

      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: 300, sm: 400, md: 450 },
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 2,
        }}
      >
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={mapUrl}
          title={t('map.title', { defaultValue: 'موقع العنوان' })}
        />
      </Box>

      <Box sx={{ mt: 1.5, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="caption" color="text.secondary">
          <strong>{t('map.latitude', { defaultValue: 'خط العرض' })}:</strong> {lat.toFixed(6)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          <strong>{t('map.longitude', { defaultValue: 'خط الطول' })}:</strong> {lng.toFixed(6)}
        </Typography>
        <Box
          component="a"
          href={`https://www.google.com/maps?q=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            ml: 'auto',
            color: 'primary.main',
            textDecoration: 'none',
            fontSize: '0.75rem',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {t('map.openInGoogleMaps', { defaultValue: 'فتح في Google Maps' })}
        </Box>
      </Box>
    </Box>
  );
}
