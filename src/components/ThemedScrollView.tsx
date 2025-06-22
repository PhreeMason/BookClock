import { ScrollView, type ScrollViewProps } from 'react-native';

import { useThemeColor, type ColorValue } from '@/hooks/useThemeColor';

export type ThemedScrollViewProps = ScrollViewProps & {
    lightColor?: string;
    darkColor?: string;
    backgroundColor?: ColorValue;
};

export function ThemedScrollView({
    style,
    lightColor,
    darkColor,
    backgroundColor = 'background',
    ...otherProps
}: ThemedScrollViewProps) {
    const bgColor = useThemeColor({ light: lightColor, dark: darkColor }, backgroundColor);

    return <ScrollView 
        style={[{ backgroundColor: bgColor }, style]} 
        keyboardShouldPersistTaps='handled'
        {...({...otherProps })} 
    />;
}