import React from 'react';
import { render, screen, act } from '@testing-library/react-native';
import { PointsCounter } from '../../../src/components/ui/PointsCounter';

describe('PointsCounter', () => {
  it('renders the initial points value', () => {
    render(<PointsCounter points={42} />);
    expect(screen.getByText('42')).toBeOnTheScreen();
  });

  it('has correct accessibilityLabel including points value', () => {
    render(<PointsCounter points={100} />);
    expect(screen.getByLabelText('100 points')).toBeOnTheScreen();
  });

  it('includes label in accessibilityLabel when label prop is provided', () => {
    render(<PointsCounter points={75} label="pts earned" />);
    expect(screen.getByLabelText('75 pts earned')).toBeOnTheScreen();
  });

  it('renders label text visually when provided', () => {
    render(<PointsCounter points={10} label="pts earned" />);
    expect(screen.getByText('pts earned')).toBeOnTheScreen();
  });

  it('does not render label element when label is not provided', () => {
    render(<PointsCounter points={10} />);
    expect(screen.queryByText('pts earned')).toBeNull();
  });

  it('snaps immediately to new value when animated=false', () => {
    const { rerender } = render(<PointsCounter points={0} animated={false} />);
    act(() => {
      rerender(<PointsCounter points={200} animated={false} />);
    });
    expect(screen.getByText('200')).toBeOnTheScreen();
  });

  it('snaps immediately when points decrease (regardless of animated)', () => {
    const { rerender } = render(<PointsCounter points={100} animated={true} />);
    act(() => {
      rerender(<PointsCounter points={50} animated={true} />);
    });
    expect(screen.getByText('50')).toBeOnTheScreen();
  });

  it('renders 0 for non-finite point values', () => {
    render(<PointsCounter points={NaN} />);
    expect(screen.getByText('0')).toBeOnTheScreen();
  });

  it('rounds fractional point values', () => {
    render(<PointsCounter points={9.7} animated={false} />);
    expect(screen.getByText('10')).toBeOnTheScreen();
  });
});
