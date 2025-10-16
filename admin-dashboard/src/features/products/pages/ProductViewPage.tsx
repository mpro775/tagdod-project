import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  Avatar,
  Card,
  CardContent,
  CardMedia,
  Alert,
  CircularProgress,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Inventory,
  Star,
  Visibility,
  ShoppingCart,
  Share,
} from '@mui/icons-material';
import { useProduct } from '../hooks/useProducts';
import { formatCurrency, formatDate } from '@/shared/utils/formatters';
import type { Product } from '../types/product.types';

export const ProductViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState(0);

  const { data: productData, isLoading } = useProduct(id!);

  const product = productData?.product;
  const variants = productData?.variants || [];
  const attributes = productData?.attributes || [];

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Alert severity="error">
        المنتج غير موجود
      </Alert>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'draft':
        return 'default';
      case 'out_of_stock':
        return 'warning';
      case 'discontinued':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'draft':
        return 'مسودة';
      case 'out_of_stock':
        return 'نفذ';
      case 'discontinued':
        return 'متوقف';
      default:
        return status;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/products')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          {product.name}
        </Typography>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => navigate(`/products/${product._id}`)}
          >
            تعديل
          </Button>
          <Button
            variant="contained"
            startIcon={<Inventory />}
            onClick={() => navigate(`/products/${product._id}/variants`)}
          >
            المتغيرات
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              صور المنتج
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {product.mainImage && (
                <Card sx={{ maxWidth: 200 }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.mainImage}
                    alt={product.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent>
                    <Typography variant="caption" color="primary">
                      الصورة الرئيسية
                    </Typography>
                  </CardContent>
                </Card>
              )}
              {product.images?.map((image, index) => (
                <Card key={index} sx={{ maxWidth: 150 }}>
                  <CardMedia
                    component="img"
                    height="150"
                    image={image}
                    alt={`${product.name} - ${index + 1}`}
                    sx={{ objectFit: 'cover' }}
                  />
                </Card>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              معلومات المنتج
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  الاسم بالعربية
                </Typography>
                <Typography variant="body1">{product.name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  الاسم بالإنجليزية
                </Typography>
                <Typography variant="body1">{product.nameEn}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  الحالة
                </Typography>
                <Chip
                  label={getStatusLabel(product.status)}
                  color={getStatusColor(product.status) as any}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  رقم المنتج
                </Typography>
                <Typography variant="body1">{product.sku || '-'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  الفئة
                </Typography>
                <Typography variant="body1">
                  {product.category?.name || '-'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  العلامة التجارية
                </Typography>
                <Typography variant="body1">
                  {product.brand?.name || '-'}
                </Typography>
              </Grid>
            </Grid>

            {/* Badges */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                الشارات
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {product.isFeatured && (
                  <Chip
                    icon={<Star />}
                    label="مميز"
                    color="warning"
                    variant="outlined"
                    size="small"
                  />
                )}
                {product.isNew && (
                  <Chip
                    label="جديد"
                    color="info"
                    variant="outlined"
                    size="small"
                  />
                )}
                {product.isBestseller && (
                  <Chip
                    label="الأكثر مبيعاً"
                    color="success"
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Tabs for Additional Info */}
        <Grid item xs={12}>
          <Paper>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
              <Tab label="الوصف" />
              <Tab label="المتغيرات" />
              <Tab label="السمات" />
              <Tab label="SEO" />
              <Tab label="الإحصائيات" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {/* Description Tab */}
              {activeTab === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      الوصف بالعربية
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {product.description}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      الوصف بالإنجليزية
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {product.descriptionEn}
                    </Typography>
                  </Grid>
                </Grid>
              )}

              {/* Variants Tab */}
              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    متغيرات المنتج ({variants.length})
                  </Typography>
                  {variants.length > 0 ? (
                    <Grid container spacing={2}>
                      {variants.map((variant) => (
                        <Grid item xs={12} md={6} lg={4} key={variant._id}>
                          <Card>
                            <CardContent>
                              <Typography variant="subtitle1" gutterBottom>
                                {variant.sku || 'بدون SKU'}
                              </Typography>
                              <Box sx={{ mb: 1 }}>
                                {variant.attributeValues?.map((attr, index) => (
                                  <Chip
                                    key={index}
                                    label={`${attr.name}: ${attr.value}`}
                                    size="small"
                                    sx={{ mr: 0.5, mb: 0.5 }}
                                  />
                                ))}
                              </Box>
                              <Typography variant="h6" color="primary">
                                {formatCurrency(variant.price)}
                              </Typography>
                              {variant.compareAtPrice && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ textDecoration: 'line-through' }}
                                >
                                  {formatCurrency(variant.compareAtPrice)}
                                </Typography>
                              )}
                              <Typography variant="body2">
                                المخزون: {variant.stock}
                              </Typography>
                              <Chip
                                label={variant.isActive ? 'نشط' : 'غير نشط'}
                                color={variant.isActive ? 'success' : 'default'}
                                size="small"
                                sx={{ mt: 1 }}
                              />
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Alert severity="info">
                      لا توجد متغيرات لهذا المنتج
                    </Alert>
                  )}
                </Box>
              )}

              {/* Attributes Tab */}
              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    سمات المنتج ({attributes.length})
                  </Typography>
                  {attributes.length > 0 ? (
                    <Grid container spacing={2}>
                      {attributes.map((attr) => (
                        <Grid item xs={12} md={6} key={attr._id}>
                          <Card>
                            <CardContent>
                              <Typography variant="subtitle1" gutterBottom>
                                {attr.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {attr.nameEn}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                {attr.values?.map((value) => (
                                  <Chip
                                    key={value._id}
                                    label={value.value}
                                    size="small"
                                    variant="outlined"
                                    sx={{ mr: 0.5, mb: 0.5 }}
                                  />
                                ))}
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Alert severity="info">
                      لا توجد سمات مرتبطة بهذا المنتج
                    </Alert>
                  )}
                </Box>
              )}

              {/* SEO Tab */}
              {activeTab === 3 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      عنوان الصفحة (Meta Title)
                    </Typography>
                    <Typography variant="body1">
                      {product.metaTitle || 'غير محدد'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      وصف الصفحة (Meta Description)
                    </Typography>
                    <Typography variant="body1">
                      {product.metaDescription || 'غير محدد'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      الكلمات المفتاحية
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {product.metaKeywords?.map((keyword, index) => (
                        <Chip
                          key={index}
                          label={keyword}
                          size="small"
                          variant="outlined"
                        />
                      )) || (
                        <Typography variant="body2" color="text.secondary">
                          لا توجد كلمات مفتاحية
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              )}

              {/* Statistics Tab */}
              {activeTab === 4 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Visibility color="primary" />
                          <Box>
                            <Typography variant="h4">{product.viewsCount}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              المشاهدات
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ShoppingCart color="success" />
                          <Box>
                            <Typography variant="h4">{product.salesCount}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              المبيعات
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Inventory color="info" />
                          <Box>
                            <Typography variant="h4">{product.variantsCount}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              المتغيرات
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Star color="warning" />
                          <Box>
                            <Typography variant="h4">{product.averageRating.toFixed(1)}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              التقييم ({product.reviewsCount})
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      تاريخ الإنشاء
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(product.createdAt)}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                      آخر تحديث
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(product.updatedAt)}
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
