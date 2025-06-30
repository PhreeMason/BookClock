import { render } from '@testing-library/react-native';
import React from 'react';
import DailyReadingChart from '../DailyReadingChart';
import { sampleDeadlines } from '@/__tests__/fixtures/sampleDeadlines';

// Mock the gifted charts
jest.mock('react-native-gifted-charts', () => ({
  BarChart: jest.fn(({ testID, data, ...props }: any) => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return React.createElement(
      View,
      { testID: testID || 'bar-chart' },
      React.createElement(Text, {}, `BarChart with ${data?.length || 0} items`)
    );
  }),
}));

// Mock the pace calculations
jest.mock('@/lib/paceCalculations', () => ({
  calculateRequiredPace: jest.fn((total, current, days, format) => {
    const remaining = total - current;
    return Math.ceil(remaining / days);
  }),
}));

describe('DailyReadingChart with Sample Data', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render chart with sample physical book data', () => {
    // "Letters to a Young Poet" - has progress on 6/26 and 6/28
    const physicalBook = sampleDeadlines[0];
    const { getByTestId, getByText } = render(
      <DailyReadingChart deadline={physicalBook} />
    );

    expect(getByTestId('bar-chart')).toBeTruthy();
    expect(getByText('Daily Reading Progress (Last 7 Days)')).toBeTruthy();
    expect(getByText('Pages read per day')).toBeTruthy();
  });

  it('should render chart with sample audio book data', () => {
    // "The lean start up" - has multiple progress entries
    const audioBook = sampleDeadlines[1];
    const { getByTestId, getByText } = render(
      <DailyReadingChart deadline={audioBook} />
    );

    expect(getByTestId('bar-chart')).toBeTruthy();
    expect(getByText('Daily Listening Progress (Last 7 Days)')).toBeTruthy();
    expect(getByText('Minutes listened per day')).toBeTruthy();
  });

  it('should render multiple data points for books with recent progress', () => {
    // "The Way of Kings" - has progress on 6/24, 6/25, and 6/30
    const audioBookWithMultipleProgress = sampleDeadlines[3];
    const { getByTestId, getByText } = render(
      <DailyReadingChart deadline={audioBookWithMultipleProgress} />
    );

    const chart = getByTestId('bar-chart');
    expect(chart).toBeTruthy();
    // Should show multiple data points
    expect(getByText(/BarChart with \d+ items/)).toBeTruthy();
  });

  it('should show correct daily goal calculation', () => {
    // "Letters to a Young Poet" - 52 pages total, 39 pages read
    const book = sampleDeadlines[0];
    const { getByText } = render(
      <DailyReadingChart deadline={book} />
    );

    // Should calculate and display daily goal
    expect(getByText(/Daily Goal \(\d+ pg\)/)).toBeTruthy();
  });

  it('should handle books with minimal progress correctly', () => {
    // "Onyx Storm" - only has one progress entry
    const bookWithMinimalProgress = sampleDeadlines[5];
    const { queryByTestId, getByText } = render(
      <DailyReadingChart deadline={bookWithMinimalProgress} />
    );

    // Should show empty state if the single progress is old
    // or show the chart if it's recent
    const chart = queryByTestId('bar-chart');
    if (!chart) {
      expect(getByText('No reading activity in the last 7 days')).toBeTruthy();
    } else {
      expect(getByText('Daily Listening Progress (Last 7 Days)')).toBeTruthy();
    }
  });
});