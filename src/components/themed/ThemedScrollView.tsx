import React from 'react';
import { ScrollView, type ScrollViewProps } from 'react-native';
import { useTheme } from '@/theme';

export type ThemedScrollViewProps = ScrollViewProps & {
  backgroundColor?: string;
};

export function ThemedScrollView({
  style,
  backgroundColor = 'background',
  ...otherProps
}: ThemedScrollViewProps) {
  const { theme } = useTheme();

  const getColor = (colorValue: string): string => {
    // Check if it's a theme color
    if (colorValue in theme) {
      return theme[colorValue as keyof typeof theme] as string;
    }
    return colorValue;
  };

  return (
    <ScrollView
      style={[
        {
          backgroundColor: getColor(backgroundColor),
        },
        style,
      ]}
      {...otherProps}
    />
  );
}