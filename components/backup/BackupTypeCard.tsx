import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BackupType } from '../../types';
import { theme, typography, spacing } from '../../constants/theme';

interface BackupTypeCardProps {
  type: BackupType;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  selected?: boolean;
  onPress: () => void;
}

export function BackupTypeCard({ 
  type, 
  title, 
  description, 
  icon, 
  color, 
  selected,
  onPress 
}: BackupTypeCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.selected,
        selected && { borderColor: color }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      {selected && (
        <Ionicons name="checkmark-circle" size={24} color={color} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginBottom: spacing.md,
  },

  selected: {
    backgroundColor: `${theme.colors.primary}05`,
    borderWidth: 2,
  },

  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  content: {
    flex: 1,
  },

  title: {
    ...typography.body,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },

  description: {
    ...typography.caption,
    color: theme.colors.textSecondary,
  },
});
