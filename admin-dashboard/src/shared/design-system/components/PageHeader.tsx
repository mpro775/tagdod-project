import type { ReactNode } from 'react';
import {
  Breadcrumbs,
  Button,
  CircularProgress,
  Link as MuiLink,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

export interface PageHeaderAction {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  to?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; to?: string }>;
  actions?: PageHeaderAction[];
  meta?: ReactNode;
}

const getButtonProps = (variant: PageHeaderAction['variant'] = 'secondary') => {
  if (variant === 'primary') {
    return { variant: 'contained' as const, color: 'primary' as const };
  }
  if (variant === 'danger') {
    return { variant: 'contained' as const, color: 'error' as const };
  }
  if (variant === 'ghost') {
    return { variant: 'text' as const, color: 'inherit' as const };
  }
  return { variant: 'outlined' as const, color: 'primary' as const };
};

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions = [],
  meta,
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <Stack spacing={1.5}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: '0.8125rem' }}>
          {breadcrumbs.map((crumb, index) =>
            crumb.to ? (
              <MuiLink
                key={`${crumb.label}-${index}`}
                component={RouterLink}
                to={crumb.to}
                underline="hover"
                color="text.secondary"
              >
                {crumb.label}
              </MuiLink>
            ) : (
              <Typography key={`${crumb.label}-${index}`} variant="body2" color="text.primary">
                {crumb.label}
              </Typography>
            )
          )}
        </Breadcrumbs>
      )}

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'flex-start' }}
        justifyContent="space-between"
        spacing={2}
      >
        <Stack spacing={0.75} sx={{ minWidth: 0 }}>
          <Typography
            component="h1"
            variant="h4"
            sx={{ fontWeight: 800, letterSpacing: 0, lineHeight: 1.35 }}
          >
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
          {meta}
        </Stack>

        {actions.length > 0 && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            justifyContent="flex-end"
            sx={{ width: { xs: '100%', md: 'auto' } }}
          >
            {actions.map((action) => {
              const buttonProps = getButtonProps(action.variant);

              return (
                <Button
                  key={action.label}
                  {...buttonProps}
                  startIcon={
                    action.loading ? <CircularProgress color="inherit" size={16} /> : action.icon
                  }
                  onClick={() => {
                    action.onClick?.();
                    if (action.to) {
                      navigate(action.to);
                    }
                  }}
                  disabled={action.disabled || action.loading}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {action.label}
                </Button>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}

export default PageHeader;
