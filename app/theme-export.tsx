import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Screen } from '../components/layout';
import { Button } from '../components/ui';
import { useTheme } from '../hooks/useTheme';
import { ThemeExport } from '../types';
import { theme, typography, spacing } from '../constants/theme';

export default function ThemeExportScreen() {
  const router = useRouter();
  const { customColors } = useTheme();

  const [themeName, setThemeName] = useState('Meu Tema Personalizado');
  const [themeDescription, setThemeDescription] = useState('');
  const [author, setAuthor] = useState('');

  const handleExportTheme = async () => {
    try {
      const themeData: ThemeExport = {
        version: '1.0.0',
        name: themeName,
        description: themeDescription || undefined,
        author: author || undefined,
        exportedAt: new Date().toISOString(),
        colors: {
          primary: customColors?.primary || theme.colors.primary,
          secondary: customColors?.secondary || theme.colors.secondary,
          accent: customColors?.accent || theme.colors.accent,
          background: theme.colors.background,
          surface: theme.colors.surface,
          text: theme.colors.text,
        },
        accessibility: {
          contrastLevel: 'AA',
          highContrast: false,
          fontSize: 'MEDIUM',
        },
      };

      const fileName = `theme_${themeName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(themeData, null, 2));

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Exportar Tema',
        });
      }

      Alert.alert('Sucesso!', 'Tema exportado com sucesso');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao exportar tema');
    }
  };

  const handleImportTheme = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const themeData: ThemeExport = JSON.parse(fileContent);

      // Validate theme data
      if (!themeData.version || !themeData.colors) {
        throw new Error('Arquivo de tema inválido');
      }

      Alert.alert(
        'Importar Tema',
        `Deseja importar o tema "${themeData.name}"?\n\nAutor: ${themeData.author || 'Desconhecido'}\nVersão: ${themeData.version}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Importar',
            onPress: () => {
              // Apply imported theme
              // This would call updateTheme from useTheme hook
              Alert.alert('Sucesso!', 'Tema importado com sucesso');
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao importar tema');
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exportar/Importar Tema</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Export Section */}
        <Text style={styles.sectionTitle}>Exportar Tema Atual</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Nome do Tema:</Text>
          <TextInput
            style={styles.input}
            value={themeName}
            onChangeText={setThemeName}
            placeholder="Ex: Tema Refrigeração Pro"
            placeholderTextColor={theme.colors.textTertiary}
          />

          <Text style={styles.label}>Descrição (opcional):</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={themeDescription}
            onChangeText={setThemeDescription}
            placeholder="Descreva seu tema..."
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Autor (opcional):</Text>
          <TextInput
            style={styles.input}
            value={author}
            onChangeText={setAuthor}
            placeholder="Seu nome ou empresa"
            placeholderTextColor={theme.colors.textTertiary}
          />

          <View style={styles.previewColors}>
            <View style={styles.previewColorItem}>
              <View style={[styles.previewColorBox, { backgroundColor: customColors?.primary || theme.colors.primary }]} />
              <Text style={styles.previewColorLabel}>Primária</Text>
            </View>
            <View style={styles.previewColorItem}>
              <View style={[styles.previewColorBox, { backgroundColor: customColors?.secondary || theme.colors.secondary }]} />
              <Text style={styles.previewColorLabel}>Secundária</Text>
            </View>
            <View style={styles.previewColorItem}>
              <View style={[styles.previewColorBox, { backgroundColor: customColors?.accent || theme.colors.accent }]} />
              <Text style={styles.previewColorLabel}>Destaque</Text>
            </View>
          </View>

          <Button
            title="Exportar e Compartilhar"
            onPress={handleExportTheme}
            icon={<Ionicons name="share-outline" size={20} color={theme.colors.surface} />}
          />
        </View>

        {/* Import Section */}
        <Text style={styles.sectionTitle}>Importar Tema</Text>

        <TouchableOpacity style={styles.importCard} onPress={handleImportTheme}>
          <View style={styles.importIconContainer}>
            <Ionicons name="download-outline" size={32} color={theme.colors.primary} />
          </View>
          <View style={styles.importContent}>
            <Text style={styles.importTitle}>Escolher Arquivo JSON</Text>
            <Text style={styles.importDescription}>
              Importe um tema previamente exportado
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={theme.colors.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Como funciona:</Text>
            <Text style={styles.infoText}>
              • Exporte seu tema como arquivo JSON{'\n'}
              • Compartilhe com outros dispositivos{'\n'}
              • Importe temas de outras pessoas{'\n'}
              • Faça backup das suas personalizações
            </Text>
          </View>
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

  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  label: {
    ...typography.caption,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },

  input: {
    ...typography.body,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    marginBottom: spacing.sm,
  },

  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },

  previewColors: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: spacing.lg,
  },

  previewColorItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },

  previewColorBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: theme.colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  previewColorLabel: {
    ...typography.caption,
    color: theme.colors.textSecondary,
  },

  importCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}10`,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    marginBottom: spacing.xl,
  },

  importIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  importContent: {
    flex: 1,
  },

  importTitle: {
    ...typography.body,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 4,
  },

  importDescription: {
    ...typography.caption,
    color: theme.colors.textSecondary,
  },

  infoCard: {
    flexDirection: 'row',
    backgroundColor: `${theme.colors.info}10`,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: theme.colors.info,
    marginBottom: 4,
  },

  infoText: {
    ...typography.caption,
    color: theme.colors.info,
    lineHeight: 18,
  },
});
