import React from 'react';
import { Box } from '@mui/material';
import type { Product } from '../types/product.types';

type ProductImageSource =
  | string
  | {
      url?: string;
      storedFilename?: string;
      filename?: string;
    }
  | null
  | undefined;

interface ProductImageProps {
  image?: ProductImageSource;
  fallbackImages?: ProductImageSource[];
  size?: number;
  className?: string;
}

const resolveImageUrl = (source?: ProductImageSource): string | undefined => {
  if (!source) return undefined;

  if (typeof source === 'string') {
    if (source.startsWith('http')) {
      return source;
    }
    return undefined;
  }

  if (typeof source === 'object' && source !== null) {
    if (typeof source.url === 'string' && source.url.trim().length > 0) {
      return source.url;
    }
    if (typeof source.storedFilename === 'string' && source.storedFilename.trim().length > 0) {
      return source.storedFilename;
    }
  }

  return undefined;
};

export const ProductImage: React.FC<ProductImageProps> = ({
  image,
  fallbackImages = [],
  size = 40,
  className,
}) => {
  const sources = [image, ...fallbackImages];
  const imageUrl = sources.map(resolveImageUrl).find((url) => Boolean(url));

  if (imageUrl) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.200',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          backgroundColor: 'grey.50',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            transform: 'scale(1.05)',
          },
        }}
        className={className}
      >
        <Box
          component="img"
          src={imageUrl}
          alt="Product"
          loading="lazy"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            padding: 0.5,
          }}
          onError={(event) => {
            event.currentTarget.src =
              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect width="60" height="60" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" fill="%23999"%3E🛒%3C/text%3E%3C/svg%3E';
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        fontSize: size * 0.5,
        color: 'grey.400',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'grey.200',
        flexShrink: 0,
        backgroundColor: 'grey.50',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      }}
      className={className}
    >
      🛒
    </Box>
  );
};

