import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../components/layout';
import { SearchBar, EmptyState } from '../components/ui';
import { useInventory } from '../hooks/useInventory';
import { Product } from '../types';
import { theme, typography, spacing } from '../constants/theme';
import { formatCurrency } from '../utils/format';

type ViewMode = 'grid' | 'list';

export default function ProductsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { products, loading, refreshInventory } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.referenceCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProductCard = ({ item }: { item: Product }) => {
    const isLowStock = item.currentStock <= item.minimumStock;
    const isOutOfStock = item.currentStock === 0;

    if (viewMode === 'grid') {
      return (
        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => router.push(`/product-form?id=${item.id}`)}
        >
          <View style={styles.gridCardHeader}>
            {isOutOfStock ? (
              <View style={[styles.stockBadge, { backgroundColor: theme.colors.error }]}>
                <Text style={styles.stockBadgeText}>SEM ESTOQUE</Text>
              </View>
            ) : isLowStock ? (
              <View style={[styles.stockBadge, { backgroundColor: theme.colors.accent }]}>
                <Text style={styles.stockBadgeText}>ESTOQUE BAIXO</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.gridCardIcon}>
            <Ionicons
              name={item.type === 'PRODUTO' ? 'cube' : 'construct'}
              size={32}
              color={theme.colors.primary}
            />
          </View>

          <Text style={styles.gridCardName} numberOfLines={2}>
            {item.name}
          </Text>

          {item.referenceCode && (
            <Text style={styles.gridCardCode}>{item.referenceCode}</Text>
          )}

          <View style={styles.gridCardFooter}>
            <Text style={styles.gridCardStock}>
              {item.currentStock} {item.unit}
            </Text>
            <Text style={styles.gridCardPrice}>{formatCurrency(item.salePrice)}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.listCard}
        onPress={() => router.push(`/product-form?id=${item.id}`)}
      >
        <View style={styles.listCardIcon}>
          <Ionicons
            name={item.type === 'PRODUTO' ? 'cube' : 'construct'}
            size={24}
            color={theme.colors.primary}
          />
        </View>

        <View style={styles.listCardContent}>
          <Text style={styles.listCardName}>{item.name}</Text>
          {item.referenceCode && (
            <Text style={styles.listCardCode}>Cód: {item.referenceCode}</Text>
          )}
          <View style={styles.listCardFooter}>
            <Text style={styles.listCardStock}>
              Estoque: {item.currentStock} {item.unit}
            </Text>
            <Text style={styles.listCardPrice}>{formatCurrency(item.salePrice)}</Text>
          </View>
        </View>

        {isOutOfStock && (
          <View style={[styles.listStockBadge, { backgroundColor: theme.colors.error }]}>
            <Ionicons name="alert-circle" size={16} color="#fff" />
          </View>
        )}
        {!isOutOfStock && isLowStock && (
          <View style={[styles.listStockBadge, { backgroundColor: theme.colors.accent }]}>
            <Ionicons name="warning" size={16} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <EmptyState
      icon="cube-outline"
      title="Nenhum produto encontrado"
      subtitle={
        searchQuery
          ? 'Tente ajustar sua busca'
          : 'Comece adicionando produtos ao estoque'
      }
    />
  );

  return (
    <Screen edges={['top']}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Produtos e Serviços</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <Ionicons
              name={viewMode === 'grid' ? 'list' : 'grid'}
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/product-form')}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar por nome ou código..."
        />
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{products.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: theme.colors.accent }]}>
            {products.filter(p => p.currentStock <= p.minimumStock).length}
          </Text>
          <Text style={styles.statLabel}>Baixo</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: theme.colors.error }]}>
            {products.filter(p => p.currentStock === 0).length}
          </Text>
          <Text style={styles.statLabel}>Sem Estoque</Text>
        </View>
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderProductCard}
        keyExtractor={item => item.id.toString()}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode}
        contentContainerStyle={[
          styles.listContainer,
          filteredProducts.length === 0 && styles.listContainerEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshInventory}
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

  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  viewButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
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

  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  statCard: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },

  statValue: {
    ...typography.h3,
    color: theme.colors.primary,
    fontWeight: '700',
  },

  statLabel: {
    ...typography.caption,
    color: theme.colors.textSecondary,
    marginTop: spacing.xs,
  },

  listContainer: {
    padding: spacing.lg,
  },

  listContainerEmpty: {
    flex: 1,
  },

  gridCard: {
    flex: 1,
    margin: spacing.xs,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  gridCardHeader: {
    minHeight: 20,
    marginBottom: spacing.xs,
  },

  gridCardIcon: {
    alignSelf: 'center',
    marginVertical: spacing.sm,
  },

  gridCardName: {
    ...typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.xs,
    minHeight: 40,
  },

  gridCardCode: {
    ...typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },

  gridCardFooter: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: spacing.sm,
  },

  gridCardStock: {
    ...typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },

  gridCardPrice: {
    ...typography.h4,
    color: theme.colors.primary,
    fontWeight: '700',
    textAlign: 'center',
  },

  stockBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },

  stockBadgeText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '700',
  },

  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  listCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  listCardContent: {
    flex: 1,
  },

  listCardName: {
    ...typography.h4,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },

  listCardCode: {
    ...typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: spacing.xs,
  },

  listCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  listCardStock: {
    ...typography.caption,
    color: theme.colors.textSecondary,
  },

  listCardPrice: {
    ...typography.h4,
    color: theme.colors.primary,
    fontWeight: '700',
  },

  listStockBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
});
