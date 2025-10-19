import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Chip, IconButton } from '@mui/material';
import { Favorite, FavoriteBorder, ShoppingCart } from '@mui/icons-material';
import { PriceDisplay } from '@/shared/components/PriceDisplay';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    nameEn?: string;
    description?: string;
    mainImage?: string;
    isFeatured?: boolean;
    isNew?: boolean;
    isBestseller?: boolean;
    status: string;
    variants?: Array<{
      _id: string;
      sku: string;
      attributes: Record<string, string>;
      prices?: Array<{
        basePriceUSD: number;
        compareAtUSD?: number;
        wholesalePriceUSD?: number;
      }>;
    }>;
  };
  // eslint-disable-next-line no-unused-vars
  onAddToCart?: (variantId: string) => void;
  // eslint-disable-next-line no-unused-vars
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
  className = '',
}) => {

  // الحصول على السعر الأساسي من أول variant
  const basePrice = product.variants?.[0]?.prices?.[0]?.basePriceUSD || 0;
  const comparePrice = product.variants?.[0]?.prices?.[0]?.compareAtUSD;

  // حساب نطاق الأسعار إذا كان هناك عدة variants
  const priceRange = product.variants?.length > 1 ? {
    min: Math.min(...(product.variants.map(v => v.prices?.[0]?.basePriceUSD || 0))),
    max: Math.max(...(product.variants.map(v => v.prices?.[0]?.basePriceUSD || 0)))
  } : null;

  const handleAddToCart = () => {
    if (product.variants?.[0]?._id) {
      onAddToCart?.(product.variants[0]._id);
    }
  };

  const handleToggleFavorite = () => {
    onToggleFavorite?.(product._id);
  };

  return (
    <Card className={`product-card ${className}`} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* الصورة */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={product.mainImage || '/placeholder-product.jpg'}
          alt={product.name}
          sx={{ objectFit: 'cover' }}
        />
        
        {/* الشارات */}
        <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {product.isNew && (
            <Chip label="جديد" color="info" size="small" />
          )}
          {product.isFeatured && (
            <Chip label="مميز" color="warning" size="small" />
          )}
          {product.isBestseller && (
            <Chip label="الأكثر مبيعاً" color="success" size="small" />
          )}
        </Box>

        {/* زر المفضلة */}
        <IconButton
          sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'white', '&:hover': { bgcolor: 'grey.100' } }}
          onClick={handleToggleFavorite}
        >
          {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
        </IconButton>
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* اسم المنتج */}
        <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 'medium' }}>
          {product.name}
        </Typography>
        
        {product.nameEn && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {product.nameEn}
          </Typography>
        )}

        {/* الوصف */}
        {product.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
            {product.description.length > 100 
              ? `${product.description.substring(0, 100)}...` 
              : product.description
            }
          </Typography>
        )}

        {/* السعر */}
        <Box sx={{ mb: 2 }}>
          {priceRange ? (
            <Box>
              <PriceDisplay 
                amountUSD={priceRange.min} 
                size="sm" 
                variant="highlight"
              />
              <Typography variant="body2" color="text.secondary">
                - 
              </Typography>
              <PriceDisplay 
                amountUSD={priceRange.max} 
                size="sm" 
                variant="highlight"
              />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PriceDisplay 
                amountUSD={basePrice} 
                size="lg" 
                variant="highlight"
              />
              {comparePrice && comparePrice > basePrice && (
                <PriceDisplay 
                  amountUSD={comparePrice} 
                  size="sm" 
                  variant="muted"
                />
              )}
            </Box>
          )}
        </Box>

        {/* زر إضافة للسلة */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            variant="contained"
            color="primary"
            onClick={handleAddToCart}
            disabled={product.status !== 'active'}
            sx={{ 
              flexGrow: 1,
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
              '&:disabled': { bgcolor: 'grey.300' }
            }}
          >
            <ShoppingCart sx={{ mr: 1 }} />
            {product.status === 'active' ? 'أضف للسلة' : 'غير متوفر'}
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
