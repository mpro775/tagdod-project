import React from 'react';
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
  FolderOpen,
  Star,
  VisibilityOff,
  Refresh,
  Add,
} from '@mui/icons-material';
import { useCategoryTree } from '../hooks/useCategories';
import type { Category, CategoryTreeNode } from '../types/category.types';

interface CategoryTreeViewProps {
  // eslint-disable-next-line no-unused-vars
  onEdit?: (category: Category) => void;
  // eslint-disable-next-line no-unused-vars
  onDelete?: (category: Category) => void;
  // eslint-disable-next-line no-unused-vars
  onAdd?: (parentId?: string) => void;
  showStats?: boolean;
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
              <Tooltip title="إضافة فئة فرعية">
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
              <Tooltip title="تعديل">
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
              <Tooltip title="حذف">
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

          {expanded ? (
            <FolderOpen sx={{ mr: 1, color: 'primary.main' }} />
          ) : (
            <Folder sx={{ mr: 1, color: 'text.secondary' }} />
          )}

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
                  <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                )}
                {!node.isActive && (
                  <VisibilityOff sx={{ fontSize: 16, color: 'text.disabled' }} />
                )}
              </Box>
            }
            secondary={
              showStats && (
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`${node.productsCount} منتج`} 
                    size="small" 
                    variant="outlined"
                    color={node.productsCount > 0 ? 'primary' : 'default'}
                  />
                  {hasChildren && (
                    <Chip
                      label={`${node.children.length} فئة فرعية`}
                      size="small"
                      variant="outlined"
                      color="secondary"
                    />
                  )}
                  <Chip
                    label={node.isActive ? 'نشط' : 'غير نشط'}
                    size="small"
                    color={node.isActive ? 'success' : 'default'}
                    variant="filled"
                  />
                  {node.order > 0 && (
                    <Chip
                      label={`ترتيب: ${node.order}`}
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
  showStats = true 
}) => {
  const { data: treeData, isLoading, error, refetch } = useCategoryTree();

  // Handle different response formats safely
  let tree: any[] = [];
  if (Array.isArray(treeData)) {
    tree = treeData;
  } else if (treeData && typeof treeData === 'object') {
    // Handle nested response format
    const data = treeData as any;
    tree = data.data || data.tree || [];
    // Ensure it's an array
    if (!Array.isArray(tree)) {
      tree = [];
    }
  }

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
              خطأ في تحميل شجرة الفئات
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
            إعادة المحاولة
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
            لا توجد فئات بعد
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            ابدأ بإضافة فئة رئيسية لتنظيم منتجاتك
          </Typography>
          {onAdd && (
            <Button 
              variant="contained" 
              startIcon={<Add />}
              onClick={() => onAdd()}
            >
              إضافة فئة رئيسية
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
            شجرة الفئات
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="إعادة تحميل">
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
                إضافة فئة
              </Button>
            )}
          </Box>
        </Box>

        {/* Quick Stats */}
        {showStats && (
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={`${totalCategories} فئة`} 
              color="primary" 
              variant="outlined" 
              size="small" 
            />
            <Chip 
              label={`${activeCategories} نشط`} 
              color="success" 
              variant="outlined" 
              size="small" 
            />
            <Chip 
              label={`${featuredCategories} مميز`} 
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
