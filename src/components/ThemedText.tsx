import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor, type ColorValue } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  type?: 
    | 'default' 
    | 'title' 
    | 'defaultSemiBold' 
    | 'subtitle' 
    | 'link'
    | 'header'
    | 'body'
    | 'bodyMuted'
    | 'caption'
    | 'captionMuted'
    | 'label'
    | 'labelMuted'
    | 'button'
    | 'small'
    | 'smallMuted';
  color?: ColorValue;
};

// Default color mapping for types
const typeColors: Record<string, ColorValue> = {
  bodyMuted: 'textMuted',
  captionMuted: 'textMuted',
  labelMuted: 'textMuted',
  smallMuted: 'textMuted',
};

export function ThemedText({
  style,
  type = 'default',
  color,
  ...rest
}: ThemedTextProps) {
  const textColorName = color || typeColors[type] || 'text';
  const textColor = useThemeColor({}, textColorName);

  return (
    <Text
      style={[
        { fontFamily: 'Inter' },
        { color: textColor },
        styles[type] || styles.default,
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
  header: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    fontSize: 16,
  },
  body: {
    fontSize: 16,
  },
  bodyMuted: {
    fontSize: 16,
  },
  caption: {
    fontSize: 14,
  },
  captionMuted: {
    fontSize: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelMuted: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
  },
  small: {
    fontSize: 12,
  },
  smallMuted: {
    fontSize: 12,
  },
});