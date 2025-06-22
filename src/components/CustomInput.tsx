import { useThemeColor } from '@/hooks/useThemeColor';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import {
    StyleSheet,
    TextInput,
    TextInputProps,
    View,
} from 'react-native';
import { ThemedText } from './ThemedText';

type CustomInputProps<T extends FieldValues> = {
    control: Control<T>; // custom fields
    name: Path<T>;
} & TextInputProps;

export default function CustomInput<T extends FieldValues>({
    control,
    name,
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
