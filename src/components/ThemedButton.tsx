import { useThemeColor, type ColorValue } from '@/hooks/useThemeColor';
import React from 'react';
import { Pressable, PressableProps, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';

interface ThemedButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  style?: ViewStyle;
  textStyle?: TextStyle;
  // New color props for easier theming
  backgroundColor?: ColorValue;
  textColor?: ColorValue;
  borderColor?: ColorValue;
}

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
  // Use provided colors or fall back to variant-based colors
  const bgColor = backgroundColor 
    ? useThemeColor({}, backgroundColor)
    : useThemeColor(
        {},
        variant === 'primary'
          ? 'primary'
          : variant === 'secondary'
          ? 'card'
          : 'background'
      );
  
  const txtColor = textColor
    ? useThemeColor({}, textColor)
    : useThemeColor(
        {},
        variant === 'primary' ? 'primaryForeground' : 'text'
      );
  
  const brdColor = borderColor 
    ? useThemeColor({}, borderColor)
    : useThemeColor({}, 'border');

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bgColor,
          borderColor: brdColor,
          borderWidth: variant === 'secondary' ? 1 : 0,
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