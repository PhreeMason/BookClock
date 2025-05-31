import { KeyboardAvoidingView, Platform, type KeyboardAvoidingViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedKeyboardAvoidingViewProps = KeyboardAvoidingViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedKeyboardAvoidingView({ 
  style, 
  lightColor, 
  darkColor, 
  behavior = Platform.OS === 'ios' ? 'padding' : 'height',
  ...otherProps 
}: ThemedKeyboardAvoidingViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <KeyboardAvoidingView 
      style={[{ backgroundColor }, style]} 
      behavior={behavior}
      {...otherProps} 
    />
  );
}