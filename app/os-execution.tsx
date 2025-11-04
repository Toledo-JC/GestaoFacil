import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../components/layout';
import { Button } from '../components/ui';
import { theme, typography, spacing } from '../constants/theme';

export default function OSExecutionScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'checklist' | 'photos' | 'report'>('checklist');

  const handleComplete = () => {
    Alert.alert(
      'Concluir OS',
      'Deseja marcar esta OS como concluída?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Concluir',
          onPress: () => {
            Alert.alert('Sucesso', 'OS concluída com sucesso');
            router.back();
          },
        },
      ]
    );
  };

  return (
    <Screen edges={['top']}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Execução da OS</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'checklist' && styles.tabActive]}
          onPress={() => setActiveTab('checklist')}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color={activeTab === 'checklist' ? theme.colors.primary : theme.colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'checklist' && styles.tabTextActive]}>
            Checklist
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'photos' && styles.tabActive]}
          onPress={() => setActiveTab('photos')}
        >
          <Ionicons
            name="camera-outline"
            size={20}
            color={activeTab === 'photos' ? theme.colors.primary : theme.colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'photos' && styles.tabTextActive]}>
            Fotos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'report' && styles.tabActive]}
          onPress={() => setActiveTab('report')}
        >
          <Ionicons
            name="document-text-outline"
            size={20}
            color={activeTab === 'report' ? theme.colors.primary : theme.colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'report' && styles.tabTextActive]}>
            Relatório
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.comingSoon}>
          <Ionicons name="construct-outline" size={64} color={theme.colors.textSecondary} />
          <Text style={styles.comingSoonTitle}>Funcionalidade em Desenvolvimento</Text>
          <Text style={styles.comingSoonText}>
            O módulo de execução de OSs incluirá:
          </Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.featureText}>Checklist de atividades por tipo de serviço</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.featureText}>Registro de horas trabalhadas</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.featureText}>Upload de fotos (antes/durante/depois)</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.featureText}>Relatório técnico detalhado</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.featureText}>Captura de assinatura digital</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.featureText}>Registro de garantia</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Voltar" onPress={() => router.back()} fullWidth />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  backButton: {
    padding: spacing.xs,
  },

  headerTitle: {
    ...typography.h3,
    color: theme.colors.text,
    fontWeight: '700',
  },

  tabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },

  tabActive: {
    borderBottomColor: theme.colors.primary,
  },

  tabText: {
    ...typography.body,
    color: theme.colors.textSecondary,
  },

  tabTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },

  content: {
    padding: spacing.lg,
  },

  comingSoon: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },

  comingSoonTitle: {
    ...typography.h3,
    color: theme.colors.text,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },

  comingSoonText: {
    ...typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },

  featureList: {
    width: '100%',
    gap: spacing.md,
  },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: theme.colors.surface,
    padding: spacing.md,
    borderRadius: 12,
  },

  featureText: {
    ...typography.body,
    color: theme.colors.text,
    flex: 1,
  },

  footer: {
    padding: spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});
