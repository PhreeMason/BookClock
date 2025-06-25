import { useThemeColor, type ColorValue } from '@/hooks/useThemeColor';
import React from 'react';
import { Pressable, PressableProps, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';

interface ThemedButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  style?: ViewStyle;
  textStyle?: TextStyle;
  // Color props for custom theming
  backgroundColor?: ColorValue;
  textColor?: ColorValue;
  borderColor?: ColorValue;
}

// Default color mapping for variants
const variantColors: Record<string, { bg: ColorValue; text: ColorValue; border?: ColorValue }> = {
  primary: { bg: 'primary', text: 'primaryForeground' },
  secondary: { bg: 'card', text: 'text', border: 'border' },
  danger: { bg: 'transparent', text: 'destructive', border: 'destructive' },
  ghost: { bg: 'transparent', text: 'text' },
  success: { bg: 'success', text: 'successForeground' },
};

export function ThemedButton({
  title,
  variant = 'primary',
  style,
  textStyle,
  backgroundColor,
  textColor,
  borderColor,
  ...props
}: ThemedButtonProps) {
  // Get variant colors or fallback to primary
  const variantConfig = variantColors[variant] || variantColors.primary;
  
  // Use provided colors or fall back to variant-based colors
  const bgColor = useThemeColor({}, backgroundColor || variantConfig.bg);
  const txtColor = useThemeColor({}, textColor || variantConfig.text);
  const brdColor = useThemeColor({}, borderColor || variantConfig.border || 'border');

  // Determine if button should have border
  const shouldShowBorder = variant === 'secondary' || variant === 'ghost' || variant === 'danger' || borderColor;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bgColor,
          borderColor: brdColor,
          borderWidth: shouldShowBorder ? 1 : 0,
        },
        pressed && styles.pressed,
        props.disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <Text style={[styles.text, { color: txtColor }, textStyle]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    height: 60,
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
}); 