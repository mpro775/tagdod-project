import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Error } from './Error';

describe('Error Component', () => {
  it('should render with default message', () => {
    render(<Error />);
    
    expect(screen.getByText('حدث خطأ غير متوقع')).toBeInTheDocument();
  });

  it('should render with custom message', () => {
    render(<Error message="Custom error message" />);
    
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should render error icon', () => {
    const { container } = render(<Error />);
    
    const icon = container.querySelector('[data-testid="ErrorOutlineIcon"]');
    expect(icon).toBeInTheDocument();
  });

  it('should render retry button', () => {
    render(<Error />);
    
    expect(screen.getByText('إعادة المحاولة')).toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<Error onRetry={onRetry} />);
    
    const retryButton = screen.getByText('إعادة المحاولة');
    fireEvent.click(retryButton);
    
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should reload page when retry clicked without onRetry prop', () => {
    const reloadSpy = vi.spyOn(window.location, 'reload');
    reloadSpy.mockImplementation(() => {});
    
    render(<Error />);
    
    const retryButton = screen.getByText('إعادة المحاولة');
    fireEvent.click(retryButton);
    
    expect(reloadSpy).toHaveBeenCalled();
    
    reloadSpy.mockRestore();
  });

  it('should render description when provided', () => {
    render(<Error description="This is a detailed description" />);
    
    expect(screen.getByText('This is a detailed description')).toBeInTheDocument();
  });

  it('should not render description by default', () => {
    const { container } = render(<Error />);
    
    const descriptions = container.querySelectorAll('.MuiTypography-body2');
    expect(descriptions).toHaveLength(0);
  });

  it('should show error details when showDetails is true', () => {
    const errorObj = { code: 500, message: 'Server error' };
    render(<Error error={errorObj} showDetails />);
    
    expect(screen.getByText('تفاصيل الخطأ:')).toBeInTheDocument();
  });

  it('should not show error details by default', () => {
    const errorObj = { code: 500, message: 'Server error' };
    render(<Error error={errorObj} />);
    
    expect(screen.queryByText('تفاصيل الخطأ:')).not.toBeInTheDocument();
  });

  it('should render error as string in details', () => {
    render(<Error error="String error message" showDetails />);
    
    expect(screen.getByText('String error message')).toBeInTheDocument();
  });

  it('should render error as JSON in details', () => {
    const errorObj = { code: 500, message: 'Server error' };
    render(<Error error={errorObj} showDetails />);
    
    const errorText = JSON.stringify(errorObj, null, 2);
    expect(screen.getByText(errorText)).toBeInTheDocument();
  });

  it('should apply custom sx prop', () => {
    const customSx = { backgroundColor: 'blue' };
    const { container } = render(<Error sx={customSx} />);
    
    const box = container.querySelector('.MuiBox-root');
    expect(box).toHaveStyle({ backgroundColor: 'blue' });
  });

  it('should have refresh icon on retry button', () => {
    const { container } = render(<Error />);
    
    const refreshIcon = container.querySelector('[data-testid="RefreshIcon"]');
    expect(refreshIcon).toBeInTheDocument();
  });
});

