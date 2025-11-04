import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../components/layout';
import { Button, Input } from '../components/ui';
import { theme, typography, spacing } from '../constants/theme';

export default function BudgetFormScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    Alert.alert('Em Desenvolvimento', 'Funcionalidade de orçamento será implementada em breve');
    router.back();
  };

  return (
    <Screen edges={['top']}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Orçamento</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.comingSoon}>
          <Ionicons name="document-text-outline" size={64} color={theme.colors.textSecondary} />
          <Text style={styles.comingSoonTitle}>Funcionalidade em Desenvolvimento</Text>
          <Text style={styles.comingSoonText}>
            O módulo completo de orçamentos está sendo desenvolvido e incluirá:
          </Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.featureText}>Seleção de cliente e equipamento</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.featureText}>Lista de itens e serviços</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.featureText}>Cálculo automático de valores</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.featureText}>Geração de PDF profissional</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.featureText}>Envio por WhatsApp</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.featureText}>Conversão automática para OS</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Voltar"
          onPress={() => router.back()}
          fullWidth
        />
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

  content: {
    padding: spacing.lg,
  },

  comingSoon: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
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
