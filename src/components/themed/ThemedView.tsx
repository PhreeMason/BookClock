import { useTheme } from '@/theme';
import React from 'react';
import { View, type ViewProps } from 'react-native';

export type ThemedViewProps = ViewProps & {
    backgroundColor?: string;
    borderColor?: string;
};

export function ThemedView({
    style,
    backgroundColor = 'background',
    borderColor,
    ...otherProps
}: ThemedViewProps) {
    const { theme } = useTheme();

    const getColor = (colorValue: string): string => {
        // Check if it's a theme color
        if (colorValue in theme) {
            return theme[colorValue as keyof typeof theme] as string;
        }
        return colorValue;
    };

    return (
        <View
            style={[
                {
                    backgroundColor: getColor(backgroundColor),
                    ...(borderColor && { borderColor: getColor(borderColor) }),
                },
                style,
            ]}
            {...otherProps}
        />
    );
}