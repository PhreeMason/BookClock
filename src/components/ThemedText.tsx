import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor, type ColorValue } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  colorName?: ColorValue;
  color?: ColorValue;
  backgroundColor?: ColorValue;
  borderColor?: ColorValue;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  colorName = 'text',
  color,
  backgroundColor,
  borderColor,
  ...rest
}: ThemedTextProps) {
  const textColorName = color || colorName;
  const textColor = useThemeColor({ light: lightColor, dark: darkColor }, textColorName);
  
  const bgColor = backgroundColor ? useThemeColor({}, backgroundColor) : undefined;
  const brdColor = borderColor ? useThemeColor({}, borderColor) : undefined;

  return (
    <Text
      style={[
        { fontFamily: 'Inter' },
        { color: textColor },
        bgColor && { backgroundColor: bgColor },
        brdColor && { borderColor: brdColor },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
  },
  defaultSemiBold: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    fontSize: 16,
  },
});
