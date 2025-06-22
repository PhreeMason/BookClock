import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { Pressable, PressableProps, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';

interface ThemedButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function ThemedButton({
  title,
  variant = 'primary',
  style,
  textStyle,
  ...props
}: ThemedButtonProps) {
  const backgroundColor = useThemeColor(
    {},
    variant === 'primary'
      ? 'primary'
      : variant === 'secondary'
      ? 'card'
      : 'background'
  );
  const color = useThemeColor(
    {},
    variant === 'primary' ? 'primaryForeground' : 'text'
  );
  const borderColor = useThemeColor({}, 'border');

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          borderColor,
          borderWidth: variant === 'secondary' ? 1 : 0,
        },
        pressed && styles.pressed,
        props.disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <Text style={[styles.text, { color }, textStyle]}>{title}</Text>
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