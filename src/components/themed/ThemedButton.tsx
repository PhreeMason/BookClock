import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import { ThemedText } from './ThemedText';

export type ThemedButtonProps = TouchableOpacityProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'dangerOutline' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  textColor?: string;
};

export function ThemedButton({
  title,
  variant = 'primary',
  size = 'md',
  style,
  textColor,
  ...rest
}: ThemedButtonProps) {
  const { theme } = useTheme();

  const getButtonStyle = () => {
    const baseStyle = {
      backgroundColor: 'transparent',
      borderWidth: 0,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: theme.primary,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: theme.secondary,
        };
      case 'accent':
        return {
          ...baseStyle,
          backgroundColor: theme.accent,
        };
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: theme.danger,
        };
      case 'dangerOutline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.danger,
        };
      case 'success':
        return {
          ...baseStyle,
          backgroundColor: theme.success,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.border,
        };
      default:
        return baseStyle;
    }
  };

  const getTextColor = () => {
    if (textColor) {
      if (textColor in theme) {
        return theme[textColor as keyof typeof theme] as string;
      }
      return textColor;
    }

    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'accent':
      case 'danger':
      case 'success':
        return '#ffffff';
      case 'dangerOutline':
        return theme.danger;
      case 'ghost':
        return theme.text;
      default:
        return theme.text;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.sm;
      case 'lg':
        return styles.lg;
      default:
        return styles.md;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        getButtonStyle(),
        getSizeStyle(),
        style,
      ]}
      {...rest}
    >
      <ThemedText
        type="button"
        style={{ color: getTextColor() }}
      >
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  md: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  lg: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});