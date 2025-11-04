import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../components/layout';
import { NotificationBadge } from '../components/notification';
import { useNotifications } from '../hooks/useNotifications';
import { Notification, NotificationCategory } from '../types';
import { theme, typography, spacing } from '../constants/theme';
import { formatDateTime } from '../utils/format';

export default function NotificationCenterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    notifications,
    summary,
    loading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    snoozeNotification,
    archiveNotification,
    deleteNotification,
  } = useNotifications();

  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | 'ALL'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  }, [refreshNotifications]);

  const filteredNotifications = selectedCategory === 'ALL'
    ? notifications
    : notifications.filter(n => n.category === selectedCategory);

  const categories: Array<{ key: NotificationCategory | 'ALL'; label: string; icon: string }> = [
    { key: 'ALL', label: 'Todas', icon: 'list' },
    { key: 'FINANCIAL', label: 'Financeiro', icon: 'cash-outline' },
    { key: 'OPERATIONAL', label: 'Operacional', icon: 'build-outline' },
    { key: 'CLIENT', label: 'Clientes', icon: 'people-outline' },
    { key: 'ANALYTICS', label: 'Análises', icon: 'analytics-outline' },
    { key: 'SYSTEM', label: 'Sistema', icon: 'settings-outline' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return theme.colors.error;
      case 'HIGH': return theme.colors.warning;
      case 'NORMAL': return theme.colors.info;
      case 'LOW': return theme.colors.textTertiary;
      default: return theme.colors.textSecondary;
    }
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'FINANCIAL': return 'cash-outline';
      case 'OPERATIONAL': return 'build-outline';
      case 'CLIENT': return 'people-outline';
      case 'ANALYTICS': return 'analytics-outline';
      case 'SYSTEM': return 'settings-outline';
      default: return 'notifications-outline';
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (notification.status === 'PENDING') {
      await markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl as any);
    }
  };

  const handleSnooze = (notification: Notification) => {
    Alert.alert(
      'Adiar Notificação',
      'Por quanto tempo deseja adiar?',
      [
        { text: '1 hora', onPress: () => snoozeNotification(notification.id, 1) },
        { text: '3 horas', onPress: () => snoozeNotification(notification.id, 3) },
        { text: '1 dia', onPress: () => snoozeNotification(notification.id, 24) },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const handleDelete = (notification: Notification) => {
    Alert.alert(
      'Excluir Notificação',
      'Deseja realmente excluir esta notificação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => deleteNotification(notification.id) },
      ]
    );
  };

  const renderNotification = (notification: Notification) => (
    <TouchableOpacity
      key={notification.id}
      style={[
        styles.notificationCard,
        notification.status === 'READ' && styles.notificationCardRead,
      ]}
      onPress={() => handleNotificationPress(notification)}
      activeOpacity={0.7}
    >
      <View style={[styles.priorityBar, { backgroundColor: getPriorityColor(notification.priority) }]} />
      
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={[styles.categoryIcon, { backgroundColor: `${getPriorityColor(notification.priority)}20` }]}>
            <Ionicons 
              name={getCategoryIcon(notification.category) as any} 
              size={20} 
              color={getPriorityColor(notification.priority)} 
            />
          </View>

          <View style={styles.notificationInfo}>
            <Text style={[styles.notificationTitle, notification.status === 'PENDING' && styles.unreadTitle]}>
              {notification.title}
            </Text>
            <Text style={styles.notificationTime}>{formatDateTime(notification.createdAt)}</Text>
          </View>

          {notification.status === 'PENDING' && (
            <View style={styles.unreadDot} />
          )}
        </View>

        <Text style={styles.notificationMessage}>{notification.message}</Text>

        {notification.actionLabel && (
          <Text style={styles.actionLabel}>
            {notification.actionLabel} →
          </Text>
        )}

        <View style={styles.notificationActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSnooze(notification)}
          >
            <Ionicons name="time-outline" size={18} color={theme.colors.textSecondary} />
            <Text style={styles.actionButtonText}>Adiar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => archiveNotification(notification.id)}
          >
            <Ionicons name="archive-outline" size={18} color={theme.colors.textSecondary} />
            <Text style={styles.actionButtonText}>Arquivar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(notification)}
          >
            <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
            <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen edges={['top']}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notificações</Text>
          <TouchableOpacity onPress={() => router.push('/notification-settings' as any)}>
            <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {summary && (
          <View style={styles.summaryBar}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{summary.unread}</Text>
              <Text style={styles.summaryLabel}>Não Lidas</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: theme.colors.error }]}>{summary.urgent}</Text>
              <Text style={styles.summaryLabel}>Urgentes</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{summary.snoozed}</Text>
              <Text style={styles.summaryLabel}>Adiadas</Text>
            </View>
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilter}
          contentContainerStyle={styles.categoryFilterContent}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryChip,
                selectedCategory === category.key && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category.key)}
            >
              <Ionicons
                name={category.icon as any}
                size={16}
                color={selectedCategory === category.key ? theme.colors.primary : theme.colors.textSecondary}
              />
              <Text style={[
                styles.categoryChipText,
                selectedCategory === category.key && styles.categoryChipTextActive,
              ]}>
                {category.label}
              </Text>
              {category.key !== 'ALL' && summary && summary.byCategory[category.key as NotificationCategory] > 0 && (
                <NotificationBadge count={summary.byCategory[category.key as NotificationCategory]} size="small" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filteredNotifications.length > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={() => markAllAsRead(selectedCategory === 'ALL' ? undefined : selectedCategory)}
          >
            <Text style={styles.markAllText}>Marcar todas como lidas</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color={theme.colors.textTertiary} />
            <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
            <Text style={styles.emptyDescription}>
              Você está em dia! Não há notificações para exibir.
            </Text>
          </View>
        ) : (
          filteredNotifications.map(renderNotification)
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: spacing.md,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },

  headerTitle: {
    ...typography.h3,
    color: theme.colors.text,
  },

  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: theme.colors.background,
    marginHorizontal: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.md,
  },

  summaryItem: {
    alignItems: 'center',
  },

  summaryValue: {
    ...typography.h3,
    color: theme.colors.primary,
    fontWeight: '700',
  },

  summaryLabel: {
    ...typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  summaryDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },

  categoryFilter: {
    marginBottom: spacing.sm,
  },

  categoryFilterContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },

  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: spacing.xs,
  },

  categoryChipActive: {
    backgroundColor: `${theme.colors.primary}20`,
    borderColor: theme.colors.primary,
  },

  categoryChipText: {
    ...typography.caption,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },

  categoryChipTextActive: {
    color: theme.colors.primary,
  },

  markAllButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },

  markAllText: {
    ...typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },

  content: {
    padding: spacing.lg,
  },

  notificationCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  notificationCardRead: {
    opacity: 0.6,
  },

  priorityBar: {
    width: 4,
  },

  notificationContent: {
    flex: 1,
    padding: spacing.md,
  },

  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },

  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },

  notificationInfo: {
    flex: 1,
  },

  notificationTitle: {
    ...typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },

  unreadTitle: {
    fontWeight: '700',
  },

  notificationTime: {
    ...typography.caption,
    color: theme.colors.textSecondary,
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },

  notificationMessage: {
    ...typography.body,
    color: theme.colors.textSecondary,
    marginBottom: spacing.sm,
  },

  actionLabel: {
    ...typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },

  notificationActions: {
    flexDirection: 'row',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  actionButtonText: {
    ...typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },

  emptyTitle: {
    ...typography.h4,
    color: theme.colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  emptyDescription: {
    ...typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
