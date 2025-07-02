import { useClerk, useSSO } from '@clerk/clerk-expo';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useCallback } from 'react';

// @ts-ignore
import appleButton from '@/assets/social-providers/apple.png';
// @ts-ignore
import googleButton from '@/assets/social-providers/google.png';

import { useWarmUpBrowser } from '@/hooks/useWarmUpBrowser';
import { Image, TouchableOpacity } from 'react-native';
// Handle any pending authentication sessions
WebBrowser.maybeCompleteAuthSession();

type SignInWithProps = {
    strategy: 'oauth_google' | 'oauth_apple';
};

const strategyIcons = {
    oauth_google: googleButton,
    oauth_apple: appleButton,
};

export default function SignInWith({ strategy }: SignInWithProps) {
    useWarmUpBrowser();
    const { signOut } = useClerk()

    // Use the `useSSO()` hook to access the `startSSOFlow()` method
    const { startSSOFlow } = useSSO();

    const onPress = useCallback(async () => {
        try {
            // Start the authentication process by calling `startSSOFlow()`
            await signOut()
            
            const { createdSessionId, setActive } =
                await startSSOFlow({
                    strategy,
                    // For web, defaults to current path
                    // For native, you must pass a scheme, like AuthSession.makeRedirectUri({ scheme, path })
                    // For more info, see https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionmakeredirecturioptions
                    redirectUrl: AuthSession.makeRedirectUri(),
                });

            // If sign in was successful, set the active session
            if (createdSessionId) {
                setActive!({ session: createdSessionId });
            } else {
                // If there is no `createdSessionId`,
                // there are missing requirements, such as MFA
                // Use the `signIn` or `signUp` returned from `startSSOFlow`
                // to handle next steps
            }
        } catch (err) {
            // See https://clerk.com/docs/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(err, null, 2));
        }
    }, [signOut, startSSOFlow, strategy]);

    return (
        <TouchableOpacity onPress={onPress}>
            <Image
                source={strategyIcons[strategy]}
                style={{ width: 62, height: 62 }}
                resizeMode='contain'
            />
        </TouchableOpacity>
    );
}