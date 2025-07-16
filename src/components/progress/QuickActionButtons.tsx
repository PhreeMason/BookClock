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
                title={`-${1}`}
                variant="accent"
                style={styles.quickBtn}
                onPress={() => onQuickUpdate(-1)}
            />
            <ThemedButton
                title={`+${5}`}
                variant="accent"
                style={styles.quickBtn}
                onPress={() => onQuickUpdate(5)}
            />
            <ThemedButton
                title={`+${5 * 2}`}
                variant="accent"
                style={styles.quickBtn}
                onPress={() => onQuickUpdate(5 * 2)}
            />
            <ThemedButton
                title={`+${unitsPerDay}`}
                variant="accent"
                style={styles.quickBtn}
                onPress={() => onQuickUpdate(unitsPerDay)}
            />
            <ThemedButton
                title={`+1`}
                variant="accent"
                style={styles.quickBtn}
                onPress={() => onQuickUpdate(1)}
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
