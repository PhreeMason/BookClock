import { SimpleTheme, ThemeMode } from '../types';

const lightTheme: SimpleTheme = {
    text: '#3A3A3A',
    background: '#ffffff',
    primary: '#B8A9D9',
    secondary: '#E8B4A0',
    accent: '#E8B4B8',
    isDark: false,
}

const darkTheme: SimpleTheme = {
    text: '#3A3A3A',
    background: '#ffffff',
    primary: '#B8A9D9',
    secondary: '#E8B4A0',
    accent: '#E8B4B8',
    isDark: true,
}

export const themes: Record<ThemeMode, SimpleTheme> = {
    light: lightTheme,
    dark: darkTheme
};

export const themeNames: Record<ThemeMode, string> = {
    light: 'light',
    dark: 'dark'
};