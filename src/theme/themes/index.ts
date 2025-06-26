import { lightTheme } from './light';
import { darkTheme } from './dark';
import { natureTheme } from './nature';
import { oceanTheme } from './ocean';
import { sunsetTheme } from './sunset';
import { cyberpunkTheme } from './cyberpunk';
import { neonTheme } from './neon';
import { volcanoTheme } from './volcano';
import { galaxyTheme } from './galaxy';
import { retroTheme } from './retro';
import { toxicTheme } from './toxic';
import { midnightTheme } from './midnight';
import { cherryTheme } from './cherry';
import { forestTheme } from './forest';
import { desertTheme } from './desert';
import { SimpleTheme, ThemeMode } from '../types';

export const themes: Record<ThemeMode, SimpleTheme> = {
  light: lightTheme,
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