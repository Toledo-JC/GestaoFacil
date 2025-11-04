import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/layout';
import { useSearch } from '../hooks/useSearch';
import { theme, typography, spacing } from '../constants/theme';

export default function SavedSearchesScreen() {
  const router = useRouter();
  const { savedSearches, loadSavedSearches, deleteSavedSearch, executeSavedSearch } = useSearch();

  useEffect(() => {
    loadSavedSearches();
  }, []);

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      'Excluir Busca',
      `Deseja excluir a busca salva "${name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => deleteSavedSearch(id) },
      ]
    );
  };

  const handleExecute = async (id: number) => {
    await executeSavedSearch(id);
    router.push('/global-search' as any);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buscas Salvas</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {savedSearches.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={64} color={theme.colors.textTertiary} />
            <Text style={styles.emptyTitle}>Nenhuma busca salva</Text>
            <Text style={styles.emptyDescription}>
              Salve suas buscas frequentes para acesso rápido
            </Text>
          </View>
        ) : (
          savedSearches.map(search => (
            <View key={search.id} style={styles.searchCard}>
              <TouchableOpacity
                style={styles.searchInfo}
                onPress={() => handleExecute(search.id)}
                activeOpacity={0.7}
              >
                <View style={styles.searchHeader}>
                  <Ionicons
                    name={search.isFavorite ? 'star' : 'star-outline'}
                    size={20}
                    color={search.isFavorite ? theme.colors.warning : theme.colors.textSecondary}
                  />
                  <Text style={styles.searchName}>{search.name}</Text>
                </View>

                {search.description && (
                  <Text style={styles.searchDescription}>{search.description}</Text>
                )}

                <View style={styles.searchMeta}>
                  <Text style={styles.searchQuery}>"{search.query}"</Text>
                  <Text style={styles.searchUseCount}>Usado {search.useCount}x</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(search.id, search.name)}
              >
                <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          ))
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

  backButton: {
    padding: 4,
  },

  headerTitle: {
    ...typography.h3,
    color: theme.colors.text,
  },

  content: {
    padding: spacing.lg,
  },

  searchCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },

  searchInfo: {
    flex: 1,
    padding: spacing.md,
  },

  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },

  searchName: {
    ...typography.body,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
  },

  searchDescription: {
    ...typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: spacing.sm,
  },

  searchMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  searchQuery: {
    ...typography.caption,
    color: theme.colors.primary,
    fontStyle: 'italic',
  },

  searchUseCount: {
    ...typography.caption,
    color: theme.colors.textTertiary,
  },

  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: `${theme.colors.error}10`,
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
