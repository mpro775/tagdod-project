import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { Add, Edit, Delete, Visibility, ToggleOn, ToggleOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { usePriceRules, useDeletePriceRule, useTogglePriceRule } from '../hooks/useMarketing';

const PriceRulesListPage: React.FC = () => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<any>(null);
  const [filters, setFilters] = useState({
    search: '',
    active: ''
  });

  const { data: priceRules = [] } = usePriceRules(filters);
  const deletePriceRule = useDeletePriceRule();
  const togglePriceRule = useTogglePriceRule();

  const handleDelete = async () => {
    if (selectedRule) {
      await deletePriceRule.mutateAsync(selectedRule._id);
      setDeleteDialogOpen(false);
      setSelectedRule(null);
    }
  };

  const handleToggle = async (rule: any) => {
    await togglePriceRule.mutateAsync(rule._id);
  };

  const filteredRules = priceRules.filter(rule => {
    if (filters.search && !rule.metadata?.title?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.active && rule.active.toString() !== filters.active) {
      return false;
    }
    return true;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">قواعد الأسعار</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/admin/marketing/price-rules/create')}
        >
          إنشاء قاعدة سعر جديدة
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="البحث"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>الحالة</InputLabel>
              <Select
                value={filters.active}
                onChange={(e) => setFilters({ ...filters, active: e.target.value })}
                label="الحالة"
              >
                <MenuItem value="">الكل</MenuItem>
                <MenuItem value="true">نشط</MenuItem>
                <MenuItem value="false">غير نشط</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>العنوان</TableCell>
              <TableCell>الأولوية</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>تاريخ البداية</TableCell>
              <TableCell>تاريخ النهاية</TableCell>
              <TableCell>الإحصائيات</TableCell>
              <TableCell>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRules.map((rule) => (
              <TableRow key={rule._id}>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2">
                      {rule.metadata?.title || 'قاعدة سعر بدون عنوان'}
                    </Typography>
                    {rule.metadata?.description && (
                      <Typography variant="body2" color="text.secondary">
                        {rule.metadata.description}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>{rule.priority}</TableCell>
                <TableCell>
                  <Chip
                    label={rule.active ? 'نشط' : 'غير نشط'}
                    color={rule.active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {format(new Date(rule.startAt), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell>
                  {format(new Date(rule.endAt), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      المشاهدات: {rule.stats?.views || 0}
                    </Typography>
                    <Typography variant="body2">
                      التطبيقات: {rule.stats?.appliedCount || 0}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/admin/marketing/price-rules/${rule._id}`)}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/admin/marketing/price-rules/${rule._id}/edit`)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleToggle(rule)}
                      color={rule.active ? 'warning' : 'success'}
                    >
                      {rule.active ? <ToggleOff /> : <ToggleOn />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedRule(rule);
                        setDeleteDialogOpen(true);
                      }}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف قاعدة السعر "{selectedRule?.metadata?.title}"؟
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={deletePriceRule.isPending}
          >
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PriceRulesListPage;
