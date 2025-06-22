import { KeyboardAvoidingView, Platform, type KeyboardAvoidingViewProps } from 'react-native';

import { useThemeColor, type ColorValue } from '@/hooks/useThemeColor';

export type ThemedKeyboardAvoidingViewProps = KeyboardAvoidingViewProps & {
  lightColor?: string;
  darkColor?: string;
  backgroundColor?: ColorValue;
};

export function ThemedKeyboardAvoidingView({ 
  style, 
  lightColor, 
  darkColor, 
  backgroundColor = 'background',
  behavior = Platform.OS === 'ios' ? 'padding' : 'height',
  ...otherProps 
}: ThemedKeyboardAvoidingViewProps) {
  const bgColor = useThemeColor({ light: lightColor, dark: darkColor }, backgroundColor);

  return (
    <KeyboardAvoidingView 
      style={[{ backgroundColor: bgColor }, style]} 
      behavior={behavior}
      {...otherProps} 
    />
  );
}