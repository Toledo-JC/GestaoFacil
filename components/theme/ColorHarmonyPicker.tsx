import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAnalogous, getComplementary, getTriadic, getTetradic, getMonochromatic } from '../../utils/colors';
import { ColorHarmony } from '../../types';
import { theme, typography, spacing } from '../../constants/theme';

interface ColorHarmonyPickerProps {
  baseColor: string;
  selectedHarmony?: ColorHarmony;
  onHarmonySelect: (harmony: ColorHarmony, colors: string[]) => void;
}

export function ColorHarmonyPicker({
  baseColor,
  selectedHarmony,
  onHarmonySelect,
}: ColorHarmonyPickerProps) {
  const harmonies = [
    {
      type: 'ANALOGOUS' as ColorHarmony,
      name: 'Análogas',
      description: 'Cores adjacentes no círculo cromático',
      icon: 'git-network-outline',
      colors: getAnalogous(baseColor),
    },
    {
      type: 'COMPLEMENTARY' as ColorHarmony,
      name: 'Complementar',
      description: 'Cor oposta no círculo cromático',
      icon: 'contrast-outline',
      colors: [baseColor, getComplementary(baseColor)],
    },
    {
      type: 'TRIADIC' as ColorHarmony,
      name: 'Tríade',
      description: 'Três cores equidistantes (120°)',
      icon: 'triangle-outline',
      colors: getTriadic(baseColor),
    },
    {
      type: 'TETRADIC' as ColorHarmony,
      name: 'Tétrade',
      description: 'Quatro cores em quadrado (90°)',
      icon: 'square-outline',
      colors: getTetradic(baseColor),
    },
    {
      type: 'MONOCHROMATIC' as ColorHarmony,
      name: 'Monocromática',
      description: 'Variações da mesma cor',
      icon: 'water-outline',
      colors: getMonochromatic(baseColor),
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="color-palette-outline" size={24} color={theme.colors.text} />
        <Text style={styles.title}>Harmonias de Cores</Text>
      </View>

      <ScrollView style={styles.harmoniesContainer} showsVerticalScrollIndicator={false}>
        {harmonies.map((harmony) => (
          <TouchableOpacity
            key={harmony.type}
            style={[
              styles.harmonyCard,
              selectedHarmony === harmony.type && styles.harmonyCardActive,
            ]}
            onPress={() => onHarmonySelect(harmony.type, harmony.colors)}
            activeOpacity={0.7}
          >
            <View style={styles.harmonyHeader}>
              <Ionicons
                name={harmony.icon as any}
                size={20}
                color={selectedHarmony === harmony.type ? theme.colors.primary : theme.colors.text}
              />
              <View style={styles.harmonyInfo}>
                <Text style={[
                  styles.harmonyName,
                  selectedHarmony === harmony.type && styles.harmonyNameActive,
                ]}>
                  {harmony.name}
                </Text>
                <Text style={styles.harmonyDescription}>{harmony.description}</Text>
              </View>
              {selectedHarmony === harmony.type && (
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
              )}
            </View>

            <View style={styles.colorPalette}>
              {harmony.colors.map((color, index) => (
                <View
                  key={index}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color },
                    index === 0 && styles.colorSwatchFirst,
                  ]}
                >
                  {index === 0 && (
                    <Ionicons name="star" size={12} color="#FFFFFF" />
                  )}
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={16} color={theme.colors.info} />
        <Text style={styles.infoText}>
          Escolha uma harmonia para gerar automaticamente uma paleta de cores balanceada
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  title: {
    ...typography.h4,
    fontWeight: '700',
    color: theme.colors.text,
  },

  harmoniesContainer: {
    maxHeight: 400,
  },

  harmonyCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  harmonyCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}05`,
  },

  harmonyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },

  harmonyInfo: {
    flex: 1,
  },

  harmonyName: {
    ...typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },

  harmonyNameActive: {
    color: theme.colors.primary,
  },

  harmonyDescription: {
    ...typography.caption,
    color: theme.colors.textSecondary,
  },

  colorPalette: {
    flexDirection: 'row',
    gap: spacing.xs,
  },

  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  colorSwatchFirst: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },

  infoCard: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: `${theme.colors.info}10`,
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.sm,
  },

  infoText: {
    ...typography.caption,
    color: theme.colors.info,
    flex: 1,
  },
});
