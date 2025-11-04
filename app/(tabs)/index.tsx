import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../../components/layout';
import { KPICard } from '../../components/dashboard';
import { useDashboard } from '../../hooks/useDashboard';
import { usePreventiveMaintenance } from '../../hooks/usePreventiveMaintenance';
import { useInventory } from '../../hooks/useInventory';
import { theme, typography, spacing } from '../../constants/theme';
import { formatCurrency } from '../../utils/format';

const { width } = Dimensions.get('window');
const cardWidth = Math.max(1, (width - spacing.lg * 3) / 2);

export default function MainDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { metrics, revenueChart, loading, refresh } = useDashboard();
  const { overduePreventives, duePreventives } = usePreventiveMaintenance();
  const { alerts } = useInventory();

  useEffect(() => {
    refresh();
  }, []);

  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && !a.acknowledged);
  const totalAlerts = overduePreventives.length + criticalAlerts.length;

  return (
    <Screen edges={['top']}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Visão geral do negócio</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => router.push('/maintenance-alerts' as any)}
        >
          <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
          {totalAlerts > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalAlerts}</Text>
            </View>
          )}
        </TouchableOpacity>
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
        {/* Critical Alerts */}
        {totalAlerts > 0 && (
          <TouchableOpacity
            style={styles.alertBanner}
            onPress={() => router.push('/maintenance-alerts' as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="warning" size={20} color="#FFFFFF" />
            <Text style={styles.alertText}>
              {totalAlerts} {totalAlerts === 1 ? 'alerta crítico' : 'alertas críticos'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* Financial KPIs */}
        <Text style={styles.sectionTitle}>Financeiro</Text>
        <View style={styles.kpiRow}>
          <View style={{ width: cardWidth }}>
            <KPICard
              title="Faturamento Mês"
              value={formatCurrency(metrics?.financial.monthRevenue || 0)}
              subtitle="Este mês"
              icon="cash-outline"
              color="#10B981"
              growth={metrics?.financial.revenueGrowth}
              trend={
                (metrics?.financial.revenueGrowth || 0) > 0 ? 'up' :
                (metrics?.financial.revenueGrowth || 0) < 0 ? 'down' : 'neutral'
              }
            />
          </View>
          <View style={{ width: cardWidth }}>
            <KPICard
              title="Lucro Mês"
              value={formatCurrency(metrics?.financial.monthProfit || 0)}
              subtitle="Este mês"
              icon="trending-up"
              color="#3B82F6"
              growth={metrics?.financial.profitGrowth}
              trend={
                (metrics?.financial.profitGrowth || 0) > 0 ? 'up' :
                (metrics?.financial.profitGrowth || 0) < 0 ? 'down' : 'neutral'
              }
            />
          </View>
        </View>

        <View style={styles.kpiRow}>
          <View style={{ width: cardWidth }}>
            <KPICard
              title="A Receber"
              value={formatCurrency(metrics?.financial.pendingReceivables || 0)}
              subtitle="Pendente"
              icon="time-outline"
              color="#F59E0B"
            />
          </View>
          <View style={{ width: cardWidth }}>
            <KPICard
              title="Ticket Médio"
              value={formatCurrency(metrics?.financial.averageTicket || 0)}
              subtitle="Por ordem"
              icon="calculator-outline"
              color="#8B5CF6"
            />
          </View>
        </View>

        {/* Operational KPIs */}
        <Text style={styles.sectionTitle}>Operacional</Text>
        <View style={styles.kpiRow}>
          <View style={{ width: cardWidth }}>
            <KPICard
              title="OSs Concluídas"
              value={metrics?.operational.completedOrders.toString() || '0'}
              subtitle="Total"
              icon="checkmark-done-outline"
              color="#10B981"
            />
          </View>
          <View style={{ width: cardWidth }}>
            <KPICard
              title="OSs em Andamento"
              value={metrics?.operational.inProgressOrders.toString() || '0'}
              subtitle="Ativas"
              icon="construct-outline"
              color="#3B82F6"
            />
          </View>
        </View>

        <View style={styles.kpiRow}>
          <View style={{ width: cardWidth }}>
            <KPICard
              title="Eficiência"
              value={`${(metrics?.operational.efficiency || 0).toFixed(0)}%`}
              subtitle="Tempo estimado"
              icon="speedometer-outline"
              color="#06B6D4"
            />
          </View>
          <View style={{ width: cardWidth }}>
            <KPICard
              title="Pontualidade"
              value={`${(metrics?.operational.onTimeDelivery || 0).toFixed(0)}%`}
              subtitle="Entregas no prazo"
              icon="time-outline"
              color="#8B5CF6"
            />
          </View>
        </View>

        {/* Client KPIs */}
        <Text style={styles.sectionTitle}>Clientes</Text>
        <View style={styles.kpiRow}>
          <View style={{ width: cardWidth }}>
            <KPICard
              title="Total Clientes"
              value={metrics?.clients.totalClients.toString() || '0'}
              subtitle={`${metrics?.clients.newClients || 0} novos este mês`}
              icon="people-outline"
              color="#10B981"
              growth={metrics?.clients.clientGrowth}
              trend={
                (metrics?.clients.clientGrowth || 0) > 0 ? 'up' :
                (metrics?.clients.clientGrowth || 0) < 0 ? 'down' : 'neutral'
              }
            />
          </View>
          <View style={{ width: cardWidth }}>
            <KPICard
              title="Retenção"
              value={`${(metrics?.clients.retentionRate || 0).toFixed(0)}%`}
              subtitle="Últimos 90 dias"
              icon="heart-outline"
              color="#EF4444"
            />
          </View>
        </View>

        <View style={styles.kpiRow}>
          <View style={{ width: cardWidth }}>
            <KPICard
              title="Satisfação"
              value={`${(metrics?.clients.averageSatisfaction || 0).toFixed(1)}/5`}
              subtitle="Avaliação média"
              icon="star-outline"
              color="#F59E0B"
            />
          </View>
          <View style={{ width: cardWidth }}>
            <KPICard
              title="Clientes Ativos"
              value={metrics?.clients.activeClients.toString() || '0'}
              subtitle="Com compras"
              icon="trending-up"
              color="#3B82F6"
            />
          </View>
        </View>

        {/* Inventory & Team */}
        <View style={styles.kpiRow}>
          <View style={{ width: cardWidth }}>
            <KPICard
              title="Estoque"
              value={formatCurrency(metrics?.inventory.stockValue || 0)}
              subtitle={`${metrics?.inventory.lowStockItems || 0} itens baixos`}
              icon="cube-outline"
              color="#8B5CF6"
            />
          </View>
          <View style={{ width: cardWidth }}>
            <KPICard
              title="Equipe"
              value={metrics?.team.activeCollaborators.toString() || '0'}
              subtitle={`${formatCurrency(metrics?.team.pendingCommissions || 0)} pendente`}
              icon="people"
              color="#06B6D4"
            />
          </View>
        </View>

        {/* Preventivas Upcoming */}
        {duePreventives.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Preventivas Próximas</Text>
              <TouchableOpacity onPress={() => router.push('/maintenance')}>
                <Text style={styles.viewAllText}>Ver Todas</Text>
              </TouchableOpacity>
            </View>
            {duePreventives.slice(0, 3).map(preventive => (
              <TouchableOpacity
                key={preventive.id}
                style={styles.preventiveCard}
                onPress={() => router.push(`/preventive-detail?id=${preventive.id}` as any)}
              >
                <View style={styles.preventiveHeader}>
                  <Ionicons name="calendar" size={16} color={theme.colors.primary} />
                  <Text style={styles.preventiveTitle} numberOfLines={1}>
                    {preventive.title}
                  </Text>
                </View>
                <Text style={styles.preventiveDate}>
                  {preventive.nextExecutionDate}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/client-form')}
          >
            <Ionicons name="person-add" size={24} color="#10B981" />
            <Text style={styles.actionText}>Novo Cliente</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/os-form' as any)}
          >
            <Ionicons name="document-text" size={24} color="#3B82F6" />
            <Text style={styles.actionText}>Nova OS</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/financial-dashboard' as any)}
          >
            <Ionicons name="bar-chart" size={24} color="#F59E0B" />
            <Text style={styles.actionText}>Relatórios</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/inventory')}
          >
            <Ionicons name="cube" size={24} color="#8B5CF6" />
            <Text style={styles.actionText}>Estoque</Text>
          </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerTitle: {
    ...typography.h2,
    color: theme.colors.text,
    fontWeight: '700',
  },

  headerSubtitle: {
    ...typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },

  badgeText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  content: {
    padding: spacing.lg,
  },

  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },

  alertText: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },

  sectionTitle: {
    ...typography.h4,
    color: theme.colors.text,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },

  viewAllText: {
    ...typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },

  kpiRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.md,
  },

  preventiveCard: {
    backgroundColor: theme.colors.surface,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  preventiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },

  preventiveTitle: {
    ...typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },

  preventiveDate: {
    ...typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 11,
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },

  actionButton: {
    width: cardWidth,
    backgroundColor: theme.colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  actionText: {
    ...typography.caption,
    color: theme.colors.text,
    fontWeight: '600',
  },
});
