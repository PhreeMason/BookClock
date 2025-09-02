import { SimpleTheme, ThemeMode } from '../types';

const theOneTheme: SimpleTheme = {
    text: '#3A3A3A',
    background: '#ffffff',
    primary: '#B8A9D9',
    secondary: '#E8B4A0',
    accent: '#E8B4B8',
    isDark: false,
}

const theOneThemeDark: SimpleTheme = {
    text: '#3A3A3A',
    background: '#ffffff',
    primary: '#B8A9D9',
    secondary: '#E8B4A0',
    accent: '#E8B4B8',
    isDark: true,
}

export const themes: Record<ThemeMode, SimpleTheme> = {
    theOne: theOneTheme,
    theOneDark: theOneThemeDark
};

export const themeNames: Record<ThemeMode, string> = {
    theOne: 'The One',
    theOneDark: 'The One Dark'
};