import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Equipment, EquipmentWithStats } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { spacing, borderRadius, typography } from '../../constants/theme';

interface EquipmentCardProps {
  equipment: Equipment | EquipmentWithStats;
  onPress: () => void;
  onDelete?: () => void;
  showClient?: boolean;
}

export function EquipmentCard({ equipment, onPress, onDelete, showClient }: EquipmentCardProps) {
  const { theme } = useTheme();
  const stats = equipment as EquipmentWithStats;

  const getEquipmentIcon = (type: string): any => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('computador') || lowerType.includes('notebook')) return 'laptop-outline';
    if (lowerType.includes('celular') || lowerType.includes('telefone')) return 'phone-portrait-outline';
    if (lowerType.includes('tv') || lowerType.includes('televisão')) return 'tv-outline';
    if (lowerType.includes('geladeira') || lowerType.includes('refrigerador')) return 'snow-outline';
    if (lowerType.includes('ar condicionado')) return 'thermometer-outline';
    return 'construct-outline';
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryLight }]}>
          <Ionicons name={getEquipmentIcon(equipment.type)} size={24} color="#fff" />
        </View>

        <View style={styles.info}>
          <Text style={[styles.type, { color: theme.colors.text }]} numberOfLines={1}>
            {equipment.type}
          </Text>
          
          {equipment.brand && (
            <View style={styles.row}>
              <Ionicons name="pricetag-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.detail, { color: theme.colors.textSecondary }]}>
                {equipment.brand} {equipment.model ? `• ${equipment.model}` : ''}
              </Text>
            </View>
          )}

          {equipment.serialNumber && (
            <View style={styles.row}>
              <Ionicons name="barcode-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.detail, { color: theme.colors.textSecondary }]}>
                {equipment.serialNumber}
              </Text>
            </View>
          )}

          {showClient && stats.clientName && (
            <View style={styles.row}>
              <Ionicons name="person-outline" size={14} color={theme.colors.primary} />
              <Text style={[styles.detail, { color: theme.colors.primary }]}>
                {stats.clientName}
              </Text>
            </View>
          )}
        </View>

        {onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
          </TouchableOpacity>
        )}
      </View>

      {stats.osCount !== undefined && (
        <View style={styles.statsContainer}>
          <View style={[styles.statBadge, { backgroundColor: theme.colors.background }]}>
            <Ionicons name="clipboard-outline" size={16} color={theme.colors.primary} />
            <Text style={[styles.statText, { color: theme.colors.text }]}>
              {stats.osCount} OS{stats.osCount !== 1 ? 's' : ''}
            </Text>
          </View>

          {stats.lastOSDate && (
            <View style={[styles.statBadge, { backgroundColor: theme.colors.background }]}>
              <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                {new Date(stats.lastOSDate).toLocaleDateString('pt-BR')}
              </Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  info: {
    flex: 1,
  },

  type: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: spacing.xs,
  },

  detail: {
    ...typography.bodySmall,
  },

  deleteButton: {
    padding: spacing.sm,
  },

  statsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    flexWrap: 'wrap',
  },

  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },

  statText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
});
