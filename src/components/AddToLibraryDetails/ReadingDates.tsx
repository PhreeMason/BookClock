import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import { Controller } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";

type ReadingDatesProps = {
    control: any;
    errors: any;
    setValue: any;
    formatDate: (date: Date) => string;
};

const ReadingDates: React.FC<ReadingDatesProps> = ({
    control,
    errors,
    setValue,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.column}>
                <View style={styles.dateInputContainer}>
                    <Text style={styles.label}>Start Date</Text>
                    <Controller
                        control={control}
                        name="startDate"
                        render={({ field: { value } }) => (
                            <DateTimePicker
                                value={value}
                                mode="date"
                                display="default"
                                maximumDate={new Date()}
                                onChange={(event: any, date: any) => {
                                    if (date) {
                                        setValue("startDate", date);
                                    }
                                }}
                            />
                        )}
                    />
                    {errors.startDate && (
                        <Text style={styles.errorText}>{errors.startDate.message}</Text>
                    )}
                </View>

                <View style={styles.dateInputContainer}>
                    <Text style={styles.label}>Target Completion Date</Text>
                    <Controller
                        control={control}
                        name="targetDate"
                        render={({ field: { value } }) => (
                            <DateTimePicker
                                value={value}
                                mode="date"
                                display="default"
                                onChange={(event: any, date: any) => {
                                    if (date) {
                                        setValue("targetDate", date);
                                    }
                                }}
                            />
                        )}
                    />
                    {errors.targetDate && (
                        <Text style={styles.errorText}>{errors.targetDate.message}</Text>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 16,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        paddingTop: 16,
    },
    column: {
        flexDirection: "column",
        gap: 8,
    },
    dateInputContainer: {
       flexDirection: 'row'
    },
    label: {
        paddingTop: 12,
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 4,
    },
    dateInput: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        padding: 12,
    },
    errorText: {
        color: "#EF4444",
        fontSize: 12,
        marginTop: 4,
    },
});

export default ReadingDates;
