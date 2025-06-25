import { KeyboardAvoidingView, Platform, type KeyboardAvoidingViewProps } from 'react-native';

import { useThemeColor, type ColorValue } from '@/hooks/useThemeColor';

export type ThemedKeyboardAvoidingViewProps = KeyboardAvoidingViewProps & {
  backgroundColor?: ColorValue;
};

export function ThemedKeyboardAvoidingView({ 
  style, 
  backgroundColor = 'background',
  behavior = Platform.OS === 'ios' ? 'padding' : 'height',
  ...otherProps 
}: ThemedKeyboardAvoidingViewProps) {
  const bgColor = useThemeColor({}, backgroundColor);

  return (
    <KeyboardAvoidingView 
      style={[{ backgroundColor: bgColor }, style]} 
      behavior={behavior}
      {...otherProps} 
    />
  );
}