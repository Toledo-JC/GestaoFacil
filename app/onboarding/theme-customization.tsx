import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen } from '../../components/layout';
import { Button } from '../../components/ui';
import { ColorPicker, PaletteSelector, ThemePreview } from '../../components/theme';
import { useTheme } from '../../hooks/useTheme';
import { predefinedPalettes, getPalettesBySegment } from '../../constants/palettes';
import { ColorPalette } from '../../types';
import { spacing, typography } from '../../constants/theme';

export default function ThemeCustomizationScreen() {
  const router = useRouter();
  const { theme, toggleDarkMode, setCustomColors } = useTheme();
  const params = useLocalSearchParams<{
    segment: string;
    name: string;
    businessName: string;
    phone: string;
    email: string;
    address: string;
  }>();

  const [primaryColor, setPrimaryColor] = useState(theme.colors.primary);
  const [secondaryColor, setSecondaryColor] = useState(theme.colors.secondary);
  const [accentColor, setAccentColor] = useState(theme.colors.accent);
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>();

  const availablePalettes = params.segment
    ? getPalettesBySegment(params.segment)
    : predefinedPalettes;

  const handlePaletteSelect = (palette: ColorPalette) => {
    setPrimaryColor(palette.primary);
    setSecondaryColor(palette.secondary);
    setAccentColor(palette.accent);
    setSelectedPaletteId(palette.id);
  };

  const handleContinue = async () => {
    await setCustomColors(primaryColor, secondaryColor, accentColor);
    
    router.push({
      pathname: '/onboarding/password-setup',
      params,
    });
  };

  const handleSkip = () => {
    router.push({
      pathname: '/onboarding/password-setup',
      params,
    });
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Personalize seu Tema
          </Text>

          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Escolha as cores que melhor representam seu negócio
          </Text>

          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.darkModeToggle}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Modo Escuro
              </Text>
              <Switch
                value={theme.isDark}
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#d1d5db', true: theme.colors.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <PaletteSelector
            palettes={availablePalettes}
            selectedPaletteId={selectedPaletteId}
            onSelectPalette={handlePaletteSelect}
            themeColors={theme.colors}
          />

          <View style={styles.customSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Cores Personalizadas
            </Text>

            <ColorPicker
              label="Cor Primária"
              color={primaryColor}
              onColorChange={(color) => {
                setPrimaryColor(color);
                setSelectedPaletteId(undefined);
              }}
              themeColors={theme.colors}
            />

            <ColorPicker
              label="Cor Secundária"
              color={secondaryColor}
              onColorChange={(color) => {
                setSecondaryColor(color);
                setSelectedPaletteId(undefined);
              }}
              themeColors={theme.colors}
            />

            <ColorPicker
              label="Cor de Destaque"
              color={accentColor}
              onColorChange={(color) => {
                setAccentColor(color);
                setSelectedPaletteId(undefined);
              }}
              themeColors={theme.colors}
            />
          </View>

          <ThemePreview
            colors={{
              primary: primaryColor,
              secondary: secondaryColor,
              accent: accentColor,
              background: theme.colors.background,
              surface: theme.colors.surface,
              text: theme.colors.text,
              textSecondary: theme.colors.textSecondary,
            }}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button title="Pular" onPress={handleSkip} variant="secondary" fullWidth />
          <Button title="Salvar e Continuar" onPress={handleContinue} fullWidth />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
  },

  scrollContent: {
    padding: spacing.lg,
  },

  title: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },

  subtitle: {
    ...typography.body,
    marginBottom: spacing.xl,
  },

  section: {
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },

  darkModeToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },

  customSection: {
    marginBottom: spacing.lg,
  },

  footer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
});
