import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor, type ColorValue } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  type?: 
    | 'default' 
    | 'title' 
    | 'subtitle' 
    | 'link'
    | 'body'
    | 'bodyMuted'
    | 'caption'
    | 'captionMuted'
    | 'label'
    | 'labelMuted'
    | 'button'
    | 'small'
    | 'smallMuted'
    | 'semiBold'
    | 'error'
    | 'success';
  color?: ColorValue;
};

// Default color mapping for types
const typeColors: Record<string, ColorValue> = {
  bodyMuted: 'textMuted',
  captionMuted: 'textMuted',
  labelMuted: 'textMuted',
  smallMuted: 'textMuted',
  error: 'error',
  success: 'success',
};

export function ThemedText({
  style,
  type = 'default',
  color,
  ...rest
}: ThemedTextProps) {
  const textColorName = color || typeColors[type] || 'text';
  const textColor = useThemeColor({}, textColorName);

  // Types that use default styling (fontSize: 16)
  const usesDefaultStyle = ['link', 'body', 'bodyMuted', 'error', 'success'].includes(type);
  // Types that use caption styling (fontSize: 14)
  const usesCaptionStyle = ['caption', 'captionMuted'].includes(type);
  // Types that use small styling (fontSize: 12)
  const usesSmallStyle = ['small', 'smallMuted'].includes(type);
  
  let styleToApply;
  if (usesDefaultStyle) {
    styleToApply = styles.default;
  } else if (usesCaptionStyle) {
    styleToApply = styles.caption;
  } else if (usesSmallStyle) {
    styleToApply = styles.small;
  } else {
    styleToApply = styles[type as keyof typeof styles] || styles.default;
  }

  return (
    <Text
      style={[
        { fontFamily: 'Inter' },
        { color: textColor },
        styleToApply,
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
  semiBold: {
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
  // link, body, bodyMuted, error, and success use default styles (fontSize: 16)
  caption: {
    fontSize: 14,
  },
  // captionMuted uses caption styles (fontSize: 14)
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
  // smallMuted uses small styles (fontSize: 12)
});