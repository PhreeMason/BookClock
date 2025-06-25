import { useThemeColor } from '@/hooks/useThemeColor';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import {
    StyleSheet,
    TextInput,
    TextInputProps,
    View
} from 'react-native';
import { ThemedText } from './ThemedText';

type CustomInputProps<T extends FieldValues> = {
    control: Control<T>; // custom fields
    name: Path<T>;
    inputType?: 'string' | 'number' | 'integer'; // explicit type declaration
} & TextInputProps;

export default function CustomInput<T extends FieldValues>({
    control,
    name,
    inputType = 'string', // default to string
    ...props
}: CustomInputProps<T>) {
    const textMutedColor = useThemeColor({}, 'textMuted');
    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const borderColor = useThemeColor({}, 'border');
    const dangerColor = useThemeColor({}, 'danger');

    return (
        <Controller
            control={control}
            name={name}
            render={({
                field: { value, onChange, onBlur },
                fieldState: { error },
            }: {
                field: {
                    value: string | number;
                    onChange: (value: string | number) => void;
                    onBlur: () => void;
                };
                fieldState: {
                    error?: { message?: string };
                };
            }) => (
                <View style={styles.container}>
                    <TextInput
                        {...props}
                        value={typeof value === 'number' ? value.toString() : (value ?? '')}
                        onChangeText={(text) => {
                            if (inputType === 'number' || inputType === 'integer') {
                                // Handle empty string - return undefined to let form validation handle it
                                if (text.trim() === '') {
                                    onChange(undefined as any);
                                    return;
                                }

                                // For integer type, use parseInt and validate it's a whole number
                                if (inputType === 'integer') {
                                    const numValue = parseInt(text, 10);
                                    // Only accept if the parsed value matches the input (no decimals/extra chars)
                                    if (!isNaN(numValue) && numValue.toString() === text.trim()) {
                                        onChange(numValue);
                                    } else {
                                        // Invalid integer input - don't update form value
                                        return;
                                    }
                                } else {
                                    // For number type, use parseFloat but validate format
                                    const numValue = parseFloat(text);
                                    if (!isNaN(numValue) && text.trim() !== '') {
                                        // Additional validation: ensure it's a valid number format
                                        const isValidNumberFormat = /^-?\d*\.?\d*$/.test(text.trim());
                                        if (isValidNumberFormat) {
                                            onChange(numValue);
                                        } else {
                                            // Invalid number format - don't update form value
                                            return;
                                        }
                                    } else {
                                        // Invalid number input - don't update form value
                                        return;
                                    }
                                }
                            } else {
                                // String input - always update
                                onChange(text);
                            }
                        }}
                        onBlur={onBlur}
                        placeholderTextColor={textMutedColor}
                        style={[
                            styles.input,
                            { 
                                backgroundColor: cardColor,
                                color: textColor,
                                borderColor: error ? dangerColor : borderColor
                            },
                            props.style,
                        ]}
                    />
                    {error ? (
                        <ThemedText color="danger" style={styles.error}>{error.message}</ThemedText>
                    ) : (
                        <View style={{ height: 18 }} />
                    )}
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 4,
    },
    input: {
        borderWidth: 2,
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
    },
    error: {
        minHeight: 18,
    },
});
