import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedButton } from '../themed';

interface QuickActionButtonsProps {
    unitsPerDay: number;
    onQuickUpdate: (increment: number) => void;
}

const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({
    unitsPerDay,
    onQuickUpdate
}) => {

    // const { theme } = useTheme();
    // const backgroundColor = theme.accent;

    return (
        <View style={styles.quickButtons}>
            <ThemedButton
                title={`+${unitsPerDay}`}
                variant="accent"
                style={styles.quickBtn}
                onPress={() => onQuickUpdate(unitsPerDay)}
            />
            <ThemedButton
                title={`+${unitsPerDay * 2}`}
                variant="accent"
                style={styles.quickBtn}
                onPress={() => onQuickUpdate(unitsPerDay * 2)}
            />
            <ThemedButton
                title={`+${unitsPerDay * 3}`}
                variant="accent"
                style={styles.quickBtn}
                onPress={() => onQuickUpdate(unitsPerDay * 3)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    quickButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 8,
    },
    quickBtn: {
        flex: 1,
    },
});

export default QuickActionButtons;
