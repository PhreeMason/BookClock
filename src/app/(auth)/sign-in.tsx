import CustomInput from '@/components/shared/CustomInput';
import SignInWith from '@/components/auth/SignInWith';
import { ThemedButton, ThemedText, ThemedView, ThemedKeyboardAvoidingView } from '@/components/themed';
import { isClerkAPIResponseError, useClerk, useSignIn } from '@clerk/clerk-expo';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { z } from 'zod';

const signInSchema = z.object({
    email: z.string({ message: 'Email is required' }).email('Invalid email'),
    password: z
        .string({ message: 'Password is required' })
        .min(8, 'Password should be at least 8 characters long'),
});

type SignInFields = z.infer<typeof signInSchema>;

const mapClerkErrorToFormField = (error: any) => {
    switch (error.meta?.paramName) {
        case 'identifier':
            return 'email';
        case 'password':
            return 'password';
        default:
            return 'root';
    }
};

export default function Page() {
    const { signIn, setActive, isLoaded } = useSignIn();
    const router = useRouter();
    const { signOut } = useClerk();

    const {
        control,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<SignInFields>({
        resolver: zodResolver(signInSchema),
    });

    const onSignInPress = async (data: SignInFields) => {
        if (!isLoaded) return;

        try {
            await signOut(); // Ensure any previous session is cleared
            const signInAttempt = await signIn.create({
                identifier: data.email,
                password: data.password,
            });

            if (signInAttempt.status === 'complete') {
                await setActive({ session: signInAttempt.createdSessionId });
                router.replace('/');
            } else {
                console.error(JSON.stringify(signInAttempt, null, 2));
                setError('root', { message: 'Sign in could not be completed' });
            }
        } catch (err) {
            console.error(JSON.stringify(err, null, 2));

            if (isClerkAPIResponseError(err)) {
                err.errors.forEach((error) => {
                    const fieldName = mapClerkErrorToFormField(error);
                    setError(fieldName as keyof SignInFields | 'root', {
                        message: error.longMessage,
                    });
                });
            } else {
                setError('root', { message: 'Unknown error occurred' });
            }
        }
    };

    return (
        <ThemedKeyboardAvoidingView style={styles.container}>
            <ThemedText type="title" style={styles.title}>Sign in</ThemedText>

            <ThemedView backgroundColor="card" style={styles.form}>
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
                    <ThemedText type="error" style={styles.errorText}>{errors.root.message}</ThemedText>
                )}

                <ThemedButton
                    title="Continue"
                    style={styles.button}
                    variant="primary"
                    onPress={handleSubmit(onSignInPress)}
                />
            </ThemedView>

            <ThemedView backgroundColor="card" style={styles.footer}>
                <ThemedText>Don&apos;t have an account? </ThemedText>
                <Link href="/(auth)/sign-up">
                    <ThemedText type="link">Sign up</ThemedText>
                </Link>
            </ThemedView>
            <ThemedView backgroundColor="card" style={{ flexDirection: 'row', gap: 10, marginHorizontal: 'auto' }}>
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
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
    },
    button: {
        borderRadius: 8,
        padding: 16,
        marginTop: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    errorText: {
        textAlign: 'center',
    },
});