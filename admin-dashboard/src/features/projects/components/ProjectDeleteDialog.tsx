import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, useMediaQuery, Theme } from '@mui/material';
import { Warning } from '@mui/icons-material';
import type { Project } from '../types/project.types';

interface ProjectDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  project: Project | null;
  loading?: boolean;
}

export const ProjectDeleteDialog: React.FC<ProjectDeleteDialogProps> = ({ open, onClose, onConfirm, project, loading }) => {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  return (
  <Dialog open={open} onClose={onClose} fullScreen={isMobile}>
    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Warning color="error" />تأكيد الحذف</DialogTitle>
    <DialogContent>
      <Typography>هل أنت متأكد من حذف المشروع "{project?.titleAr}"؟ لا يمكن التراجع عن هذا الإجراء.</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>إلغاء</Button>
      <Button variant="contained" color="error" onClick={onConfirm} disabled={loading}>حذف</Button>
    </DialogActions>
  </Dialog>
  );
};
