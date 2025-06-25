import { View, type ViewProps } from 'react-native';

import { useThemeColor, type ColorValue } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  backgroundColor?: ColorValue;
  borderColor?: ColorValue;
};

export function ThemedView({ 
  style, 
  backgroundColor = 'background',
  borderColor,
  ...otherProps 
}: ThemedViewProps) {
  const bgColor = useThemeColor({}, backgroundColor);
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
