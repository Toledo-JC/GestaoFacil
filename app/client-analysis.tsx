import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/layout';
import { useSearch } from '../hooks/useSearch';
import { theme, typography, spacing } from '../constants/theme';

export default function ClientAnalysisScreen() {
  const router = useRouter();
  const { clientAnalysis, generateClientAnalysis, loading } = useSearch();

  const [period, setPeriod] = useState<'30' | '90' | '180' | '365'>('30');

  const handleGenerate = async () => {
    const now = new Date();
    const startDate = new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000);
    await generateClientAnalysis(startDate.toISOString(), now.toISOString());
  };

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Análise de Clientes</Text>
        <TouchableOpacity onPress={() => {}}>
          <Ionicons name="download-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.periodSelector}>
          <Text style={styles.periodLabel}>Período:</Text>
          <View style={styles.periodButtons}>
            {['30', '90', '180', '365'].map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.periodButton, period === p && styles.periodButtonActive]}
                onPress={() => setPeriod(p as any)}
              >
                <Text style={[styles.periodButtonText, period === p && styles.periodButtonTextActive]}>
                  {p === '365' ? '1 ano' : `${p} dias`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.generateButton} onPress={handleGenerate} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={theme.colors.surface} />
          ) : (
            <>
              <Ionicons name="analytics" size={20} color={theme.colors.surface} />
              <Text style={styles.generateButtonText}>Gerar Relatório</Text>
            </>
          )}
        </TouchableOpacity>

        {clientAnalysis && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top 10 Clientes</Text>
              {clientAnalysis.topClients.map((client, index) => (
                <View key={client.clientId} style={styles.clientCard}>
                  <View style={styles.clientRank}>
                    <Text style={styles.clientRankText}>#{index + 1}</Text>
                  </View>
                  <View style={styles.clientInfo}>
                    <Text style={styles.clientName}>{client.clientName}</Text>
                    <View style={styles.clientMetrics}>
                      <Text style={styles.clientMetric}>
                        R$ {client.totalRevenue.toFixed(2)} • {client.totalOrders} OSs
                      </Text>
                      <Text style={styles.clientMetric}>
                        Ticket: R$ {client.averageTicket.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Retenção de Clientes</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{clientAnalysis.clientRetention.totalClients}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={[styles.statValue, { color: theme.colors.success }]}>
                    {clientAnalysis.clientRetention.activeClients}
                  </Text>
                  <Text style={styles.statLabel}>Ativos</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={[styles.statValue, { color: theme.colors.warning }]}>
                    {clientAnalysis.clientRetention.retentionRate.toFixed(1)}%
                  </Text>
                  <Text style={styles.statLabel}>Retenção</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={[styles.statValue, { color: theme.colors.info }]}>
                    {clientAnalysis.clientRetention.newClients}
                  </Text>
                  <Text style={styles.statLabel}>Novos</Text>
                </View>
              </View>
            </View>

            {clientAnalysis.riskClients.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Clientes em Risco</Text>
                {clientAnalysis.riskClients.map(client => (
                  <View key={client.clientId} style={styles.riskCard}>
                    <Ionicons name="warning" size={24} color={theme.colors.warning} />
                    <View style={styles.riskInfo}>
                      <Text style={styles.riskName}>{client.clientName}</Text>
                      <Text style={styles.riskReason}>{client.reason}</Text>
                      <Text style={styles.riskDays}>{client.daysSinceLastOrder} dias sem pedidos</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
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

  backButton: { padding: 4 },

  headerTitle: {
    ...typography.h3,
    color: theme.colors.text,
  },

  content: {
    padding: spacing.lg,
  },

  periodSelector: {
    marginBottom: spacing.lg,
  },

  periodLabel: {
    ...typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: spacing.sm,
  },

  periodButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },

  periodButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },

  periodButtonText: {
    ...typography.caption,
    fontWeight: '600',
    color: theme.colors.text,
  },

  periodButtonTextActive: {
    color: theme.colors.surface,
  },

  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },

  generateButtonText: {
    ...typography.body,
    fontWeight: '700',
    color: theme.colors.surface,
  },

  section: {
    marginBottom: spacing.xl,
  },

  sectionTitle: {
    ...typography.h4,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: spacing.md,
  },

  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  clientRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  clientRankText: {
    ...typography.caption,
    fontWeight: '700',
    color: theme.colors.primary,
  },

  clientInfo: {
    flex: 1,
  },

  clientName: {
    ...typography.body,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },

  clientMetrics: {
    gap: 2,
  },

  clientMetric: {
    ...typography.caption,
    color: theme.colors.textSecondary,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },

  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  statValue: {
    ...typography.h2,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },

  statLabel: {
    ...typography.caption,
    color: theme.colors.textSecondary,
  },

  riskCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${theme.colors.warning}10`,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.warning,
    gap: spacing.md,
  },

  riskInfo: {
    flex: 1,
  },

  riskName: {
    ...typography.body,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },

  riskReason: {
    ...typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },

  riskDays: {
    ...typography.caption,
    fontWeight: '600',
    color: theme.colors.warning,
  },
});
