import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../../components/layout';
import { SearchBar } from '../../components/ui';
import { useServiceOrders } from '../../hooks/useServiceOrders';
import { ServiceOrder } from '../../types';
import { theme, typography, spacing } from '../../constants/theme';

const STATUS_COLORS = {
  DRAFT: '#6B7280',
  BUDGET: '#3B82F6',
  APPROVED: '#10B981',
  IN_PROGRESS: '#F59E0B',
  WAITING_PARTS: '#EF4444',
  COMPLETED: '#059669',
  CANCELLED: '#DC2626',
};

const STATUS_LABELS = {
  DRAFT: 'Rascunho',
  BUDGET: 'Orçamento',
  APPROVED: 'Aprovada',
  IN_PROGRESS: 'Em Andamento',
  WAITING_PARTS: 'Aguard. Peças',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
};

const PRIORITY_ICONS = {
  LOW: 'flag-outline',
  NORMAL: 'flag',
  HIGH: 'alert-circle',
  URGENT: 'warning',
};

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { serviceOrders, loading, refreshServiceOrders } = useServiceOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ServiceOrder['status'] | 'ALL'>('ALL');

  const filteredOrders = serviceOrders.filter(order => {
    const matchesSearch = 
      order.osNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'ALL' || order.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    ALL: serviceOrders.length,
    DRAFT: serviceOrders.filter(o => o.status === 'DRAFT').length,
    BUDGET: serviceOrders.filter(o => o.status === 'BUDGET').length,
    APPROVED: serviceOrders.filter(o => o.status === 'APPROVED').length,
    IN_PROGRESS: serviceOrders.filter(o => o.status === 'IN_PROGRESS').length,
    WAITING_PARTS: serviceOrders.filter(o => o.status === 'WAITING_PARTS').length,
    COMPLETED: serviceOrders.filter(o => o.status === 'COMPLETED').length,
    CANCELLED: serviceOrders.filter(o => o.status === 'CANCELLED').length,
  };

  const renderStatusFilter = () => (
    <View style={styles.filterContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[
          { key: 'ALL', label: 'Todas' },
          { key: 'IN_PROGRESS', label: 'Em Andamento' },
          { key: 'APPROVED', label: 'Aprovadas' },
          { key: 'BUDGET', label: 'Orçamentos' },
          { key: 'WAITING_PARTS', label: 'Aguard. Peças' },
          { key: 'COMPLETED', label: 'Concluídas' },
        ]}
        keyExtractor={item => item.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedStatus === item.key && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedStatus(item.key as any)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedStatus === item.key && styles.filterButtonTextActive,
              ]}
            >
              {item.label}
            </Text>
            {statusCounts[item.key as keyof typeof statusCounts] > 0 && (
              <View
                style={[
                  styles.badge,
                  selectedStatus === item.key && styles.badgeActive,
                ]}
              >
                <Text style={styles.badgeText}>
                  {statusCounts[item.key as keyof typeof statusCounts]}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.filterList}
      />
    </View>
  );

  const renderOrderCard = ({ item }: { item: ServiceOrder }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/os-detail?id=${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.osNumber}>{item.osNumber}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${STATUS_COLORS[item.status]}20` },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: STATUS_COLORS[item.status] },
              ]}
            >
              {STATUS_LABELS[item.status]}
            </Text>
          </View>
        </View>
        <Ionicons
          name={PRIORITY_ICONS[item.priority] as any}
          size={20}
          color={item.priority === 'URGENT' ? theme.colors.error : theme.colors.textSecondary}
        />
      </View>

      <Text style={styles.title}>{item.title}</Text>
      
      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.cardFooter}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.infoText}>
            {new Date(item.createdAt).toLocaleDateString('pt-BR')}
          </Text>
        </View>
        
        <Text style={styles.total}>R$ {item.total.toFixed(2)}</Text>
      </View>

      {item.scheduledDate && (
        <View style={styles.scheduledInfo}>
          <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.scheduledText}>
            Agendada: {new Date(item.scheduledDate).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={64} color={theme.colors.textTertiary} />
      <Text style={styles.emptyTitle}>Nenhuma OS encontrada</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? 'Tente ajustar sua busca'
          : 'Comece criando uma nova ordem de serviço'}
      </Text>
    </View>
  );

  return (
    <Screen edges={['top']}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Ordens de Serviço</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/os-form')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar por número ou título..."
        />
      </View>

      {renderStatusFilter()}

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderCard}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={[
          styles.listContainer,
          filteredOrders.length === 0 && styles.listContainerEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshServiceOrders}
            tintColor={theme.colors.primary}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: theme.colors.surface,
  },

  filterContainer: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  filterList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },

  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },

  filterButtonText: {
    ...typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },

  filterButtonTextActive: {
    color: '#fff',
  },

  badge: {
    marginLeft: spacing.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: theme.colors.border,
  },

  badgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },

  listContainer: {
    padding: spacing.lg,
  },

  listContainerEmpty: {
    flex: 1,
  },

  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  osNumber: {
    ...typography.caption,
    color: theme.colors.primary,
    fontWeight: '700',
    marginRight: spacing.sm,
  },

  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  title: {
    ...typography.h4,
    color: theme.colors.text,
    marginBottom: spacing.xs,
  },

  description: {
    ...typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: spacing.sm,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoText: {
    ...typography.caption,
    color: theme.colors.textSecondary,
    marginLeft: spacing.xs,
  },

  total: {
    ...typography.h4,
    color: theme.colors.primary,
    fontWeight: '700',
  },

  scheduledInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },

  scheduledText: {
    ...typography.caption,
    color: theme.colors.primary,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },

  emptyTitle: {
    ...typography.h3,
    color: theme.colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  emptySubtitle: {
    ...typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
