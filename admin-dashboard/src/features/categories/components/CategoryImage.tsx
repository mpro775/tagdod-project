import React from 'react';
import { Box } from '@mui/material';
import type { Media } from '../types/category.types';

interface CategoryImageProps {
  image?: string | Media;
  size?: number;
  className?: string;
}

export const CategoryImage: React.FC<CategoryImageProps> = ({
  image,
  size = 32,
  className
}) => {
  const getImageUrl = (image: string | Media): string | undefined => {
    if (typeof image === 'string') return undefined;
    return image?.url;
  };

  const imageUrl = image ? getImageUrl(image) : undefined;

  if (imageUrl) {
    return (
      <Box
        component="img"
        src={imageUrl}
        alt="Category"
        className={className}
        sx={{
          width: size,
          height: size,
          borderRadius: 1,
          objectFit: 'cover',
          border: '1px solid',
          borderColor: 'divider',
        }}
        onError={(e) => {
          // Fallback to folder icon if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = '📁';
            (parent as HTMLElement).style.fontSize = `${size * 0.8}px`;
            (parent as HTMLElement).style.color = '#666';
          }
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        fontSize: size * 0.8,
        color: 'text.secondary',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
      }}
      className={className}
    >
      📁
    </Box>
  );
};
