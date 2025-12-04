import React, { useState } from 'react';
import {
  Box,
  TextField,
  Stack,
  Typography,
  Paper,
  Button,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Avatar,
} from '@mui/material';
import { Add, Edit, Delete, Person } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import type { TeamMember } from '../types/about.types';

interface AboutTeamSectionProps {
  teamMembers: TeamMember[];
  language: 'ar' | 'en';
  onChange: (teamMembers: TeamMember[]) => void;
  disabled?: boolean;
}

const emptyMember: TeamMember = {
  nameAr: '',
  nameEn: '',
  positionAr: '',
  positionEn: '',
  image: '',
  linkedIn: '',
  isVisible: true,
  order: 0,
};

export const AboutTeamSection: React.FC<AboutTeamSectionProps> = ({
  teamMembers,
  language,
  onChange,
  disabled = false,
}) => {
  const { t } = useTranslation('about');
  const { isMobile } = useBreakpoint();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [currentMember, setCurrentMember] = useState<TeamMember>(emptyMember);

  const isArabic = language === 'ar';

  // Sort by order
  const sortedMembers = [...teamMembers].sort((a, b) => a.order - b.order);

  const handleAdd = () => {
    setEditIndex(null);
    setCurrentMember({
      ...emptyMember,
      order: teamMembers.length,
    });
    setDialogOpen(true);
  };

  const handleEdit = (index: number) => {
    const originalIndex = teamMembers.findIndex(
      (m) => m.nameAr === sortedMembers[index].nameAr && m.nameEn === sortedMembers[index].nameEn
    );
    setEditIndex(originalIndex);
    setCurrentMember(teamMembers[originalIndex]);
    setDialogOpen(true);
  };

  const handleDelete = (index: number) => {
    const memberToDelete = sortedMembers[index];
    const newMembers = teamMembers.filter(
      (m) => !(m.nameAr === memberToDelete.nameAr && m.nameEn === memberToDelete.nameEn)
    );
    onChange(newMembers);
  };

  const handleSave = () => {
    if (editIndex !== null) {
      const newMembers = [...teamMembers];
      newMembers[editIndex] = currentMember;
      onChange(newMembers);
    } else {
      onChange([...teamMembers, currentMember]);
    }
    setDialogOpen(false);
    setCurrentMember(emptyMember);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setCurrentMember(emptyMember);
    setEditIndex(null);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          {t('sections.team')} ({teamMembers.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAdd}
          disabled={disabled}
          size={isMobile ? 'small' : 'medium'}
        >
          {t('actions.addMember')}
        </Button>
      </Stack>

      {teamMembers.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography color="text.secondary">
            {t('empty.team')}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {sortedMembers.map((member, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
              <Card sx={{ opacity: member.isVisible ? 1 : 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                  <Avatar
                    src={member.image}
                    sx={{ width: 80, height: 80 }}
                  >
                    <Person sx={{ fontSize: 40 }} />
                  </Avatar>
                </Box>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {isArabic ? member.nameAr : member.nameEn}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isArabic ? member.positionAr : member.positionEn}
                  </Typography>
                  {!member.isVisible && (
                    <Typography variant="caption" color="warning.main">
                      {t('status.hidden')}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'center' }}>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(index)}
                    disabled={disabled}
                    color="primary"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(index)}
                    disabled={disabled}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog for add/edit */}
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {editIndex !== null ? t('dialogs.editMember') : t('dialogs.addMember')}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label={t('fields.nameAr')}
              value={currentMember.nameAr}
              onChange={(e) => setCurrentMember({ ...currentMember, nameAr: e.target.value })}
              dir="rtl"
            />
            <TextField
              fullWidth
              label={t('fields.nameEn')}
              value={currentMember.nameEn}
              onChange={(e) => setCurrentMember({ ...currentMember, nameEn: e.target.value })}
            />
            <TextField
              fullWidth
              label={t('fields.positionAr')}
              value={currentMember.positionAr}
              onChange={(e) => setCurrentMember({ ...currentMember, positionAr: e.target.value })}
              dir="rtl"
            />
            <TextField
              fullWidth
              label={t('fields.positionEn')}
              value={currentMember.positionEn}
              onChange={(e) => setCurrentMember({ ...currentMember, positionEn: e.target.value })}
            />
            <TextField
              fullWidth
              label={t('fields.image')}
              value={currentMember.image || ''}
              onChange={(e) => setCurrentMember({ ...currentMember, image: e.target.value })}
              helperText={t('helpers.memberImage')}
            />
            <TextField
              fullWidth
              label={t('fields.linkedIn')}
              value={currentMember.linkedIn || ''}
              onChange={(e) => setCurrentMember({ ...currentMember, linkedIn: e.target.value })}
            />
            <TextField
              fullWidth
              type="number"
              label={t('fields.order')}
              value={currentMember.order}
              onChange={(e) => setCurrentMember({ ...currentMember, order: parseInt(e.target.value) || 0 })}
              helperText={t('helpers.order')}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={currentMember.isVisible}
                  onChange={(e) => setCurrentMember({ ...currentMember, isVisible: e.target.checked })}
                />
              }
              label={t('fields.isVisible')}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('actions.cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!currentMember.nameAr || !currentMember.nameEn || !currentMember.positionAr || !currentMember.positionEn}
          >
            {t('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

