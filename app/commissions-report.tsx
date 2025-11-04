import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Screen } from '../components/layout';
import { spacing, borderRadius, typography } from '../constants/theme';

export default function CommissionsReportScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // TODO: Implement actual commission report logic

  return (
    <Screen edges={['top', 'bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Relatório de Comissões',
          headerBackTitle: 'Voltar',
        }}
      />

      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Filtros
            </Text>

            <View style={styles.periodButtons}>
              {[
                { id: 'month', label: 'Este Mês' },
                { id: 'quarter', label: 'Trimestre' },
                { id: 'year', label: 'Ano' },
                { id: 'custom', label: 'Personalizado' },
              ].map(period => (
                <TouchableOpacity
                  key={period.id}
                  style={[
                    styles.periodButton,
                    {
                      backgroundColor:
                        selectedPeriod === period.id
                          ? theme.colors.primary
                          : theme.colors.background,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => setSelectedPeriod(period.id)}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      {
                        color:
                          selectedPeriod === period.id
                            ? '#fff'
                            : theme.colors.text,
                      },
                    ]}
                  >
                    {period.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Resumo Geral
            </Text>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
                  0
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                  Colaboradores
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
                  R$ 0,00
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                  Total Pago
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: theme.colors.warning }]}>
                  R$ 0,00
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                  Pendente
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                  0
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                  Serviços
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="document-text-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              Em Desenvolvimento
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              O relatório detalhado de comissões estará disponível em breve.
            </Text>
          </View>
        </ScrollView>
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
    gap: spacing.md,
  },

  section: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
  },

  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },

  periodButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  periodButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },

  periodButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },

  summaryItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },

  summaryValue: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },

  summaryLabel: {
    ...typography.caption,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    borderRadius: borderRadius.md,
  },

  emptyTitle: {
    ...typography.h2,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  emptySubtitle: {
    ...typography.body,
    textAlign: 'center',
  },
});
