import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import {
  ExpandMore,
  ChevronRight,
  Edit,
  Delete,
  Folder,
  FolderOpen,
  Star,
} from '@mui/icons-material';
import { useCategoryTree } from '../hooks/useCategories';
import type { Category, CategoryTreeNode } from '../types/category.types';

interface CategoryTreeViewProps {
  // eslint-disable-next-line no-unused-vars
  onEdit?: (category: Category) => void;
  // eslint-disable-next-line no-unused-vars
  onDelete?: (category: Category) => void;
}

interface TreeNodeProps {
  node: CategoryTreeNode;
  level: number;
  // eslint-disable-next-line no-unused-vars
  onEdit?: (category: Category) => void;
  // eslint-disable-next-line no-unused-vars
  onDelete?: (category: Category) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, level, onEdit, onDelete }) => {
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
        }}
        secondaryAction={
          <Box display="flex" gap={0.5}>
            {onEdit && (
              <IconButton edge="end" size="small" onClick={() => onEdit(node)} color="primary">
                <Edit fontSize="small" />
              </IconButton>
            )}
            {onDelete && (
              <IconButton edge="end" size="small" onClick={() => onDelete(node)} color="error">
                <Delete fontSize="small" />
              </IconButton>
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
                {node.icon && <span>{node.icon}</span>}
                <Typography variant="body1" fontWeight={level === 0 ? 600 : 400}>
                  {node.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ({node.nameEn})
                </Typography>
                {node.isFeatured && <Star sx={{ fontSize: 16, color: 'warning.main' }} />}
              </Box>
            }
            secondary={
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                <Chip label={`${node.productsCount} منتج`} size="small" variant="outlined" />
                {hasChildren && (
                  <Chip
                    label={`${node.children.length} فئة فرعية`}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                )}
                <Chip
                  label={node.isActive ? 'نشط' : 'غير نشط'}
                  size="small"
                  color={node.isActive ? 'success' : 'default'}
                />
              </Box>
            }
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
              />
            ))}
          </List>
        </Collapse>
      )}
    </Box>
  );
};

export const CategoryTreeView: React.FC<CategoryTreeViewProps> = ({ onEdit, onDelete }) => {
  const { data: tree = [], isLoading } = useCategoryTree();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (tree.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          لا توجد فئات بعد. ابدأ بإضافة فئة رئيسية!
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper>
      <List>
        {tree.map((node) => (
          <TreeNode key={node._id} node={node} level={0} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </List>
    </Paper>
  );
};
