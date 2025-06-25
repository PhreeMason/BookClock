/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { palette } from './palette';

export const Colors = {
    light: {
        text: palette.chryslerBlue[400],
        textMuted: palette.amethyst[400],
        background: palette.honeydew[900],
        card: palette.celadon[900],
        cardOverlay: palette.white.DEFAULT,
        border: palette.celadon.DEFAULT,
        primary: palette.chryslerBlue.DEFAULT,
        primaryForeground: palette.honeydew.DEFAULT,
        ring: palette.celadon.DEFAULT,
        icon: palette.amethyst.DEFAULT,
        tabIconDefault: palette.amethyst.DEFAULT,
        tabIconSelected: palette.chryslerBlue.DEFAULT,
        danger: palette.red.DEFAULT,
        destructive: palette.red.DEFAULT,
        destructiveForeground: palette.white.DEFAULT,
        success: palette.green.DEFAULT,
        successForeground: palette.white.DEFAULT,
        // Additional colors for magic strings
        inputBorder: palette.gray[300],
        inputBackground: palette.white.DEFAULT,
        buttonPrimary: palette.blue.DEFAULT,
        buttonText: palette.white.DEFAULT,
        error: palette.red.DEFAULT,
        warning: palette.orange.DEFAULT,
        overlay: palette.black.DEFAULT,
        shadow: palette.black.DEFAULT,
    },
    dark: {
        text: palette.honeydew.DEFAULT,
        textMuted: palette.celadon.DEFAULT,
        background: palette.chryslerBlue[200],
        card: palette.chryslerBlue[300],
        cardOverlay: palette.black.DEFAULT,
        border: palette.amethyst[300],
        primary: palette.chryslerBlue.DEFAULT,
        primaryForeground: palette.honeydew.DEFAULT,
        ring: palette.celadon.DEFAULT,
        icon: palette.celadon.DEFAULT,
        tabIconDefault: palette.celadon.DEFAULT,
        tabIconSelected: palette.honeydew.DEFAULT,
        danger: palette.red[100],
        destructive: palette.red[100],
        destructiveForeground: palette.white.DEFAULT,
        success: palette.green.DEFAULT,
        successForeground: palette.white.DEFAULT,
        // Additional colors for magic strings
        inputBorder: palette.gray[600],
        inputBackground: palette.white.DEFAULT,
        buttonPrimary: palette.blue.DEFAULT,
        buttonText: palette.white.DEFAULT,
        error: palette.red[100],
        warning: palette.orange.DEFAULT,
        overlay: palette.black.DEFAULT,
        shadow: palette.black.DEFAULT,
    },
};
