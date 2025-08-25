import React from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import type { KeyboardAwareScrollViewProps } from 'react-native-keyboard-aware-scroll-view';
import { useTheme } from '@/theme';

export type ThemedKeyboardAwareScrollViewProps = KeyboardAwareScrollViewProps & {
  backgroundColor?: string;
};

export function ThemedKeyboardAwareScrollView({
  style,
  backgroundColor = 'background',
  ...otherProps
}: ThemedKeyboardAwareScrollViewProps) {
  const { theme } = useTheme();

  const getColor = (colorValue: string): string => {
    // Check if it's a theme color
    if (colorValue in theme) {
      return theme[colorValue as keyof typeof theme] as string;
    }
    return colorValue;
  };

  return (
    <KeyboardAwareScrollView
      style={[
        {
          backgroundColor: getColor(backgroundColor),
        },
        style,
      ]}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      keyboardOpeningTime={0}
      {...otherProps}
    />
  );
}