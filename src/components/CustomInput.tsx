import { useThemeColor } from '@/hooks/useThemeColor';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View,
} from 'react-native';

type CustomInputProps<T extends FieldValues> = {
    control: Control<T>; // custom fields
    name: Path<T>;
} & TextInputProps;

export default function CustomInput<T extends FieldValues>({
    control,
    name,
    ...props
}: CustomInputProps<T>) {
    const backgroundColor = useThemeColor({}, 'card');
    const color = useThemeColor({}, 'text');
    const borderColor = useThemeColor({}, 'border');
    const errorColor = useThemeColor({}, 'danger'); // Assuming 'danger' is in your color palette
    const placeholderTextColor = useThemeColor({}, 'textMuted');

    return (
        <Controller
            control={control}
            name={name}
            render={({
                field: { value, onChange, onBlur },
                fieldState: { error },
            }: {
                field: {
                    value: string;
                    onChange: (value: string) => void;
                    onBlur: () => void;
                };
                fieldState: {
                    error?: { message?: string };
                };
            }) => (
                <View style={styles.container}>
                    <TextInput
                        {...props}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholderTextColor={placeholderTextColor}
                        style={[
                            styles.input,
                            { 
                                backgroundColor, 
                                color, 
                                borderColor: error ? errorColor : borderColor 
                            },
                            props.style,
                        ]}
                    />
                    {error ? (
                        <Text style={[styles.error, { color: errorColor }]}>{error.message}</Text>
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
