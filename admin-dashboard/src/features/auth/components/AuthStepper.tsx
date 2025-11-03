import React from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledStepper = styled(Stepper)(({ theme }) => ({
  '& .MuiStepLabel-root': {
    padding: 0,
  },
  '& .MuiStepLabel-label': {
    fontSize: '0.8rem',
    fontWeight: 500,
    fontFamily: 'Cairo',
    color: theme.palette.text.secondary,
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.7rem',
    },
  },
  '& .MuiStepLabel-label.Mui-active': {
    color: theme.palette.mode === 'dark' ? '#8b9aff' : '#667eea',
    fontWeight: 600,
  },
  '& .MuiStepLabel-label.Mui-completed': {
    color: theme.palette.mode === 'dark' ? '#8b9aff' : '#667eea',
    fontWeight: 600,
  },
  '& .MuiStepIcon-root': {
    color: theme.palette.grey[300],
    '&.Mui-active': {
      color: theme.palette.mode === 'dark' ? '#8b9aff' : '#667eea',
    },
    '&.Mui-completed': {
      color: theme.palette.mode === 'dark' ? '#8b9aff' : '#667eea',
    },
  },
  '& .MuiStepConnector-line': {
    borderColor: theme.palette.grey[300],
    borderTopWidth: 2,
  },
  '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
    borderColor: theme.palette.mode === 'dark' ? '#8b9aff' : '#667eea',
  },
  '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
    borderColor: theme.palette.mode === 'dark' ? '#8b9aff' : '#667eea',
  },
  [theme.breakpoints.down('sm')]: {
    '& .MuiStepIcon-root': {
      width: 28,
      height: 28,
    },
  },
}));

interface AuthStepperProps {
  activeStep: number;
  steps: string[];
  showStepper?: boolean;
}

export const AuthStepper: React.FC<AuthStepperProps> = ({
  activeStep,
  steps,
  showStepper = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!showStepper || isMobile) {
    return null;
  }

  return (
    <Box sx={{ mb: { xs: 2, sm: 4 } }}>
      <StyledStepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontSize: { xs: '0.7rem', sm: '0.75rem' }, 
                  fontFamily: 'Cairo' 
                }}
              >
                {label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </StyledStepper>
    </Box>
  );
};
