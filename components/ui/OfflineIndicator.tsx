import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOffline } from '../../hooks/useOffline';
import { theme, typography, spacing } from '../../constants/theme';

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = useOffline();

  if (isOnline) return null;

  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline" size={16} color={theme.colors.surface} />
      <Text style={styles.text}>Modo Offline</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warning,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },

  text: {
    ...typography.caption,
    fontWeight: '700',
    color: theme.colors.surface,
  },
});
