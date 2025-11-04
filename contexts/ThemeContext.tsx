import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AppTheme, ThemeSettings } from '../types';
import { createTheme, defaultLightColors, adjustColorBrightness } from '../constants/theme';
import { settingsService } from '../services/settings.service';
import { storageService } from '../services/storage.service';

interface ThemeContextType {
  theme: AppTheme;
  loading: boolean;
  toggleDarkMode: () => void;
  setCustomColors: (primary: string, secondary: string, accent: string) => Promise<void>;
  resetTheme: () => Promise<void>;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<AppTheme>(createTheme(false));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      await storageService.init();
      const settings = await settingsService.getThemeSettings();
      
      if (settings) {
        applyThemeSettings(settings);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyThemeSettings = (settings: ThemeSettings) => {
    const customColors = {
      primary: settings.primaryColor,
      primaryDark: adjustColorBrightness(settings.primaryColor, -10),
      primaryLight: adjustColorBrightness(settings.primaryColor, 10),
      secondary: settings.secondaryColor,
      secondaryDark: adjustColorBrightness(settings.secondaryColor, -10),
      accent: settings.accentColor,
    };

    setTheme(createTheme(settings.isDark, customColors));
  };

  const toggleDarkMode = async () => {
    const newIsDark = !theme.isDark;
    const settings: ThemeSettings = {
      isDark: newIsDark,
      primaryColor: theme.colors.primary,
      secondaryColor: theme.colors.secondary,
      accentColor: theme.colors.accent,
    };

    setTheme(createTheme(newIsDark, {
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
      accent: theme.colors.accent,
    }));

    await settingsService.saveThemeSettings(settings);
  };

  const setCustomColors = async (primary: string, secondary: string, accent: string) => {
    const customColors = {
      primary,
      primaryDark: adjustColorBrightness(primary, -10),
      primaryLight: adjustColorBrightness(primary, 10),
      secondary,
      secondaryDark: adjustColorBrightness(secondary, -10),
      accent,
    };

    const settings: ThemeSettings = {
      isDark: theme.isDark,
      primaryColor: primary,
      secondaryColor: secondary,
      accentColor: accent,
    };

    setTheme(createTheme(theme.isDark, customColors));
    await settingsService.saveThemeSettings(settings);
  };

  const resetTheme = async () => {
    const settings: ThemeSettings = {
      isDark: false,
      primaryColor: defaultLightColors.primary,
      secondaryColor: defaultLightColors.secondary,
      accentColor: defaultLightColors.accent,
    };

    setTheme(createTheme(false));
    await settingsService.saveThemeSettings(settings);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        loading,
        toggleDarkMode,
        setCustomColors,
        resetTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
