import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Empty } from './Empty';

describe('Empty Component', () => {
  it('should render with default message', () => {
    render(<Empty />);
    
    expect(screen.getByText('لا توجد بيانات')).toBeInTheDocument();
  });

  it('should render with custom message', () => {
    render(<Empty message="No items found" />);
    
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('should render empty icon', () => {
    const { container } = render(<Empty />);
    
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should render description when provided', () => {
    render(<Empty description="Try adjusting your filters" />);
    
    expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
  });

  it('should not render description by default', () => {
    render(<Empty />);
    
    expect(screen.queryByText(/Try/)).not.toBeInTheDocument();
  });

  it('should render action button when provided', () => {
    const action = vi.fn();
    render(<Empty onAction={action} actionLabel="Add Item" />);
    
    expect(screen.getByText('Add Item')).toBeInTheDocument();
  });

  it('should call action when button is clicked', () => {
    const action = vi.fn();
    render(<Empty onAction={action} actionLabel="Add Item" />);
    
    const button = screen.getByText('Add Item');
    fireEvent.click(button);
    
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('should not render action button without action prop', () => {
    render(<Empty actionLabel="Add Item" />);
    
    expect(screen.queryByText('Add Item')).not.toBeInTheDocument();
  });

  it('should apply custom sx prop', () => {
    const customSx = { padding: '2rem' };
    const { container } = render(<Empty sx={customSx} />);
    
    const box = container.querySelector('.MuiBox-root');
    expect(box).toHaveStyle({ padding: '2rem' });
  });
});

