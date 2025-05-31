import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export type LoaderProps = {
    size?: 'small' | 'large';
    text?: string;
    fullScreen?: boolean;
    lightColor?: string;
    darkColor?: string;
};

export function Loader({
    size = 'large',
    text,
    fullScreen = false,
    lightColor,
    darkColor
}: LoaderProps) {
    const indicatorColor = useThemeColor({ light: lightColor, dark: darkColor }, 'tint');

    return (
        <ThemedView style={[styles.container, fullScreen && styles.fullScreen]}>
            <ActivityIndicator size={size} color={indicatorColor} />
            {text && (
                <ThemedText style={styles.text} type="defaultSemiBold">
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