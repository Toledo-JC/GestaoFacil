import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/layout';
import { useTheme } from '../hooks/useTheme';
import { ThemePreset } from '../types';
import { theme, typography, spacing } from '../constants/theme';

export default function ThemePresetsScreen() {
  const router = useRouter();
  const { updateTheme } = useTheme();

  const presets: ThemePreset[] = [
    {
      id: 'refrigeracao',
      name: 'Refrigeração',
      description: 'Tons frios e profissionais',
      segment: 'Refrigeração',
      icon: 'snow-outline',
      primaryColor: '#0EA5E9',
      secondaryColor: '#06B6D4',
      accentColor: '#3B82F6',
      backgroundColor: '#F0F9FF',
      tags: ['Frio', 'Profissional', 'Tecnologia'],
      popular: true,
    },
    {
      id: 'automotivo',
      name: 'Automotivo',
      description: 'Vermelho forte e dinâmico',
      segment: 'Automotivo',
      icon: 'car-sport-outline',
      primaryColor: '#DC2626',
      secondaryColor: '#EA580C',
      accentColor: '#F59E0B',
      backgroundColor: '#FEF2F2',
      tags: ['Dinâmico', 'Energético', 'Forte'],
      popular: true,
    },
    {
      id: 'eletrica',
      name: 'Elétrica',
      description: 'Amarelo energético',
      segment: 'Elétrica',
      icon: 'flash-outline',
      primaryColor: '#EAB308',
      secondaryColor: '#F59E0B',
      accentColor: '#FBBF24',
      backgroundColor: '#FFFBEB',
      tags: ['Energia', 'Visibilidade', 'Segurança'],
      popular: false,
    },
    {
      id: 'hidraulica',
      name: 'Hidráulica',
      description: 'Azul água e natureza',
      segment: 'Hidráulica',
      icon: 'water-outline',
      primaryColor: '#0284C7',
      secondaryColor: '#0891B2',
      accentColor: '#06B6D4',
      backgroundColor: '#F0F9FF',
      tags: ['Água', 'Natureza', 'Confiança'],
      popular: false,
    },
    {
      id: 'eletronica',
      name: 'Eletrônica',
      description: 'Roxo moderno e tech',
      segment: 'Eletrônica',
      icon: 'hardware-chip-outline',
      primaryColor: '#7C3AED',
      secondaryColor: '#8B5CF6',
      accentColor: '#A78BFA',
      backgroundColor: '#FAF5FF',
      tags: ['Tecnologia', 'Moderno', 'Inovação'],
      popular: true,
    },
    {
      id: 'minimalista',
      name: 'Minimalista',
      description: 'Cinza elegante e clean',
      icon: 'contrast-outline',
      primaryColor: '#3F3F46',
      secondaryColor: '#52525B',
      accentColor: '#71717A',
      backgroundColor: '#FAFAFA',
      tags: ['Elegante', 'Clean', 'Profissional'],
      popular: false,
    },
    {
      id: 'natureza',
      name: 'Natureza',
      description: 'Verde sustentável',
      icon: 'leaf-outline',
      primaryColor: '#16A34A',
      secondaryColor: '#22C55E',
      accentColor: '#4ADE80',
      backgroundColor: '#F0FDF4',
      tags: ['Sustentável', 'Ecológico', 'Fresco'],
      popular: false,
    },
    {
      id: 'noturno',
      name: 'Noturno',
      description: 'Azul escuro e moderno',
      icon: 'moon-outline',
      primaryColor: '#1E40AF',
      secondaryColor: '#3B82F6',
      accentColor: '#60A5FA',
      backgroundColor: '#EFF6FF',
      tags: ['Noturno', 'Sofisticado', 'Moderno'],
      popular: false,
    },
  ];

  const handleSelectPreset = async (preset: ThemePreset) => {
    await updateTheme({
      primary: preset.primaryColor,
      secondary: preset.secondaryColor,
      accent: preset.accentColor,
    });
    router.back();
  };

  const renderPresetCard = (preset: ThemePreset) => (
    <TouchableOpacity
      key={preset.id}
      style={styles.presetCard}
      onPress={() => handleSelectPreset(preset)}
      activeOpacity={0.7}
    >
      {preset.popular && (
        <View style={styles.popularBadge}>
          <Ionicons name="star" size={12} color="#FFFFFF" />
          <Text style={styles.popularText}>Popular</Text>
        </View>
      )}

      <View style={[styles.presetIcon, { backgroundColor: `${preset.primaryColor}20` }]}>
        <Ionicons name={preset.icon as any} size={32} color={preset.primaryColor} />
      </View>

      <Text style={styles.presetName}>{preset.name}</Text>
      <Text style={styles.presetDescription}>{preset.description}</Text>

      <View style={styles.colorPalette}>
        <View style={[styles.colorDot, { backgroundColor: preset.primaryColor }]} />
        <View style={[styles.colorDot, { backgroundColor: preset.secondaryColor }]} />
        <View style={[styles.colorDot, { backgroundColor: preset.accentColor }]} />
      </View>

      <View style={styles.tags}>
        {preset.tags.slice(0, 2).map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Temas Pré-definidos</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Escolha um tema para seu negócio:</Text>

        <View style={styles.presetsGrid}>
          {presets.map(renderPresetCard)}
        </View>

        <TouchableOpacity
          style={styles.customButton}
          onPress={() => router.push('/theme-editor')}
        >
          <Ionicons name="brush-outline" size={24} color={theme.colors.primary} />
          <View style={styles.customButtonContent}>
            <Text style={styles.customButtonTitle}>Tema Personalizado</Text>
            <Text style={styles.customButtonDescription}>
              Crie seu próprio tema do zero
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
        </TouchableOpacity>
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
  },

  sectionTitle: {
    ...typography.h4,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },

  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },

  presetCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: 'relative',
  },

  popularBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warning,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },

  popularText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  presetIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  presetName: {
    ...typography.body,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },

  presetDescription: {
    ...typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: spacing.sm,
  },

  colorPalette: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },

  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },

  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },

  tag: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },

  tagText: {
    ...typography.caption,
    fontSize: 10,
    color: theme.colors.textSecondary,
  },

  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}10`,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },

  customButtonContent: {
    flex: 1,
    marginLeft: spacing.md,
  },

  customButtonTitle: {
    ...typography.body,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 2,
  },

  customButtonDescription: {
    ...typography.caption,
    color: theme.colors.textSecondary,
  },
});
