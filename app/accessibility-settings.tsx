import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Screen } from '../components/layout';
import { Button } from '../components/ui';
import { FontSizePreset } from '../types';
import { theme, typography, spacing } from '../constants/theme';

export default function AccessibilitySettingsScreen() {
  const router = useRouter();

  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [fontSize, setFontSize] = useState<FontSizePreset>('MEDIUM');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [colorBlindMode, setColorBlindMode] = useState<'NONE' | 'PROTANOPIA' | 'DEUTERANOPIA' | 'TRITANOPIA'>('NONE');
  const [voiceGuidance, setVoiceGuidance] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  const fontSizePresets: { value: FontSizePreset; label: string; size: number }[] = [
    { value: 'SMALL', label: 'Pequeno', size: 12 },
    { value: 'MEDIUM', label: 'Médio', size: 14 },
    { value: 'LARGE', label: 'Grande', size: 16 },
    { value: 'XLARGE', label: 'Extra Grande', size: 18 },
  ];

  const colorBlindModes = [
    { value: 'NONE', label: 'Nenhum', description: 'Visão normal' },
    { value: 'PROTANOPIA' as const, label: 'Protanopia', description: 'Dificuldade com vermelho' },
    { value: 'DEUTERANOPIA' as const, label: 'Deuteranopia', description: 'Dificuldade com verde' },
    { value: 'TRITANOPIA' as const, label: 'Tritanopia', description: 'Dificuldade com azul' },
  ];

  const handleSave = () => {
    // Save settings to context/storage
    Alert.alert('Sucesso', 'Configurações de acessibilidade salvas!');
    router.back();
  };

  const handleReset = () => {
    Alert.alert(
      'Restaurar Padrões',
      'Deseja restaurar as configurações de acessibilidade para os valores padrão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          onPress: () => {
            setHighContrast(false);
            setLargeText(false);
            setFontSize('MEDIUM');
            setReduceMotion(false);
            setScreenReader(false);
            setColorBlindMode('NONE');
            setVoiceGuidance(false);
            setHapticFeedback(true);
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Acessibilidade</Text>
        <TouchableOpacity onPress={handleReset}>
          <Ionicons name="refresh" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Visual Section */}
        <Text style={styles.sectionTitle}>Visual</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Alto Contraste</Text>
            <Text style={styles.settingDescription}>
              Aumenta o contraste para melhor visibilidade
            </Text>
          </View>
          <Switch
            value={highContrast}
            onValueChange={setHighContrast}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Texto Grande</Text>
            <Text style={styles.settingDescription}>
              Ativa texto em tamanho ampliado
            </Text>
          </View>
          <Switch
            value={largeText}
            onValueChange={setLargeText}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>

        <View style={styles.fontSizeCard}>
          <Text style={styles.fontSizeLabel}>Tamanho da Fonte:</Text>
          <View style={styles.fontSizeOptions}>
            {fontSizePresets.map((preset) => (
              <TouchableOpacity
                key={preset.value}
                style={[
                  styles.fontSizeButton,
                  fontSize === preset.value && styles.fontSizeButtonActive,
                ]}
                onPress={() => setFontSize(preset.value)}
              >
                <Text
                  style={[
                    styles.fontSizeButtonText,
                    fontSize === preset.value && styles.fontSizeButtonTextActive,
                    { fontSize: preset.size },
                  ]}
                >
                  A
                </Text>
                <Text style={[
                  styles.fontSizeButtonLabel,
                  fontSize === preset.value && styles.fontSizeButtonTextActive,
                ]}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.colorBlindCard}>
          <Text style={styles.colorBlindLabel}>Modo para Daltônicos:</Text>
          {colorBlindModes.map((mode) => (
            <TouchableOpacity
              key={mode.value}
              style={[
                styles.colorBlindOption,
                colorBlindMode === mode.value && styles.colorBlindOptionActive,
              ]}
              onPress={() => setColorBlindMode(mode.value)}
            >
              <View style={styles.radioButton}>
                {colorBlindMode === mode.value && <View style={styles.radioButtonInner} />}
              </View>
              <View style={styles.colorBlindContent}>
                <Text style={[
                  styles.colorBlindTitle,
                  colorBlindMode === mode.value && styles.colorBlindTitleActive,
                ]}>
                  {mode.label}
                </Text>
                <Text style={styles.colorBlindDescription}>{mode.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Motion Section */}
        <Text style={styles.sectionTitle}>Movimento</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Reduzir Movimento</Text>
            <Text style={styles.settingDescription}>
              Desativa animações e transições
            </Text>
          </View>
          <Switch
            value={reduceMotion}
            onValueChange={setReduceMotion}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>

        {/* Audio & Feedback Section */}
        <Text style={styles.sectionTitle}>Áudio e Feedback</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Otimizar para Leitor de Tela</Text>
            <Text style={styles.settingDescription}>
              Melhora compatibilidade com TalkBack/VoiceOver
            </Text>
          </View>
          <Switch
            value={screenReader}
            onValueChange={setScreenReader}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Guia por Voz</Text>
            <Text style={styles.settingDescription}>
              Narração de ações e notificações
            </Text>
          </View>
          <Switch
            value={voiceGuidance}
            onValueChange={setVoiceGuidance}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Feedback Tátil</Text>
            <Text style={styles.settingDescription}>
              Vibração ao tocar botões
            </Text>
          </View>
          <Switch
            value={hapticFeedback}
            onValueChange={setHapticFeedback}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>

        <Button
          title="Salvar Configurações"
          onPress={handleSave}
          style={styles.saveButton}
        />

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={theme.colors.info} />
          <Text style={styles.infoText}>
            Estas configurações ajudam a tornar o aplicativo mais acessível para todos os usuários
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
  },

  sectionTitle: {
    ...typography.h4,
    color: theme.colors.text,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },

  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  settingContent: {
    flex: 1,
    marginRight: spacing.md,
  },

  settingTitle: {
    ...typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },

  settingDescription: {
    ...typography.caption,
    color: theme.colors.textSecondary,
  },

  fontSizeCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  fontSizeLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: spacing.sm,
  },

  fontSizeOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  fontSizeButton: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },

  fontSizeButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },

  fontSizeButtonText: {
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },

  fontSizeButtonTextActive: {
    color: theme.colors.primary,
  },

  fontSizeButtonLabel: {
    ...typography.caption,
    fontSize: 10,
    color: theme.colors.textSecondary,
  },

  colorBlindCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  colorBlindLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: spacing.sm,
  },

  colorBlindOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },

  colorBlindOptionActive: {
    backgroundColor: `${theme.colors.primary}10`,
  },

  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },

  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },

  colorBlindContent: {
    flex: 1,
  },

  colorBlindTitle: {
    ...typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },

  colorBlindTitleActive: {
    color: theme.colors.primary,
  },

  colorBlindDescription: {
    ...typography.caption,
    color: theme.colors.textSecondary,
  },

  saveButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
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
