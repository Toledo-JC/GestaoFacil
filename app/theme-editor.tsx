import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/layout';
import { ColorPickerAdvanced, ThemeContrastChecker, ColorHarmonyPicker } from '../components/theme';
import { Button } from '../components/ui';
import { useTheme } from '../hooks/useTheme';
import { ColorHarmony } from '../types';
import { theme, typography, spacing } from '../constants/theme';
import { lighten, darken, makeAccessible } from '../utils/colors';

export default function ThemeEditorScreen() {
  const router = useRouter();
  const { customColors, updateTheme } = useTheme();

  const [primary, setPrimary] = useState(customColors?.primary || theme.colors.primary);
  const [secondary, setSecondary] = useState(customColors?.secondary || theme.colors.secondary);
  const [accent, setAccent] = useState(customColors?.accent || theme.colors.accent);
  const [background, setBackground] = useState(theme.colors.background);
  const [selectedHarmony, setSelectedHarmony] = useState<ColorHarmony>();

  const handleHarmonySelect = (harmony: ColorHarmony, colors: string[]) => {
    setSelectedHarmony(harmony);
    if (colors.length >= 1) setPrimary(colors[0]);
    if (colors.length >= 2) setSecondary(colors[1]);
    if (colors.length >= 3) setAccent(colors[2]);
  };

  const handleSave = async () => {
    await updateTheme({
      primary: makeAccessible(primary, background),
      secondary: makeAccessible(secondary, background),
      accent: makeAccessible(accent, background),
    });
    router.back();
  };

  const handleReset = () => {
    setPrimary(theme.colors.primary);
    setSecondary(theme.colors.secondary);
    setAccent(theme.colors.accent);
    setSelectedHarmony(undefined);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editor de Temas</Text>
        <TouchableOpacity onPress={handleReset}>
          <Ionicons name="refresh" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Color Harmony Picker */}
        <ColorHarmonyPicker
          baseColor={primary}
          selectedHarmony={selectedHarmony}
          onHarmonySelect={handleHarmonySelect}
        />

        {/* Advanced Color Pickers */}
        <ColorPickerAdvanced
          color={primary}
          onColorChange={setPrimary}
          label="Cor Primária"
        />

        <ColorPickerAdvanced
          color={secondary}
          onColorChange={setSecondary}
          label="Cor Secundária"
        />

        <ColorPickerAdvanced
          color={accent}
          onColorChange={setAccent}
          label="Cor de Destaque"
        />

        {/* Contrast Checker */}
        <ThemeContrastChecker
          primaryColor={primary}
          secondaryColor={secondary}
          accentColor={accent}
          backgroundColor={background}
          textColor={theme.colors.text}
        />

        {/* Save Button */}
        <Button
          title="Salvar Tema"
          onPress={handleSave}
          style={styles.saveButton}
        />

        <View style={styles.infoCard}>
          <Ionicons name="bulb-outline" size={20} color={theme.colors.info} />
          <Text style={styles.infoText}>
            As cores serão ajustadas automaticamente para garantir acessibilidade (WCAG AA)
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  backButton: {
    padding: 4,
  },

  headerTitle: {
    ...typography.h3,
    color: theme.colors.text,
  },

  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },

  saveButton: {
    marginTop: spacing.md,
  },

  infoCard: {
    flexDirection: 'row',
    backgroundColor: `${theme.colors.info}10`,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },

  infoText: {
    ...typography.caption,
    color: theme.colors.info,
    flex: 1,
  },
});
