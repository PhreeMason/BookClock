import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

type NoteInputProps = {
    note: string;
    setNote: (text: string) => void;
}

const NoteInput: React.FC<NoteInputProps> = ({ note, setNote }) => {
    return (
        <View>
            <Text style={styles.label}>Note</Text>
            <TextInput
                style={styles.textInput}
                placeholder="Add a note about this book..."
                multiline
                value={note}
                onChangeText={setNote}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        height: 96,
        textAlignVertical: 'top',
    },
});

export default NoteInput;