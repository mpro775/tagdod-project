import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loading } from './Loading';

describe('Loading Component', () => {
  it('should render with default message', () => {
    render(<Loading />);
    
    expect(screen.getByText('جاري التحميل...')).toBeInTheDocument();
  });

  it('should render with custom message', () => {
    render(<Loading message="Loading data..." />);
    
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('should render CircularProgress component', () => {
    const { container } = render(<Loading />);
    
    const progress = container.querySelector('.MuiCircularProgress-root');
    expect(progress).toBeInTheDocument();
  });

  it('should render with large size by default', () => {
    const { container } = render(<Loading />);
    
    const progress = container.querySelector('.MuiCircularProgress-root');
    expect(progress).toHaveStyle({ width: '60px', height: '60px' });
  });

  it('should render with medium size', () => {
    const { container } = render(<Loading size="medium" />);
    
    const progress = container.querySelector('.MuiCircularProgress-root');
    expect(progress).toHaveStyle({ width: '40px', height: '40px' });
  });

  it('should render with small size', () => {
    const { container } = render(<Loading size="small" />);
    
    const progress = container.querySelector('.MuiCircularProgress-root');
    expect(progress).toHaveStyle({ width: '24px', height: '24px' });
  });

  it('should apply fullScreen styles when enabled', () => {
    const { container } = render(<Loading fullScreen />);
    
    const box = container.querySelector('.MuiBox-root');
    expect(box).toHaveStyle({ minHeight: '100vh' });
  });

  it('should not apply fullScreen styles by default', () => {
    const { container } = render(<Loading />);
    
    const box = container.querySelector('.MuiBox-root');
    expect(box).not.toHaveStyle({ minHeight: '100vh' });
  });

  it('should apply custom sx prop', () => {
    const customSx = { backgroundColor: 'red' };
    const { container } = render(<Loading sx={customSx} />);
    
    const box = container.querySelector('.MuiBox-root');
    expect(box).toHaveStyle({ backgroundColor: 'red' });
  });

  it('should be accessible', () => {
    render(<Loading message="Loading content" />);
    
    expect(screen.getByText('Loading content')).toBeInTheDocument();
  });
});

