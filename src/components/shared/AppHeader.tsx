import { ThemedText } from '@/components/themed';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/theme';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

interface AppHeaderProps {
    title: string;
    onBack: () => void;
    rightElement?: React.ReactNode;
    showBackButton?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({
    title,
    onBack,
    rightElement,
    showBackButton = true,
}) => {
    const { theme } = useTheme();
    const borderColor = theme.border;
    const iconColor = theme.primary;

    return (
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
            {showBackButton ? (
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <IconSymbol name="chevron.left" size={Platform.OS === 'ios' ? 24 : 40} color={iconColor} />
                </TouchableOpacity>
            ) : (
                <View style={styles.backButton} />
            )}
            
            <ThemedText type="semiBold" style={styles.headerTitle}>
                {title}
            </ThemedText>
            
            {rightElement || <View style={styles.headerSpacer} />}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
    },
    backButton: {
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 18,
        flex: 1,
        textAlign: 'center',
    },
    headerSpacer: {
        width: 40,
    },
});

export default AppHeader;