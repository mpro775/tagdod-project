import React from 'react';
import { Box } from '@mui/material';
import type { Media } from '../types/category.types';

interface CategoryImageProps {
  image?: string | Media | null;
  size?: number;
  className?: string;
}

export const CategoryImage: React.FC<CategoryImageProps> = ({
  image,
  size = 32,
  className
}) => {
  const getImageUrl = (image: string | Media | null | undefined): string | undefined => {
    if (!image) return undefined;
    
    // If it's already a Media object with a URL, use it
    if (typeof image === 'object' && image !== null && 'url' in image) {
      const url = image.url;
      // Ensure URL is valid
      if (url && typeof url === 'string' && url.trim().length > 0) {
        return url;
      }
    }
    
    // If it's a string (ID), we can't construct a URL without fetching the media
    // In this case, return undefined to show the fallback icon
    // The backend should populate imageId when fetching categories
    return undefined;
  };

  const imageUrl = getImageUrl(image);

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
          alt="Category"
          loading="lazy"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            padding: 0.5,
          }}
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect width="60" height="60" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" fill="%23999"%3E📁%3C/text%3E%3C/svg%3E';
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
      📁
    </Box>
  );
};
