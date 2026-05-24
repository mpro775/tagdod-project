import type { ReactNode } from 'react';
import {
  Breadcrumbs,
  Button,
  CircularProgress,
  Link as MuiLink,
  Stack,
  Typography,
  useMediaQuery,
  Theme,
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
  variant?: 'default' | 'compact';
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
  variant = 'default',
}: PageHeaderProps) {
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const primaryAction = actions.find((a) => a.variant === 'primary');
  const secondaryActions = actions.filter((a) => a.variant !== 'primary');
  const isCompact = variant === 'compact';

  if (isCompact) {
    return (
      <Stack spacing={0.5}>
        {breadcrumbs && breadcrumbs.length > 0 && !isMobile && (
          <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: '0.75rem', '& .MuiBreadcrumbs-separator': { mx: 0.5 } }}>
            {breadcrumbs.map((crumb, index) =>
              crumb.to ? (
                <MuiLink
                  key={`${crumb.label}-${index}`}
                  component={RouterLink}
                  to={crumb.to}
                  underline="hover"
                  color="text.secondary"
                  sx={{ fontSize: '0.75rem' }}
                >
                  {crumb.label}
                </MuiLink>
              ) : (
                <Typography key={`${crumb.label}-${index}`} variant="caption" color="text.primary">
                  {crumb.label}
                </Typography>
              )
            )}
          </Breadcrumbs>
        )}

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1.5}
        >
          <Stack spacing={0} sx={{ minWidth: 0, overflow: 'hidden' }}>
            <Typography
              component="h1"
              variant="h6"
              sx={{ fontWeight: 700, letterSpacing: 0, lineHeight: 1.3, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
              noWrap={isMobile}
            >
              {title}
            </Typography>
            {description && (
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                {description}
              </Typography>
            )}
          </Stack>

          {actions.length > 0 && (
            <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0 }}>
              {actions.map((action) => {
                const buttonProps = getButtonProps(action.variant);
                return (
                  <Button
                    key={action.label}
                    {...buttonProps}
                    size="small"
                    startIcon={
                      action.loading ? <CircularProgress color="inherit" size={14} /> : action.icon
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
        {meta}
      </Stack>
    );
  }

  return (
    <Stack spacing={1.5}>
      {breadcrumbs && breadcrumbs.length > 0 && !isMobile && (
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
        <Stack spacing={0.75} sx={{ minWidth: 0, overflow: 'hidden' }}>
          <Typography
            component="h1"
            variant={isMobile ? 'h5' : 'h4'}
            sx={{ fontWeight: 800, letterSpacing: 0, lineHeight: 1.35 }}
            noWrap={isMobile}
          >
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '100%' }}>
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
            sx={{ width: { xs: '100%', md: 'auto' }, flexShrink: 0 }}
          >
            {isMobile ? (
              <>
                {primaryAction && (
                  <Button
                    key={primaryAction.label}
                    {...getButtonProps(primaryAction.variant)}
                    fullWidth
                    startIcon={
                      primaryAction.loading ? (
                        <CircularProgress color="inherit" size={16} />
                      ) : (
                        primaryAction.icon
                      )
                    }
                    onClick={() => {
                      primaryAction.onClick?.();
                      if (primaryAction.to) {
                        navigate(primaryAction.to);
                      }
                    }}
                    disabled={primaryAction.disabled || primaryAction.loading}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    {primaryAction.label}
                  </Button>
                )}
                {secondaryActions.slice(0, 2).map((action) => {
                  const buttonProps = getButtonProps(action.variant);
                  return (
                    <Button
                      key={action.label}
                      {...buttonProps}
                      fullWidth
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
              </>
            ) : (
              actions.map((action) => {
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
              })
            )}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}

export default PageHeader;