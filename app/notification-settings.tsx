import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/layout';
import { Button } from '../components/ui';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationCategory, NotificationSettings } from '../types';
import { theme, typography, spacing } from '../constants/theme';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { getSettings, updateSettings, runSmartAnalysis } = useNotifications();

  const [settings, setSettings] = useState<Record<NotificationCategory, NotificationSettings | null>>({
    FINANCIAL: null,
    OPERATIONAL: null,
    CLIENT: null,
    ANALYTICS: null,
    SYSTEM: null,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const categories: NotificationCategory[] = ['FINANCIAL', 'OPERATIONAL', 'CLIENT', 'ANALYTICS', 'SYSTEM'];
    
    for (const category of categories) {
      const data = await getSettings(category);
      setSettings(prev => ({ ...prev, [category]: data }));
    }
  };

  const handleToggle = async (category: NotificationCategory, field: keyof NotificationSettings, value: boolean) => {
    const current = settings[category];
    const updated = { ...current, [field]: value, category };
    
    await updateSettings(updated);
    setSettings(prev => ({ ...prev, [category]: { ...current!, [field]: value } }));
  };

  const handleRunAnalysis = async () => {
    Alert.alert(
      'Análise Inteligente',
      'Deseja executar uma análise completa e gerar alertas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Executar',
          onPress: async () => {
            await runSmartAnalysis();
            Alert.alert('Sucesso', 'Análise executada! Verifique sua central de notificações.');
          },
        },
      ]
    );
  };

  const categories: Array<{ key: NotificationCategory; label: string; description: string; icon: string; color: string }> = [
    {
      key: 'FINANCIAL',
      label: 'Financeiro',
      description: 'Vencimentos, metas, alertas financeiros',
      icon: 'cash-outline',
      color: '#10B981',
    },
    {
      key: 'OPERATIONAL',
      label: 'Operacional',
      description: 'Preventivas, estoque, ordens de serviço',
      icon: 'build-outline',
      color: '#3B82F6',
    },
    {
      key: 'CLIENT',
      label: 'Clientes',
      description: 'Aniversários, follow-up, retenção',
      icon: 'people-outline',
      color: '#8B5CF6',
    },
    {
      key: 'ANALYTICS',
      label: 'Análises',
      description: 'Performance, tendências, insights',
      icon: 'analytics-outline',
      color: '#F59E0B',
    },
    {
      key: 'SYSTEM',
      label: 'Sistema',
      description: 'Backup, atualizações, manutenção',
      icon: 'settings-outline',
      color: '#6B7280',
    },
  ];

  const renderCategorySettings = (category: typeof categories[0]) => {
    const categorySettings = settings[category.key];

    if (!categorySettings) {
      return null;
    }

    return (
      <View key={category.key} style={styles.categoryCard}>
        <View style={styles.categoryHeader}>
          <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
            <Ionicons name={category.icon as any} size={24} color={category.color} />
          </View>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryTitle}>{category.label}</Text>
            <Text style={styles.categoryDescription}>{category.description}</Text>
          </View>
        </View>

        <View style={styles.settingsList}>
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Ativar Notificações</Text>
              <Text style={styles.settingDescription}>Receber notificações desta categoria</Text>
            </View>
            <Switch
              value={categorySettings.enabled}
              onValueChange={(value) => handleToggle(category.key, 'enabled', value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>

          {categorySettings.enabled && (
            <>
              <View style={styles.settingItem}>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Notificações Push</Text>
                  <Text style={styles.settingDescription}>Alertas no dispositivo</Text>
                </View>
                <Switch
                  value={categorySettings.pushEnabled}
                  onValueChange={(value) => handleToggle(category.key, 'pushEnabled', value)}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Som</Text>
                  <Text style={styles.settingDescription}>Reproduzir som de notificação</Text>
                </View>
                <Switch
                  value={categorySettings.soundEnabled}
                  onValueChange={(value) => handleToggle(category.key, 'soundEnabled', value)}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Vibração</Text>
                  <Text style={styles.settingDescription}>Vibrar ao receber notificação</Text>
                </View>
                <Switch
                  value={categorySettings.vibrationEnabled}
                  onValueChange={(value) => handleToggle(category.key, 'vibrationEnabled', value)}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Agrupar Similares</Text>
                  <Text style={styles.settingDescription}>Combinar notificações do mesmo tipo</Text>
                </View>
                <Switch
                  value={categorySettings.groupSimilar}
                  onValueChange={(value) => handleToggle(category.key, 'groupSimilar', value)}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                />
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações de Notificações</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {categories.map(renderCategorySettings)}

        <View style={styles.smartSection}>
          <View style={styles.smartHeader}>
            <Ionicons name="bulb" size={24} color={theme.colors.warning} />
            <Text style={styles.smartTitle}>Análise Inteligente</Text>
          </View>
          <Text style={styles.smartDescription}>
            Execute análises automáticas para gerar alertas e insights personalizados baseados nos seus dados.
          </Text>
          <Button
            title="Executar Análise Agora"
            onPress={handleRunAnalysis}
            icon={<Ionicons name="flash" size={20} color={theme.colors.surface} />}
            style={styles.analyzeButton}
          />
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={theme.colors.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Sobre as Notificações:</Text>
            <Text style={styles.infoText}>
              • Notificações inteligentes baseadas em padrões{'\n'}
              • Priorização automática por urgência{'\n'}
              • Aprende com suas preferências{'\n'}
              • Evita notificações redundantes
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

  categoryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  categoryInfo: {
    flex: 1,
  },

  categoryTitle: {
    ...typography.body,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },

  categoryDescription: {
    ...typography.caption,
    color: theme.colors.textSecondary,
  },

  settingsList: {
    gap: spacing.md,
  },

  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  smartSection: {
    backgroundColor: `${theme.colors.warning}10`,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.warning,
  },

  smartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },

  smartTitle: {
    ...typography.h4,
    fontWeight: '700',
    color: theme.colors.warning,
  },

  smartDescription: {
    ...typography.body,
    color: theme.colors.text,
    marginBottom: spacing.md,
  },

  analyzeButton: {
    marginTop: spacing.sm,
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
