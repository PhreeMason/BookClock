import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedText, ThemedView } from '@/components/themed';
import { useTheme } from '@/theme';

type ColorValue = string;

export type LoaderProps = {
    size?: 'small' | 'large';
    text?: string;
    fullScreen?: boolean;
    indicatorColor?: ColorValue;
};

export function Loader({
    size = 'large',
    text,
    fullScreen = false,
    indicatorColor = 'primary'
}: LoaderProps) {
    const { theme } = useTheme();
    const color = indicatorColor in theme ? theme[indicatorColor as keyof typeof theme] as string : indicatorColor;

    return (
        <ThemedView backgroundColor="background" style={[styles.container, fullScreen && styles.fullScreen]}>
            <ActivityIndicator size={size} color={color} />
            {text && (
                <ThemedText style={styles.text} type="semiBold">
                    {text}
                </ThemedText>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    fullScreen: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    text: {
        marginTop: 16,
        textAlign: 'center',
    },
});