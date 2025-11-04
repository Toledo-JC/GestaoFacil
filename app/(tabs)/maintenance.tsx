import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../../components/layout';
import { usePreventiveMaintenance } from '../../hooks/usePreventiveMaintenance';
import { theme, typography, spacing } from '../../constants/theme';

export default function MaintenanceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { 
    duePreventives, 
    overduePreventives, 
    notifications,
    loadPreventives, 
    loadAlerts,
    loadNotifications,
    loading,
    refresh 
  } = usePreventiveMaintenance();

  useEffect(() => {
    loadPreventives();
    loadAlerts();
    loadNotifications();
  }, []);

  const menuItems = [
    { 
      key: 'preventives', 
      title: 'Preventivas', 
      icon: 'calendar-outline', 
      route: '/preventive-maintenances', 
      color: '#3B82F6',
      badge: duePreventives.length + overduePreventives.length
    },
    { 
      key: 'calendar', 
      title: 'Calendário', 
      icon: 'calendar', 
      route: '/maintenance-calendar', 
      color: '#8B5CF6' 
    },
    { 
      key: 'alerts', 
      title: 'Alertas', 
      icon: 'notifications-outline', 
      route: '/maintenance-alerts', 
      color: '#F59E0B',
      badge: notifications.length
    },
    { 
      key: 'templates', 
      title: 'Templates', 
      icon: 'copy-outline', 
      route: '/preventive-templates', 
      color: '#10B981' 
    },
    { 
      key: 'history', 
      title: 'Histórico', 
      icon: 'time-outline', 
      route: '/maintenance-history', 
      color: '#06B6D4' 
    },
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return '#EF4444';
      case 'HIGH': return '#F59E0B';
      case 'NORMAL': return '#3B82F6';
      default: return theme.colors.textTertiary;
    }
  };

  return (
    <Screen edges={['top']}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Manutenções</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/preventive-form')}
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
            'Próximas 7 Dias',
            duePreventives.length.toString(),
            'Preventivas agendadas',
            '#3B82F6'
          )}
          {renderKPI(
            'Atrasadas',
            overduePreventives.length.toString(),
            'Requer atenção',
            overduePreventives.length > 0 ? '#EF4444' : theme.colors.textSecondary
          )}
        </View>

        <View style={styles.kpiContainer}>
          {renderKPI(
            'Alertas Pendentes',
            notifications.length.toString(),
            'Notificações',
            notifications.length > 0 ? '#F59E0B' : theme.colors.textSecondary
          )}
          {renderKPI(
            'Este Mês',
            '0',
            'Executadas',
            '#10B981'
          )}
        </View>

        {/* Overdue Preventives Alert */}
        {overduePreventives.length > 0 && (
          <View style={styles.alertContainer}>
            <View style={styles.alertHeader}>
              <Text style={styles.alertHeaderTitle}>
                <Ionicons name="warning" size={16} color="#EF4444" /> Preventivas Atrasadas
              </Text>
              <TouchableOpacity onPress={() => router.push('/preventive-maintenances')}>
                <Text style={styles.viewAllText}>Ver Todas</Text>
              </TouchableOpacity>
            </View>
            {overduePreventives.slice(0, 3).map(preventive => (
              <TouchableOpacity
                key={preventive.id}
                style={styles.preventiveCard}
                onPress={() => router.push(`/preventive-detail?id=${preventive.id}` as any)}
              >
                <View style={styles.preventiveHeader}>
                  <Text style={styles.preventiveTitle} numberOfLines={1}>
                    {preventive.title}
                  </Text>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(preventive.priority) }]}>
                    <Text style={styles.priorityText}>{preventive.priority}</Text>
                  </View>
                </View>
                <Text style={styles.preventiveDate}>
                  <Ionicons name="calendar" size={12} color="#EF4444" /> Venceu em: {preventive.nextExecutionDate}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Menu */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Gestão de Manutenções</Text>
          {menuItems.map(renderMenuItem)}
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

  preventiveCard: {
    backgroundColor: '#FEE2E2',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },

  preventiveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  preventiveTitle: {
    ...typography.body,
    fontWeight: '600',
    color: '#EF4444',
    flex: 1,
  },

  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: spacing.xs,
  },

  priorityText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  preventiveDate: {
    ...typography.caption,
    color: '#EF4444',
    fontSize: 11,
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
