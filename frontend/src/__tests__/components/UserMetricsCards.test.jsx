/**
 * UserMetricsCards Component Tests
 * Tests for the User Metrics KPI cards component
 */

import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserMetricsCards from '../../../features/equipment-maintenance/components/reports/UserMetricsCards';

describe('UserMetricsCards Component', () => {
  const mockMetrics = {
    totalUsers: 100,
    activeUsers: 75,
    newUsersThisMonth: 10,
    activityRate: 75,
    lockedAccounts: 5
  };

  test('renders all metric cards', () => {
    render(<UserMetricsCards metrics={mockMetrics} loading={false} />);
    
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('New Users')).toBeInTheDocument();
    expect(screen.getByText('Activity Rate')).toBeInTheDocument();
    expect(screen.getByText('Locked Accounts')).toBeInTheDocument();
  });

  test('displays correct metric values', () => {
    render(<UserMetricsCards metrics={mockMetrics} loading={false} />);
    
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('displays loading state', () => {
    const { container } = render(<UserMetricsCards metrics={null} loading={true} />);
    
    const loadingElements = container.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  test('handles null metrics gracefully', () => {
    render(<UserMetricsCards metrics={null} loading={false} />);
    
    // Should display 0 for all values when metrics is null
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThan(0);
  });

  test('displays subtitles correctly', () => {
    render(<UserMetricsCards metrics={mockMetrics} loading={false} />);
    
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    expect(screen.getByText('This month')).toBeInTheDocument();
    expect(screen.getByText('Login activity')).toBeInTheDocument();
    expect(screen.getByText('Security alerts')).toBeInTheDocument();
  });
});
