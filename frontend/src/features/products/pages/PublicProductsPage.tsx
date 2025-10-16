import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, TextField, Select, MenuItem, FormControl, InputLabel, Button, Chip } from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import ProductCard from '../components/ProductCard';
import { CurrencySelector } from '@/shared/components/CurrencySelector';
import { useCurrency } from '@/shared/hooks/useCurrency';

interface Product {
  _id: string;
  name: string;
  nameEn?: string;
  description?: string;
  mainImage?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  status: string;
  category?: {
    name: string;
  };
  brand?: {
    name: string;
  };
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
}

interface PublicProductsPageProps {
  className?: string;
}

export const PublicProductsPage: React.FC<PublicProductsPageProps> = ({
  className = '',
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { selectedCurrency } = useCurrency();

  // تحميل المنتجات
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        currency: selectedCurrency,
        ...(search && { search }),
        ...(categoryFilter && { categoryId: categoryFilter }),
        ...(brandFilter && { brandId: brandFilter }),
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/catalog/products?${params}`);
      if (!response.ok) {
        throw new Error('Failed to load products');
      }

      const data = await response.json();
      setProducts(data.data || []);
      setTotalPages(Math.ceil((data.meta?.total || 0) / 12));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page, selectedCurrency, search, categoryFilter, brandFilter, sortBy, sortOrder]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    setPage(1);
  };

  const handleBrandFilter = (value: string) => {
    setBrandFilter(value);
    setPage(1);
  };

  const handleSort = (field: string, order: 'asc' | 'desc') => {
    setSortBy(field);
    setSortOrder(order);
    setPage(1);
  };

  const handleAddToCart = (variantId: string) => {
    // TODO: تنفيذ إضافة للسلة
    console.log('Add to cart:', variantId);
  };

  const handleToggleFavorite = (productId: string) => {
    // TODO: تنفيذ إضافة/إزالة من المفضلة
    console.log('Toggle favorite:', productId);
  };

  if (error) {
    return (
      <Box className={`public-products-page ${className}`} sx={{ p: 3 }}>
        <Typography color="error" variant="h6">
          خطأ في تحميل المنتجات: {error}
        </Typography>
        <Button onClick={loadProducts} sx={{ mt: 2 }}>
          إعادة المحاولة
        </Button>
      </Box>
    );
  }

  return (
    <Box className={`public-products-page ${className}`}>
      {/* Header */}
      <Box sx={{ bgcolor: 'grey.50', p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
          منتجاتنا
        </Typography>
        
        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="البحث في المنتجات..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ minWidth: 200 }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>الفئة</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              label="الفئة"
            >
              <MenuItem value="">جميع الفئات</MenuItem>
              {/* TODO: تحميل الفئات من API */}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>العلامة</InputLabel>
            <Select
              value={brandFilter}
              onChange={(e) => handleBrandFilter(e.target.value)}
              label="العلامة"
            >
              <MenuItem value="">جميع العلامات</MenuItem>
              {/* TODO: تحميل العلامات من API */}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>الترتيب</InputLabel>
            <Select
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('_');
                handleSort(field, order as 'asc' | 'desc');
              }}
              label="الترتيب"
            >
              <MenuItem value="createdAt_desc">الأحدث</MenuItem>
              <MenuItem value="createdAt_asc">الأقدم</MenuItem>
              <MenuItem value="name_asc">الاسم أ-ي</MenuItem>
              <MenuItem value="name_desc">الاسم ي-أ</MenuItem>
              <MenuItem value="basePriceUSD_asc">السعر من الأقل</MenuItem>
              <MenuItem value="basePriceUSD_desc">السعر من الأعلى</MenuItem>
            </Select>
          </FormControl>

          <CurrencySelector size="sm" />
        </Box>
      </Box>

      {/* Products Grid */}
      <Box sx={{ px: 3 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography>جاري التحميل...</Typography>
          </Box>
        ) : products.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              لا توجد منتجات متاحة
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                <ProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 1 }}>
            <Button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              السابق
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === page ? 'contained' : 'outlined'}
                onClick={() => setPage(pageNum)}
                sx={{ minWidth: 40 }}
              >
                {pageNum}
              </Button>
            ))}
            
            <Button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              التالي
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PublicProductsPage;
