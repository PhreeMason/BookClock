import CustomInput from '@/components/CustomInput';
import SignInWith from '@/components/SignInWith';
import { ThemedKeyboardAvoidingView } from '@/components/ThemedKeyboardAvoidingView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { isClerkAPIResponseError, useSignUp } from '@clerk/clerk-expo';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { z } from 'zod';

const signUpSchema = z.object({
    email: z.string({ message: 'Email is required' }).email('Invalid email'),
    password: z
        .string({ message: 'Password is required' })
        .min(8, 'Password should be at least 8 characters long'),
});

type SignUpFields = z.infer<typeof signUpSchema>;

const mapClerkErrorToFormField = (error: any) => {
    switch (error.meta?.paramName) {
        case 'email_address':
            return 'email';
        case 'password':
            return 'password';
        default:
            return 'root';
    }
};

export default function SignUpScreen() {
    const { isLoaded, signUp, setActive } = useSignUp();
    const router = useRouter();

    const [pendingVerification, setPendingVerification] = React.useState(false);
    const [code, setCode] = React.useState('');

    const {
        control,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<SignUpFields>({
        resolver: zodResolver(signUpSchema),
    });

    // Handle submission of sign-up form
    const onSignUpPress = async (data: SignUpFields) => {
        if (!isLoaded) return;

        try {
            await signUp.create({
                emailAddress: data.email,
                password: data.password,
            });

            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

            setPendingVerification(true);
        } catch (err) {
            console.error(JSON.stringify(err, null, 2));

            if (isClerkAPIResponseError(err)) {
                err.errors.forEach((error) => {
                    const fieldName = mapClerkErrorToFormField(error);
                    setError(fieldName as keyof SignUpFields | 'root', {
                        message: error.longMessage,
                    });
                });
            } else {
                setError('root', { message: 'Unknown error occurred' });
            }
        }
    };

    // Handle submission of verification form
    const onVerifyPress = async () => {
        if (!isLoaded) return;

        try {
            const signUpAttempt = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (signUpAttempt.status === 'complete') {
                await setActive({ session: signUpAttempt.createdSessionId });
                router.replace('/');
            } else {
                console.error(JSON.stringify(signUpAttempt, null, 2));
            }
        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
        }
    };

    if (pendingVerification) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText type="title" style={styles.title}>Verify your email</ThemedText>

                <ThemedView style={styles.form}>
                    <TextInput
                        style={styles.input}
                        value={code}
                        placeholder="Enter your verification code"
                        placeholderTextColor="#666"
                        onChangeText={(code) => setCode(code)}
                    />

                    <TouchableOpacity style={styles.button} onPress={onVerifyPress}>
                        <ThemedText style={styles.buttonText}>Verify</ThemedText>
                    </TouchableOpacity>
                </ThemedView>
            </ThemedView>
        );
    }

    return (
        <ThemedKeyboardAvoidingView style={styles.container}>
            <ThemedText type="title" style={styles.title}>Sign up</ThemedText>

            <ThemedView style={styles.form}>
                <CustomInput
                    control={control}
                    name="email"
                    placeholder="Enter email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    style={styles.input}
                />

                <CustomInput
                    control={control}
                    name="password"
                    placeholder="Enter password"
                    secureTextEntry={true}
                    style={styles.input}
                />

                {errors.root && (
                    <ThemedText style={styles.errorText}>{errors.root.message}</ThemedText>
                )}

                <TouchableOpacity style={styles.button} onPress={handleSubmit(onSignUpPress)}>
                    <ThemedText style={styles.buttonText}>Continue</ThemedText>
                </TouchableOpacity>
            </ThemedView>

            <ThemedView style={styles.footer}>
                <ThemedText>Already have an account? </ThemedText>
                <Link href="/(auth)/sign-in">
                    <ThemedText type="link">Sign in</ThemedText>
                </Link>
            </ThemedView>
            <ThemedView style={{ flexDirection: 'row', gap: 10, marginHorizontal: 'auto' }}>
                <SignInWith strategy='oauth_google' />
                <SignInWith strategy='oauth_apple' />
            </ThemedView>
        </ThemedKeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        textAlign: 'center',
        marginBottom: 40,
    },
    form: {
        gap: 16,
        marginBottom: 32,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#0a7ea4',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    errorText: {
        color: 'crimson',
        textAlign: 'center',
    },
});