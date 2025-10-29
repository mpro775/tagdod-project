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
          border: '2px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          backgroundColor: 'grey.50',
          boxShadow: 1,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'rgba(0,0,0,0.05)',
            pointerEvents: 'none',
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
            objectFit: 'cover', // Use cover for better visibility
            display: 'block',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
          onError={(e) => {
            // Fallback to folder icon if image fails to load
            const target = e.target as HTMLImageElement;
            const parent = target.parentElement;
            if (parent) {
              target.style.display = 'none';
              parent.innerHTML = `<span style="font-size: ${size * 0.5}px; color: #999;">📁</span>`;
            }
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        fontSize: size * 0.5,
        color: 'text.secondary',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: 2,
        border: '2px solid',
        borderColor: 'divider',
        flexShrink: 0,
        backgroundColor: 'grey.50',
        boxShadow: 1,
      }}
      className={className}
    >
      📁
    </Box>
  );
};
