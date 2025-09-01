import { useTheme } from '@/theme';
import React from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';

export type ThemedTextProps = TextProps & {
  color?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'body' | 'caption' | 'label' | 'button' | 'semiBold' | 'error' | 'success' | 'warning';
};

export function ThemedText({
  style,
  color,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const { theme } = useTheme();

  const getTextColor = () => {
    if (color) {
      // Check if it's a theme color
      if (color in theme) {
        return theme[color as keyof typeof theme] as string;
      }
      return color;
    }

    // Default colors based on type
    switch (type) {
      case 'error':
        return theme.danger;
      case 'success':
        return theme.success;
      case 'warning':
        return theme.warning;
      case 'link':
        return theme.primary;
      case 'caption':
      case 'label':
        return theme.textMuted;
      default:
        return theme.text;
    }
  };

  return (
    <Text
      style={[
        { fontFamily: 'Nunito-Medium' },
        { color: getTextColor() },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'body' ? styles.body : undefined,
        type === 'caption' ? styles.caption : undefined,
        type === 'label' ? styles.label : undefined,
        type === 'button' ? styles.button : undefined,
        type === 'semiBold' ? styles.semiBold : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    fontSize: 16,
    lineHeight: 30,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  semiBold: {
    fontWeight: '600',
  },
});