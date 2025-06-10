import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

type AddToLibraryButtonProps = {
    onPress: () => void;
};

const AddToLibraryButton: React.FC<AddToLibraryButtonProps> = ({ onPress }) => {
    return (
        <TouchableOpacity
            style={styles.button}
            onPress={onPress}
        >
            <Text style={styles.buttonText}>Add to Library</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#374151',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginTop: 24,
    },
    buttonText: {
        color: '#ffffff',
        textAlign: 'center',
        fontWeight: '600',
    },
});

export default AddToLibraryButton;

