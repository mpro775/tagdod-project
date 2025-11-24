import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Card,
  CardContent,
  Tooltip,
  Alert,
  Skeleton,
  Divider,
  Button,
} from '@mui/material';
import {
  ExpandMore,
  ChevronRight,
  Edit,
  Delete,
  Folder,
  Star,
  VisibilityOff,
  Refresh,
  Add,
} from '@mui/icons-material';
import { useCategoryTree } from '../hooks/useCategories';
import { CategoryImage } from './CategoryImage';
import type { Category, CategoryTreeNode, ListCategoriesParams } from '../types/category.types';

interface CategoryTreeViewProps {
  // eslint-disable-next-line no-unused-vars
  onEdit?: (category: Category) => void;
  // eslint-disable-next-line no-unused-vars
  onDelete?: (category: Category) => void;
  // eslint-disable-next-line no-unused-vars
  onAdd?: (parentId?: string) => void;
  showStats?: boolean;
  filters?: ListCategoriesParams;
}

interface TreeNodeProps {
  node: CategoryTreeNode;
  level: number;
  // eslint-disable-next-line no-unused-vars
  onEdit?: (category: Category) => void;
  // eslint-disable-next-line no-unused-vars
  onDelete?: (category: Category) => void;
  // eslint-disable-next-line no-unused-vars
  onAdd?: (parentId?: string) => void;
  showStats?: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  level,
  onEdit,
  onDelete,
  onAdd,
  showStats = true
}) => {
  const { t } = useTranslation('categories');
  const [expanded, setExpanded] = React.useState(level === 0);

  const hasChildren = node.children && node.children.length > 0;

  return (
    <Box>
      <ListItem
        disablePadding
        sx={{
          pl: level * 3,
          borderLeft: level > 0 ? '2px solid' : 'none',
          borderColor: 'divider',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
        secondaryAction={
          <Box display="flex" gap={0.5}>
            {onAdd && (
              <Tooltip title={t('tooltips.addSubcategory')}>
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => onAdd(node._id)}
                  color="success"
                >
                  <Add fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip title={t('tooltips.edit')}>
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => onEdit(node)}
                  color="primary"
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip title={t('tooltips.delete')}>
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => onDelete(node)}
                  color="error"
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        }
      >
        <ListItemButton onClick={() => hasChildren && setExpanded(!expanded)}>
          {hasChildren && (
            <IconButton size="small" sx={{ mr: 0.5 }}>
              {expanded ? <ExpandMore /> : <ChevronRight />}
            </IconButton>
          )}
          {!hasChildren && <Box sx={{ width: 32 }} />}

          <Box sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>
            <CategoryImage image={node.imageId} size={48} />
          </Box>

          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography 
                  variant="body1" 
                  fontWeight={level === 0 ? 600 : 400}
                  sx={{ 
                    color: node.isActive ? 'text.primary' : 'text.disabled',
                    textDecoration: !node.isActive ? 'line-through' : 'none'
                  }}
                >
                  {node.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: '0.75rem' }}
                >
                  ({node.nameEn})
                </Typography>
                {node.isFeatured && (
                  <Tooltip title={t('tooltips.featured')}>
                    <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                  </Tooltip>
                )}
                {!node.isActive && (
                  <Tooltip title={t('tooltips.inactive')}>
                    <VisibilityOff sx={{ fontSize: 16, color: 'text.disabled' }} />
                  </Tooltip>
                )}
              </Box>
            }
            secondary={
              showStats && (
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                  <Chip
                    label={t('tree.productsCount', { count: node.productsCount })}
                    size="small"
                    variant="outlined"
                    color={node.productsCount > 0 ? 'primary' : 'default'}
                  />
                  {hasChildren && (
                    <Chip
                      label={t('tree.subcategoriesCount', { count: node.children.length })}
                      size="small"
                      variant="outlined"
                      color="secondary"
                    />
                  )}
                  <Chip
                    label={node.isActive ? t('status.active') : t('status.inactive')}
                    size="small"
                    color={node.isActive ? 'success' : 'default'}
                    variant="filled"
                  />
                  {node.order > 0 && (
                    <Chip
                      label={t('tree.orderLabel', { order: node.order })}
                      size="small"
                      variant="outlined"
                      color="info"
                    />
                  )}
                </Box>
              )
            }
            secondaryTypographyProps={{
              component: 'div',
              sx: { display: 'block' }
            }}
          />
        </ListItemButton>
      </ListItem>

      {hasChildren && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {node.children.map((child) => (
              <TreeNode
                key={child._id}
                node={child}
                level={level + 1}
                onEdit={onEdit}
                onDelete={onDelete}
                onAdd={onAdd}
                showStats={showStats}
              />
            ))}
          </List>
        </Collapse>
      )}
    </Box>
  );
};

