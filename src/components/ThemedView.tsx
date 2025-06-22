import { View, type ViewProps } from 'react-native';

import { useThemeColor, type ColorValue } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  backgroundColor?: ColorValue;
  borderColor?: ColorValue;
  colorName?: ColorValue;
};

export function ThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  backgroundColor = 'background',
  borderColor,
  colorName,
  ...otherProps 
}: ThemedViewProps) {
  const bgColorName = backgroundColor || colorName || 'background';
  const bgColor = useThemeColor({ light: lightColor, dark: darkColor }, bgColorName);
  const brdColor = borderColor ? useThemeColor({}, borderColor) : undefined;

  return (
    <View 
      style={[
        { backgroundColor: bgColor },
        brdColor && { borderColor: brdColor },
        style
      ]} 
      {...otherProps} 
    />
  );
}
