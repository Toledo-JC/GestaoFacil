import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { CollaboratorWithStats } from '../../types';
import { spacing, borderRadius, typography } from '../../constants/theme';

interface CollaboratorCardProps {
  collaborator: CollaboratorWithStats;
  onPress: () => void;
}

const COLLABORATOR_TYPE_ICONS = {
  SOCIO: 'business',
  FUNCIONARIO: 'person',
  TERCEIRIZADO: 'people',
  AUXILIAR: 'hand-right',
} as const;

const COLLABORATOR_TYPE_LABELS = {
  SOCIO: 'Sócio',
  FUNCIONARIO: 'Funcionário',
  TERCEIRIZADO: 'Terceirizado',
  AUXILIAR: 'Auxiliar',
} as const;

export function CollaboratorCard({ collaborator, onPress }: CollaboratorCardProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryLight }]}>
          <Ionicons
            name={COLLABORATOR_TYPE_ICONS[collaborator.type]}
            size={24}
            color={theme.colors.primary}
          />
        </View>

        <View style={styles.headerInfo}>
          <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
            {collaborator.name}
          </Text>
          <Text style={[styles.type, { color: theme.colors.textSecondary }]}>
            {COLLABORATOR_TYPE_LABELS[collaborator.type]}
          </Text>
        </View>

        {!collaborator.active && (
          <View style={[styles.badge, { backgroundColor: theme.colors.error + '20' }]}>
            <Text style={[styles.badgeText, { color: theme.colors.error }]}>Inativo</Text>
          </View>
        )}
      </View>

      {collaborator.phone && (
        <View style={styles.contactRow}>
          <Ionicons name="call-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.contactText, { color: theme.colors.textSecondary }]}>
            {collaborator.phone}
          </Text>
        </View>
      )}

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>
            {collaborator.serviceCount}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Serviços</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.success }]}>
            R$ {collaborator.paidCommissions.toFixed(2)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Pagos</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.warning }]}>
            R$ {collaborator.pendingCommissions.toFixed(2)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Pendentes</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },

  headerInfo: {
    flex: 1,
  },

  name: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },

  type: {
    ...typography.bodySmall,
  },

  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },

  badgeText: {
    ...typography.caption,
    fontWeight: '600',
  },

  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },

  contactText: {
    ...typography.bodySmall,
  },

  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  statItem: {
    alignItems: 'center',
    flex: 1,
  },

  statValue: {
    ...typography.h3,
    marginBottom: spacing.xs / 2,
  },

  statLabel: {
    ...typography.caption,
  },

  divider: {
    width: 1,
    height: 32,
  },
});
