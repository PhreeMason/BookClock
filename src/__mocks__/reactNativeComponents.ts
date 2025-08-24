/**
 * Centralized mocks for React Native component libraries
 * This file contains mock implementations for RN components that require special handling
 */

import React from 'react';

// React Native Calendars Mock
export const mockCalendar = jest.fn(({ onDayPress, markedDates }: any) => {
  const { View, TouchableOpacity, Text } = require('react-native');
  return React.createElement(
    View,
    { testID: 'calendar-mock' },
    markedDates && Object.keys(markedDates).map((date) =>
      React.createElement(
        TouchableOpacity,
        {
          key: date,
          testID: `day-${date}`,
          onPress: () => onDayPress?.({ dateString: date })
        },
        React.createElement(Text, null, date)
      )
    )
  );
});

jest.mock('react-native-calendars', () => ({
  Calendar: mockCalendar,
  CalendarList: mockCalendar,
  Agenda: mockCalendar,
}));

// React Native Gifted Charts Mock
export const mockLineChart = jest.fn(({ testID, data, areaChart }: any) => {
  const { View, Text } = require('react-native');
  return React.createElement(
    View,
    { testID: testID || 'line-chart' },
    React.createElement(Text, null, `${areaChart ? 'Area' : 'Line'}Chart with ${data?.length || 0} points`),
    data && React.createElement(Text, { testID: 'chart-data' }, JSON.stringify(data))
  );
});

export const mockBarChart = jest.fn((props: any) => {
  const { View, Text } = require('react-native');
  return React.createElement(
    View,
    { testID: 'bar-chart-mock' },
    React.createElement(Text, null, 'BarChart'),
    props.data && React.createElement(Text, { testID: 'chart-data' }, JSON.stringify(props.data))
  );
});

export const mockPieChart = jest.fn((props: any) => {
  const { View, Text } = require('react-native');
  return React.createElement(
    View,
    { testID: 'pie-chart-mock' },
    React.createElement(Text, null, 'PieChart'),
    props.data && React.createElement(Text, { testID: 'chart-data' }, JSON.stringify(props.data))
  );
});

jest.mock('react-native-gifted-charts', () => ({
  LineChart: mockLineChart,
  BarChart: mockBarChart,
  PieChart: mockPieChart,
}));

// React Native Pager View Mock
export const mockPagerView = jest.fn(({ children, onPageSelected, initialPage = 0 }: any) => {
  const React = require('react');
  const { View, ScrollView } = require('react-native');
  
  const [currentPage, setCurrentPage] = React.useState(initialPage);
  
  React.useImperativeHandle(
    React.useRef(null),
    () => ({
      setPage: (page: number) => {
        setCurrentPage(page);
        onPageSelected?.({ nativeEvent: { position: page } });
      },
      setPageWithoutAnimation: (page: number) => {
        setCurrentPage(page);
        onPageSelected?.({ nativeEvent: { position: page } });
      },
    }),
    [onPageSelected]
  );
  
  return React.createElement(
    ScrollView,
    {
      testID: 'pager-view-mock',
      horizontal: true,
      pagingEnabled: true,
    },
    React.Children.map(children, (child: any, index: number) =>
      React.createElement(
        View,
        { key: index, testID: `page-${index}` },
        index === currentPage && child
      )
    )
  );
});

jest.mock('react-native-pager-view', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef(mockPagerView),
  };
});

// React Native Picker Select Mock
export const mockPickerSelect = jest.fn(({ onValueChange, value, items, placeholder }: any) => {
  const { View, TouchableOpacity, Text } = require('react-native');
  return React.createElement(
    View,
    { testID: 'picker-select-mock' },
    React.createElement(
      TouchableOpacity,
      {
        testID: 'picker-button',
        onPress: () => {
          // Simulate selecting first item if none selected
          if (!value && items?.length > 0) {
            onValueChange?.(items[0].value);
          }
        }
      },
      React.createElement(
        Text,
        { testID: 'picker-value' },
        value ? items?.find((item: any) => item.value === value)?.label : placeholder?.label || 'Select...'
      )
    ),
    items?.map((item: any) =>
      React.createElement(
        TouchableOpacity,
        {
          key: item.value,
          testID: `picker-item-${item.value}`,
          onPress: () => onValueChange?.(item.value)
        },
        React.createElement(Text, null, item.label)
      )
    )
  );
});

jest.mock('react-native-picker-select', () => mockPickerSelect);

// React Native Gesture Handler Mock
export const mockGestureHandler = {
  State: {
    UNDETERMINED: 0,
    FAILED: 1,
    BEGAN: 2,
    CANCELLED: 3,
    ACTIVE: 4,
    END: 5,
  },
  PanGestureHandler: jest.fn(({ children }: any) => children),
  TapGestureHandler: jest.fn(({ children }: any) => children),
  LongPressGestureHandler: jest.fn(({ children }: any) => children),
  ScrollView: jest.fn(({ children }: any) => {
    const { ScrollView } = require('react-native');
    return React.createElement(ScrollView, null, children);
  }),
  FlatList: jest.fn((props: any) => {
    const { FlatList } = require('react-native');
    return React.createElement(FlatList, props);
  }),
};

jest.mock('react-native-gesture-handler', () => mockGestureHandler);

// React Native Reanimated Mock (basic mock, already in setup but enhanced here)
export const mockAnimatedValue = jest.fn(() => ({ value: 0 }));
export const mockUseSharedValue = jest.fn((initialValue) => ({ value: initialValue }));
export const mockUseAnimatedStyle = jest.fn((styleFactory) => styleFactory());
export const mockWithSpring = jest.fn((value) => value);
export const mockWithTiming = jest.fn((value) => value);

jest.mock('react-native-reanimated', () => ({
  default: {
    createAnimatedComponent: (component: any) => component,
    Value: mockAnimatedValue,
    event: jest.fn(),
    add: jest.fn(),
    eq: jest.fn(),
    set: jest.fn(),
    cond: jest.fn(),
    interpolate: jest.fn(),
    multiply: jest.fn(),
  },
  useSharedValue: mockUseSharedValue,
  useAnimatedStyle: mockUseAnimatedStyle,
  withSpring: mockWithSpring,
  withTiming: mockWithTiming,
  Easing: {
    linear: jest.fn(),
    ease: jest.fn(),
    bezier: jest.fn(),
  },
}));

// React Native Render HTML Mock
export const mockRenderHTML = jest.fn(({ source }: any) => {
  const { View, Text } = require('react-native');
  return React.createElement(
    View,
    { testID: 'render-html-mock' },
    React.createElement(Text, null, source?.html || '')
  );
});

jest.mock('react-native-render-html', () => ({
  __esModule: true,
  default: mockRenderHTML,
}));

// Utility function to reset all React Native component mocks
export const resetReactNativeComponentMocks = () => {
  // Reset calendar
  mockCalendar.mockClear();
  
  // Reset charts
  mockLineChart.mockClear();
  mockBarChart.mockClear();
  mockPieChart.mockClear();
  
  // Reset pager view
  mockPagerView.mockClear();
  
  // Reset picker
  mockPickerSelect.mockClear();
  
  // Reset gesture handler
  Object.values(mockGestureHandler).forEach(mock => {
    if (typeof mock === 'function' && mock.mockClear) {
      mock.mockClear();
    }
  });
  
  // Reset reanimated
  mockAnimatedValue.mockClear();
  mockUseSharedValue.mockClear();
  mockUseAnimatedStyle.mockClear();
  mockWithSpring.mockClear();
  mockWithTiming.mockClear();
  
  // Reset render HTML
  mockRenderHTML.mockClear();
};