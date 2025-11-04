import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, typography, spacing } from '../../constants/theme';

interface NotificationBadgeProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export function NotificationBadge({ count, size = 'medium', color }: NotificationBadgeProps) {
  if (count === 0) return null;

  const sizeStyles = {
    small: { width: 16, height: 16, fontSize: 10 },
    medium: { width: 20, height: 20, fontSize: 11 },
    large: { width: 24, height: 24, fontSize: 12 },
  };

  const style = sizeStyles[size];

  return (
    <View style={[styles.badge, { width: style.width, height: style.height, backgroundColor: color || theme.colors.error }]}>
      <Text style={[styles.badgeText, { fontSize: style.fontSize }]}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },

  badgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
