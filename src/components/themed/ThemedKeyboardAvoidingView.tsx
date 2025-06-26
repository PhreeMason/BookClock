import React from 'react';
import { KeyboardAvoidingView, type KeyboardAvoidingViewProps, Platform } from 'react-native';
import { useTheme } from '@/theme';

export type ThemedKeyboardAvoidingViewProps = KeyboardAvoidingViewProps & {
  backgroundColor?: string;
};

export function ThemedKeyboardAvoidingView({
  style,
  backgroundColor = 'background',
  behavior = Platform.OS === 'ios' ? 'padding' : 'height',
  ...otherProps
}: ThemedKeyboardAvoidingViewProps) {
  const { theme } = useTheme();

  const getColor = (colorValue: string): string => {
    // Check if it's a theme color
    if (colorValue in theme) {
      return theme[colorValue as keyof typeof theme] as string;
    }
    return colorValue;
  };

  return (
    <KeyboardAvoidingView
      behavior={behavior}
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