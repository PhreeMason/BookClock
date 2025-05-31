import { useSSO } from '@clerk/clerk-expo';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect } from 'react';

import appleButton from '@/assets/social-providers/apple.png';
import googleButton from '@/assets/social-providers/google.png';

import { Image, TouchableOpacity } from 'react-native';

export const useWarmUpBrowser = () => {
    useEffect(() => {
        // Preloads the browser for Android devices to reduce authentication load time
        // See: https://docs.expo.dev/guides/authentication/#improving-user-experience
        void WebBrowser.warmUpAsync();
        return () => {
            // Cleanup: closes browser when component unmounts
            void WebBrowser.coolDownAsync();
        };
    }, []);
};

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

    // Use the `useSSO()` hook to access the `startSSOFlow()` method
    const { startSSOFlow } = useSSO();

    const onPress = useCallback(async () => {
        try {
            // Start the authentication process by calling `startSSOFlow()`
            const { createdSessionId, setActive, signIn, signUp } =
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
    }, []);

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