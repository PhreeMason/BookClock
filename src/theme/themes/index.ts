import { SimpleTheme, ThemeMode } from '../types';
import { baeTheme } from './bae';
import { cherryTheme } from './cherry';
import { cyberpunkTheme } from './cyberpunk';
import { darkTheme } from './dark';
import { desertTheme } from './desert';
import { forestTheme } from './forest';
import { galaxyTheme } from './galaxy';
import { lightTheme } from './light';
import { midnightTheme } from './midnight';
import { natureTheme } from './nature';
import { neonTheme } from './neon';
import { oceanTheme } from './ocean';
import { retroTheme } from './retro';
import { sunsetTheme } from './sunset';
import { toxicTheme } from './toxic';
import { volcanoTheme } from './volcano';

export const themes: Record<ThemeMode, SimpleTheme> = {
    light: lightTheme,
    bae: baeTheme,
    dark: darkTheme,
    nature: natureTheme,
    ocean: oceanTheme,
    sunset: sunsetTheme,
    cyberpunk: cyberpunkTheme,
    neon: neonTheme,
    volcano: volcanoTheme,
    galaxy: galaxyTheme,
    retro: retroTheme,
    toxic: toxicTheme,
    midnight: midnightTheme,
    cherry: cherryTheme,
    forest: forestTheme,
    desert: desertTheme,
};

export const themeNames: Record<ThemeMode, string> = {
    bae: 'Bae',
    light: 'Light',
    dark: 'Dark',
    nature: 'Nature',
    ocean: 'Ocean',
    sunset: 'Sunset',
    cyberpunk: 'Cyberpunk',
    neon: 'Neon',
    volcano: 'Volcano',
    galaxy: 'Galaxy',
    retro: 'Retro',
    toxic: 'Toxic',
    midnight: 'Midnight',
    cherry: 'Cherry',
    forest: 'Forest',
    desert: 'Desert',
};