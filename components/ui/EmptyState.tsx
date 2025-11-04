import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, typography, spacing } from '../../constants/theme';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  fullScreen?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'folder-open-outline',
  title,
  message,
  actionLabel,
  onAction,
  fullScreen = false,
}) => {
  const containerStyle = fullScreen ? styles.fullScreenContainer : styles.container;

  return (
    <View style={containerStyle}>
      <Ionicons name={icon} size={80} color={theme.colors.textTertiary} />
      
      <Text style={styles.title}>{title}</Text>
      
      {message && <Text style={styles.message}>{message}</Text>}

      {actionLabel && onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Ionicons name="add-circle" size={20} color={theme.colors.surface} />
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fullScreenContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },

  title: {
    ...typography.h3,
    color: theme.colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },

  message: {
    ...typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },

  buttonText: {
    ...typography.body,
    fontWeight: '700',
    color: theme.colors.surface,
  },
});
