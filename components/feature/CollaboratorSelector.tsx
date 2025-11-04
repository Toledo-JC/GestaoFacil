import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useCollaborators } from '../../hooks/useCollaborators';
import { Collaborator } from '../../types';
import { spacing, borderRadius, typography } from '../../constants/theme';

interface CollaboratorSelectorProps {
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  multiple?: boolean;
}

export function CollaboratorSelector({
  selectedIds,
  onSelectionChange,
  multiple = true,
}: CollaboratorSelectorProps) {
  const { theme } = useTheme();
  const { collaborators } = useCollaborators();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCollaborators, setFilteredCollaborators] = useState<Collaborator[]>([]);

  useEffect(() => {
    const activeCollaborators = collaborators.filter(c => c.active);
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = activeCollaborators.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.type.toLowerCase().includes(query)
      );
      setFilteredCollaborators(filtered);
    } else {
      setFilteredCollaborators(activeCollaborators);
    }
  }, [collaborators, searchQuery]);

  const handleToggle = (id: number) => {
    if (multiple) {
      if (selectedIds.includes(id)) {
        onSelectionChange(selectedIds.filter(sid => sid !== id));
      } else {
        onSelectionChange([...selectedIds, id]);
      }
    } else {
      onSelectionChange([id]);
    }
  };

  const isSelected = (id: number) => selectedIds.includes(id);

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Buscar colaborador..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filteredCollaborators.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {searchQuery ? 'Nenhum colaborador encontrado' : 'Nenhum colaborador ativo'}
            </Text>
          </View>
        ) : (
          filteredCollaborators.map(collaborator => {
            const selected = isSelected(collaborator.id);
            return (
              <TouchableOpacity
                key={collaborator.id}
                style={[
                  styles.item,
                  {
                    backgroundColor: selected
                      ? theme.colors.primaryLight
                      : theme.colors.surface,
                    borderColor: selected ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => handleToggle(collaborator.id)}
                activeOpacity={0.7}
              >
                <View style={styles.itemContent}>
                  <View style={styles.itemInfo}>
                    <Text
                      style={[
                        styles.itemName,
                        { color: selected ? theme.colors.primary : theme.colors.text },
                      ]}
                    >
                      {collaborator.name}
                    </Text>
                    <Text style={[styles.itemType, { color: theme.colors.textSecondary }]}>
                      {collaborator.type} • {collaborator.commissionPercentage}% comissão
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: selected ? theme.colors.primary : 'transparent',
                        borderColor: selected ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                  >
                    {selected && <Ionicons name="checkmark" size={18} color="#fff" />}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {selectedIds.length > 0 && (
        <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.footerText, { color: theme.colors.text }]}>
            {selectedIds.length} colaborador{selectedIds.length > 1 ? 'es' : ''} selecionado
            {selectedIds.length > 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },

  searchInput: {
    flex: 1,
    ...typography.body,
  },

  list: {
    flex: 1,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },

  emptyText: {
    ...typography.body,
    marginTop: spacing.md,
  },

  item: {
    borderRadius: borderRadius.md,
    borderWidth: 2,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },

  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  itemInfo: {
    flex: 1,
  },

  itemName: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },

  itemType: {
    ...typography.bodySmall,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#00000010',
  },

  footerText: {
    ...typography.body,
    textAlign: 'center',
    fontWeight: '600',
  },
});
