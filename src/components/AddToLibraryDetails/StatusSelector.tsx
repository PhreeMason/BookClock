import { StatusEnum } from '@/types/book';
import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const StatusSelector = ({ status, setStatus }: {
    status: StatusEnum;
    setStatus: (status: StatusEnum) => void;
}) => {
    return (
        <View>
            <Text style={styles.label}>Status *</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={status}
                    onValueChange={(itemValue) => setStatus(itemValue)}
                    mode="dropdown"
                >
                    <Picker.Item label="To Be Read" value="tbr" />
                    <Picker.Item label="Currently Reading" value="current" />
                    <Picker.Item label="Completed" value="completed" />
                    <Picker.Item label="Did Not Finish" value="dnf" />
                </Picker>
            </View>
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
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
    },
});

export default StatusSelector;