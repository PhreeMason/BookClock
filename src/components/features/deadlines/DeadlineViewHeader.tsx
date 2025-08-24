import { ThemedText } from '@/components/themed';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/theme';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

interface DeadlineViewHeaderProps {
    title?: string;
    onBack: () => void;
    onEdit: () => void;
}

const DeadlineViewHeader: React.FC<DeadlineViewHeaderProps> = ({
    title = "Book Details",
    onBack,
    onEdit,
}) => {
    const { theme } = useTheme();
    const borderColor = theme.border;
    const iconColor = theme.primary;
    return (
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <TouchableOpacity onPress={onBack}>
                <IconSymbol name="chevron.left" size={Platform.OS === 'ios' ? 24 : 40} color={iconColor} />
            </TouchableOpacity>
            <ThemedText type="semiBold" style={styles.headerTitle}>
                {title}
            </ThemedText>
            <TouchableOpacity onPress={onEdit}>
                <ThemedText type="link" style={styles.headerTitle}>
                    Edit
                </ThemedText>
            </TouchableOpacity>
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
        justifyContent: 'space-between',
    },
    headerSpacer: {
        width: 40,
    },
    headerTitle: {
        fontSize: 18,
        flex: 1,
        textAlign: 'center',
    },
});

export default DeadlineViewHeader;
