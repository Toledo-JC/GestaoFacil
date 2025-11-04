import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, typography, spacing } from '../../constants/theme';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  growth?: number;
  trend?: 'up' | 'down' | 'neutral';
}

export function KPICard({ title, value, subtitle, icon, color = theme.colors.primary, growth, trend }: KPICardProps) {
  const getTrendIcon = () => {
    if (!trend || trend === 'neutral') return null;
    return trend === 'up' ? 'trending-up' : 'trending-down';
  };

  const getTrendColor = () => {
    if (!trend || trend === 'neutral') return theme.colors.textTertiary;
    return trend === 'up' ? theme.colors.success : theme.colors.error;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
            <Ionicons name={icon} size={20} color={color} />
          </View>
        )}
      </View>
      
      <Text style={[styles.value, { color }]}>{value}</Text>
      
      {(subtitle || growth !== undefined) && (
        <View style={styles.footer}>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          {growth !== undefined && (
            <View style={styles.growth}>
              {getTrendIcon() && (
                <Ionicons name={getTrendIcon()!} size={14} color={getTrendColor()} />
              )}
              <Text style={[styles.growthText, { color: getTrendColor() }]}>
                {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },

  title: {
    ...typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },

  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  value: {
    ...typography.h3,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  subtitle: {
    ...typography.caption,
    color: theme.colors.textTertiary,
    fontSize: 11,
  },

  growth: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  growthText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '600',
  },
});