export const CategoryTreeView: React.FC<CategoryTreeViewProps> = ({
  onEdit,
  onDelete,
  onAdd,
  showStats = true,
  filters = {}
}) => {
  const { t } = useTranslation('categories');
  const { data: treeData, isLoading, error, refetch } = useCategoryTree();

  // Handle different response formats safely
  let allTree: any[] = [];
  if (Array.isArray(treeData)) {
    allTree = treeData;
  } else if (treeData && typeof treeData === 'object') {
    // Handle nested response format
    const data = treeData as any;
    allTree = data.data || data.tree || [];
    // Ensure it's an array
    if (!Array.isArray(allTree)) {
      allTree = [];
    }
  }

  // Apply filters to tree structure
  const tree = useMemo(() => {
    // If no filters, return all tree
    const hasFilters = 
      filters.search || 
      filters.isActive !== undefined || 
      filters.isFeatured !== undefined || 
      filters.parentId !== undefined ||
      filters.includeDeleted === false;
    
    if (!hasFilters || !allTree || allTree.length === 0) {
      return allTree;
    }

    const applyFilters = (nodes: CategoryTreeNode[]): CategoryTreeNode[] => {
      return nodes
        .map(node => {
          // Check if node matches filters
          let matches = true;

          // Search filter
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const matchesSearch = 
              node.name?.toLowerCase().includes(searchLower) ||
              node.nameEn?.toLowerCase().includes(searchLower) ||
              node.description?.toLowerCase().includes(searchLower);
            if (!matchesSearch) {
              matches = false;
            }
          }

          // Active filter
          if (filters.isActive !== undefined && node.isActive !== filters.isActive) {
            matches = false;
          }

          // Featured filter
          if (filters.isFeatured !== undefined && node.isFeatured !== filters.isFeatured) {
            matches = false;
          }

          // Parent filter - only filter root level nodes
          if (filters.parentId !== undefined) {
            if (filters.parentId === null) {
              // Show only root categories (parentId is null)
              if (node.parentId !== null) {
                matches = false;
              }
            } else {
              // Show only categories with specific parent
              if (node.parentId !== filters.parentId) {
                matches = false;
              }
            }
          }

          // Include deleted filter
          if (filters.includeDeleted === false && node.deletedAt) {
            matches = false;
          }

          // Recursively filter children
          const filteredChildren = node.children ? applyFilters(node.children) : [];

          // If node matches or has matching children, include it
          if (matches) {
            return {
              ...node,
              children: filteredChildren
            };
          } else if (filteredChildren.length > 0) {
            // Node doesn't match but has matching children, include it with filtered children
            return {
              ...node,
              children: filteredChildren
            };
          }

          return null;
        })
        .filter((node): node is CategoryTreeNode => node !== null);
    };

    return applyFilters(allTree);
  }, [allTree, filters.search, filters.isActive, filters.isFeatured, filters.parentId, filters.includeDeleted]);

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" width="60%" height={32} />
          </Box>
          <Skeleton variant="rectangular" height={200} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body1" fontWeight="bold">
              {t('tree.treeError')}
            </Typography>
            <Typography variant="body2">
              {error.message}
            </Typography>
          </Alert>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => refetch()}
          >
            {t('categories.retry')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!Array.isArray(tree) || tree.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Box sx={{ mb: 2 }}>
            <Folder sx={{ fontSize: 64, color: 'text.secondary' }} />
          </Box>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t('categories.noCategories')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t('categories.noCategoriesDesc')}
          </Typography>
          {onAdd && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => onAdd()}
            >
              {t('categories.addMainCategory')}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const totalCategories = tree.length;
  const activeCategories = tree.filter(node => node.isActive).length;
  const featuredCategories = tree.filter(node => node.isFeatured).length;

  return (
    <Card>
      <CardContent>
        {/* Header with Stats */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            {t('categories.categoryTree')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={t('tooltips.reload')}>
              <IconButton size="small" onClick={() => refetch()}>
                <Refresh />
              </IconButton>
            </Tooltip>
            {onAdd && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Add />}
                onClick={() => onAdd()}
              >
                {t('tree.addCategory')}
              </Button>
            )}
          </Box>
        </Box>

        {/* Quick Stats */}
        {showStats && (
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              label={t('tree.totalCategories', { count: totalCategories })}
              color="primary"
              variant="outlined"
              size="small"
            />
            <Chip
              label={t('tree.activeCategories', { count: activeCategories })}
              color="success"
              variant="outlined"
              size="small"
            />
            <Chip
              label={t('tree.featuredCategories', { count: featuredCategories })}
              color="warning"
              variant="outlined"
              size="small"
            />
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* Tree */}
        <List>
          {tree.map((node) => (
            <TreeNode 
              key={node._id || node.id} 
              node={node} 
              level={0} 
              onEdit={onEdit} 
              onDelete={onDelete}
              onAdd={onAdd}
              showStats={showStats}
            />
          ))}
        </List>
      </CardContent>
    </Card>
  );
};
