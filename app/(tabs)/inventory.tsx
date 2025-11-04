
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../../components/layout';
import { useInventory } from '../../hooks/useInventory';
import { theme, typography, spacing } from '../../constants/theme';
import { formatCurrency } from '../../utils/format';

export default function InventoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { summary, alerts, loadSummary, loadAlerts, loading, refresh } = useInventory();

  useEffect(() => {
    loadSummary();
    loadAlerts();
  }, []);

  const menuItems = [
    { key: 'products', title: 'Produtos', icon: 'cube-outline', route: '/products', color: '#3B82F6' },
    { key: 'movements', title: 'Movimentações', icon: 'swap-horizontal-outline', route: '/stock-movements', color: '#8B5CF6' },
    { key: 'alerts', title: 'Alertas', icon: 'notifications-outline', route: '/stock-alerts', color: '#F59E0B', badge: alerts.length },
    { key: 'suppliers', title: 'Fornecedores', icon: 'business-outline', route: '/suppliers', color: '#10B981' },
    { key: 'categories', title: 'Categorias', icon: 'file-tray-stacked-outline', route: '/categories', color: '#06B6D4' },
    { key: 'inventory', title: 'Inventário', icon: 'clipboard-outline', route: '/inventory-management', color: '#EC4899' },
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
        {item.badge && item.badge > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.menuTitle}>{item.title}</Text>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
    </TouchableOpacity>
  );

  const getAlertColor = (severity: string) => { // Moved inside the component and converted to const
    switch (severity) {
      case 'CRITICAL': return '#FEE2E2';
      case 'WARNING': return '#FEF3C7';
      default: return '#DBEAFE';
    }
  };

  return (
    <Screen edges={['top']}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Estoque</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/product-form')}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color={theme.colors.surface} />
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
        {/* KPIs */}
        <View style={styles.kpiContainer}>
          {renderKPI(
            'Total de Produtos',
            summary?.totalProducts.toString() || '0',
            `${summary?.activeProducts || 0} ativos`,
            theme.colors.primary
          )}
          {renderKPI(
            'Valor do Estoque',
            formatCurrency(summary?.totalStockValue || 0),
            'Custo médio',
            '#10B981'
          )}
        </View>

        <View style={styles.kpiContainer}>
          {renderKPI(
            'Estoque Baixo',
            summary?.lowStockProducts.toString() || '0',
            'Atenção necessária',
            summary && summary.lowStockProducts > 0 ? '#F59E0B' : theme.colors.textSecondary
          )}
          {renderKPI(
            'Sem Estoque',
            summary?.outOfStockProducts.toString() || '0',
            'Requer reposição',
            summary && summary.outOfStockProducts > 0 ? '#EF4444' : theme.colors.textSecondary
          )}
        </View>

        {/* Alerts */}
        {alerts.length > 0 && (
          <View style={styles.alertContainer}>
            <View style={styles.alertHeader}>
              <Text style={styles.alertHeaderTitle}>
                <Ionicons name="warning" size={16} color="#F59E0B" /> Alertas Pendentes
              </Text>
              <TouchableOpacity onPress={() => router.push('/stock-alerts')}>
                <Text style={styles.viewAllText}>Ver Todos</Text>
              </TouchableOpacity>
            </View>
            {alerts.slice(0, 3).map(alert => (
              <View key={alert.id} style={[styles.alert, { backgroundColor: getAlertColor(alert.severity) }]}>
                <Ionicons 
                  name={alert.severity === 'CRITICAL' ? 'alert-circle' : 'warning'} 
                  size={18} 
                  color={alert.severity === 'CRITICAL' ? '#EF4444' : '#F59E0B'} 
                />
                <Text style={[styles.alertText, { color: alert.severity === 'CRITICAL' ? '#EF4444' : '#F59E0B' }]}>
                  {alert.message}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Menu */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Gestão de Estoque</Text>
          {menuItems.map(renderMenuItem)}
        </View>
      </ScrollView>
    </Screen>
  );
} // Closing brace for InventoryScreen function

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
  },

  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  alertHeaderTitle: {
    ...typography.body,
    fontWeight: '600',
    color: theme.colors.text,
  },

  viewAllText: {
    ...typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },

  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.xs,
    gap: spacing.xs,
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
    position: 'relative',
  },

  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
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

  menuTitle: {
    ...typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    flex: 1,
  },
});
