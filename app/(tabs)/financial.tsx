import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../../components/layout';
import { useFinancial } from '../../hooks/useFinancial';
import { theme, typography, spacing } from '../../constants/theme';
import { formatCurrency } from '../../utils/format';

export default function FinancialScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { summary, monthlyReports, loadReports, loading, refresh } = useFinancial();

  useEffect(() => {
    loadReports();
  }, []);

  const menuItems = [
    { key: 'receivables', title: 'Contas a Receber', icon: 'cash-outline', route: '/accounts-receivable', color: '#10B981' },
    { key: 'payables', title: 'Contas a Pagar', icon: 'card-outline', route: '/accounts-payable', color: '#EF4444' },
    { key: 'cashflow', title: 'Fluxo de Caixa', icon: 'trending-up-outline', route: '/cash-flow', color: '#3B82F6' },
    { key: 'accounts', title: 'Contas Bancárias', icon: 'wallet-outline', route: '/bank-accounts', color: '#8B5CF6' },
    { key: 'reports', title: 'Relatórios', icon: 'bar-chart-outline', route: '/financial-reports', color: '#F59E0B' },
    { key: 'commissions', title: 'Comissões', icon: 'people-outline', route: '/commissions-report', color: '#06B6D4' },
  ];

  const renderKPI = (title: string, value: string, subtitle?: string, color?: string) => (
    <View style={styles.kpiCard}>
      <Text style={styles.kpiTitle}>{title}</Text>
      <Text style={[styles.kpiValue, color && { color }]}>{value}</Text>
      {subtitle && <Text style={styles.kpiSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderMenuItem = (item: typeof menuItems[0]) => (
    <TouchableOpacity
      key={item.key}
      style={styles.menuItem}
      onPress={() => router.push(item.route as any)}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}20` }]}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
      </View>
      <Text style={styles.menuTitle}>{item.title}</Text>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <Screen edges={['top']}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Financeiro</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* KPIs */}
        <View style={styles.kpiContainer}>
          {renderKPI(
            'Saldo Total',
            formatCurrency(summary?.totalBalance || 0),
            'Em contas bancárias',
            theme.colors.primary
          )}
          {renderKPI(
            'Lucro do Mês',
            formatCurrency(summary?.monthProfit || 0),
            `${summary?.monthRevenue ? ((summary.monthProfit / summary.monthRevenue) * 100).toFixed(1) : 0}% margem`,
            summary && summary.monthProfit >= 0 ? '#10B981' : '#EF4444'
          )}
        </View>

        <View style={styles.kpiContainer}>
          {renderKPI(
            'Receitas do Mês',
            formatCurrency(summary?.monthRevenue || 0),
            undefined,
            '#10B981'
          )}
          {renderKPI(
            'Despesas do Mês',
            formatCurrency(summary?.monthExpenses || 0),
            undefined,
            '#EF4444'
          )}
        </View>

        {/* Alerts */}
        {summary && (summary.overdueReceivables > 0 || summary.overduePayables > 0) && (
          <View style={styles.alertContainer}>
            {summary.overdueReceivables > 0 && (
              <View style={[styles.alert, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="warning" size={20} color="#F59E0B" />
                <Text style={[styles.alertText, { color: '#F59E0B' }]}>
                  {formatCurrency(summary.overdueReceivables)} em atraso para receber
                </Text>
              </View>
            )}
            {summary.overduePayables > 0 && (
              <View style={[styles.alert, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="alert-circle" size={20} color="#EF4444" />
                <Text style={[styles.alertText, { color: '#EF4444' }]}>
                  {formatCurrency(summary.overduePayables)} em atraso para pagar
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Menu */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Gestão Financeira</Text>
          {menuItems.map(renderMenuItem)}
        </View>

        {/* Monthly Chart Preview */}
        {monthlyReports.length > 0 && (
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.sectionTitle}>Últimos 6 Meses</Text>
              <TouchableOpacity onPress={() => router.push('/financial-reports')}>
                <Text style={styles.viewAllText}>Ver Relatórios</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.chartContent}>
              {monthlyReports.map((report, index) => (
                <View key={index} style={styles.chartMonth}>
                  <View style={styles.chartBars}>
                    <View
                      style={[
                        styles.chartBar,
                        styles.chartBarRevenue,
                        { height: Math.max((report.revenue / 10000) * 80, 10) },
                      ]}
                    />
                    <View
                      style={[
                        styles.chartBar,
                        styles.chartBarExpense,
                        { height: Math.max((report.expenses / 10000) * 80, 10) },
                      ]}
                    />
                  </View>
                  <Text style={styles.chartMonthLabel}>{report.month}</Text>
                </View>
              ))}
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.legendText}>Receitas</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.legendText}>Despesas</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  headerTitle: {
    ...typography.h2,
    color: theme.colors.text,
  },

  content: {
    padding: spacing.lg,
  },

  kpiContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.md,
  },

  kpiCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  kpiTitle: {
    ...typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: spacing.xs,
  },

  kpiValue: {
    ...typography.h3,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: 2,
  },

  kpiSubtitle: {
    ...typography.caption,
    color: theme.colors.textTertiary,
    fontSize: 11,
  },

  alertContainer: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },

  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
  },

  alertText: {
    ...typography.caption,
    fontWeight: '600',
    flex: 1,
  },

  menuContainer: {
    marginBottom: spacing.lg,
  },

  sectionTitle: {
    ...typography.h4,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: spacing.md,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  menuTitle: {
    ...typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    flex: 1,
  },

  chartContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  viewAllText: {
    ...typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },

  chartContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: spacing.md,
  },

  chartMonth: {
    alignItems: 'center',
    flex: 1,
  },

  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    marginBottom: spacing.xs,
  },

  chartBar: {
    width: 8,
    borderRadius: 4,
    minHeight: 10,
  },

  chartBarRevenue: {
    backgroundColor: '#10B981',
  },

  chartBarExpense: {
    backgroundColor: '#EF4444',
  },

  chartMonthLabel: {
    ...typography.caption,
    color: theme.colors.textTertiary,
    fontSize: 10,
  },

  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  legendText: {
    ...typography.caption,
    color: theme.colors.textSecondary,
  },
});
