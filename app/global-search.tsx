import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../components/layout';
import { SearchResultCard } from '../components/search';
import { useSearch } from '../hooks/useSearch';
import { SearchModule } from '../types';
import { theme, typography, spacing } from '../constants/theme';

export default function GlobalSearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { results, loading, search, savedSearches, loadSavedSearches, saveSearch } = useSearch();

  const [query, setQuery] = useState('');
  const [selectedModules, setSelectedModules] = useState<SearchModule[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadSavedSearches();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    await search({
      query: query.trim(),
      modules: selectedModules.length > 0 ? selectedModules : undefined,
    });
  };

  const handleSaveSearch = async () => {
    if (!query.trim()) return;

    await saveSearch({
      name: query,
      query,
      modules: selectedModules.length > 0 ? JSON.stringify(selectedModules) : undefined,
      isFavorite: false,
    });
  };

  const toggleModule = (module: SearchModule) => {
    setSelectedModules(prev => 
      prev.includes(module) 
        ? prev.filter(m => m !== module)
        : [...prev, module]
    );
  };

  const modules: Array<{ key: SearchModule; label: string; icon: string; color: string }> = [
    { key: 'CLIENTS', label: 'Clientes', icon: 'people', color: theme.colors.primary },
    { key: 'EQUIPMENTS', label: 'Equipamentos', icon: 'construct', color: '#F59E0B' },
    { key: 'ORDERS', label: 'Ordens', icon: 'document-text', color: '#10B981' },
    { key: 'BUDGETS', label: 'Orçamentos', icon: 'calculator', color: '#8B5CF6' },
    { key: 'PRODUCTS', label: 'Produtos', icon: 'cube', color: '#EC4899' },
    { key: 'COLLABORATORS', label: 'Equipe', icon: 'person', color: '#14B8A6' },
    { key: 'FINANCIAL', label: 'Financeiro', icon: 'cash', color: '#EF4444' },
    { key: 'PREVENTIVES', label: 'Preventivas', icon: 'build', color: '#3B82F6' },
  ];

  return (
    <Screen edges={['top']}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Busca Global</Text>
          <TouchableOpacity onPress={handleSaveSearch}>
            <Ionicons name="bookmark-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar em todos os módulos..."
            placeholderTextColor={theme.colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {loading && <ActivityIndicator size="small" color={theme.colors.primary} />}
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options" size={20} color={theme.colors.text} />
          <Text style={styles.filterButtonText}>Filtros</Text>
          {selectedModules.length > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{selectedModules.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        {showFilters && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.moduleFilter}
            contentContainerStyle={styles.moduleFilterContent}
          >
            {modules.map(module => (
              <TouchableOpacity
                key={module.key}
                style={[
                  styles.moduleChip,
                  selectedModules.includes(module.key) && [styles.moduleChipActive, { borderColor: module.color }],
                ]}
                onPress={() => toggleModule(module.key)}
              >
                <Ionicons
                  name={module.icon as any}
                  size={16}
                  color={selectedModules.includes(module.key) ? module.color : theme.colors.textSecondary}
                />
                <Text style={[
                  styles.moduleChipText,
                  selectedModules.includes(module.key) && { color: module.color },
                ]}>
                  {module.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {results && (
          <View style={styles.resultsSummary}>
            <Text style={styles.resultsCount}>{results.total} resultados encontrados</Text>
            <TouchableOpacity onPress={() => router.push('/saved-searches' as any)}>
              <Text style={styles.savedSearchesLink}>Buscas Salvas</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {results && results.results.length > 0 ? (
          results.results.map((result, index) => (
            <SearchResultCard key={`${result.type}-${result.id}-${index}`} result={result} />
          ))
        ) : results && results.results.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={theme.colors.textTertiary} />
            <Text style={styles.emptyTitle}>Nenhum resultado encontrado</Text>
            <Text style={styles.emptyDescription}>
              Tente ajustar sua busca ou remover alguns filtros
            </Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color={theme.colors.textTertiary} />
            <Text style={styles.emptyTitle}>Busca Global</Text>
            <Text style={styles.emptyDescription}>
              Encontre clientes, equipamentos, ordens, produtos e muito mais em um só lugar
            </Text>
          </View>
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

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  searchIcon: {
    marginRight: spacing.sm,
  },

  searchInput: {
    flex: 1,
    ...typography.body,
    color: theme.colors.text,
    paddingVertical: spacing.md,
  },

  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },

  filterButtonText: {
    ...typography.caption,
    fontWeight: '600',
    color: theme.colors.text,
  },

  filterBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  filterBadgeText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.surface,
  },

  moduleFilter: {
    marginBottom: spacing.sm,
  },

  moduleFilterContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },

  moduleChip: {
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

  moduleChipActive: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
  },

  moduleChipText: {
    ...typography.caption,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },

  resultsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },

  resultsCount: {
    ...typography.caption,
    fontWeight: '600',
    color: theme.colors.text,
  },

  savedSearchesLink: {
    ...typography.caption,
    fontWeight: '600',
    color: theme.colors.primary,
  },

  content: {
    padding: spacing.lg,
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
    paddingHorizontal: spacing.xl,
  },
});
