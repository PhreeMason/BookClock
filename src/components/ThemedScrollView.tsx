import { ScrollView, type ScrollViewProps } from 'react-native';

import { useThemeColor, type ColorValue } from '@/hooks/useThemeColor';

export type ThemedScrollViewProps = ScrollViewProps & {
    backgroundColor?: ColorValue;
};

export function ThemedScrollView({
    style,
    backgroundColor = 'background',
    ...otherProps
}: ThemedScrollViewProps) {
    const bgColor = useThemeColor({}, backgroundColor);

    return <ScrollView 
        style={[{ backgroundColor: bgColor }, style]} 
        keyboardShouldPersistTaps='handled'
        {...({...otherProps })} 
    />;
}