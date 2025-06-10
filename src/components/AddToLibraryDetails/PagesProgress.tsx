import React from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet, Text, TextInput, View } from 'react-native';


type PagesProgressProps = {
    control: any;
    errors: any;
    setValue: any;
}

const PagesProgress: React.FC<PagesProgressProps> = ({
    control,
    errors,
}) => {
    return (
        <View>
            <Text style={styles.title}>Current Progress</Text>
            <View style={styles.progressContainer}>
                <Controller
                    control={control}
                    name="currentPage"
                    render={({ field: { value, onChange } }) => (
                        <TextInput
                            style={styles.pageInput}
                            value={value?.toString()}
                            onChangeText={onChange}
                            keyboardType="numeric"
                        />
                    )}
                />
                <Text style={styles.ofText}>of</Text>

                <Controller
                    control={control}
                    name="totalPage"
                    render={({ field: { value, onChange } }) => (
                        <TextInput
                            style={styles.pageInput}
                            value={value?.toString()}
                            onChangeText={onChange}
                            keyboardType="numeric"
                        />
                    )}
                />

                <Text style={styles.pagesText}> pages</Text>
            </View>
            {errors.currentPage && <Text style={styles.errorText}>{errors.currentPage.message}</Text>}
            {errors.totalPage && <Text style={styles.errorText}>{errors.totalPage.message}</Text>}
        </View>
    )
}

const styles = StyleSheet.create({
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pageInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 8,
        width: 80,
        textAlign: 'center',
    },
    ofText: {
        marginHorizontal: 8,
        fontSize: 14,
        color: '#6B7280',
    },
    pagesText: {
        fontSize: 14,
        fontWeight: '600',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 4,
    },
});

export default PagesProgress