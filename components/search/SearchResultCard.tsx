import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SearchResult, SearchModule } from '../../types';
import { theme, typography, spacing } from '../../constants/theme';

interface SearchResultCardProps {
  result: SearchResult;
}

export function SearchResultCard({ result }: SearchResultCardProps) {
  const router = useRouter();

  const getModuleIcon = (type: SearchModule): string => {
    switch (type) {
      case 'CLIENTS': return 'people';
      case 'EQUIPMENTS': return 'construct';
      case 'ORDERS': return 'document-text';
      case 'BUDGETS': return 'calculator';
      case 'PRODUCTS': return 'cube';
      case 'COLLABORATORS': return 'person';
      case 'FINANCIAL': return 'cash';
      case 'PREVENTIVES': return 'build';
      default: return 'search';
    }
  };

  const getModuleColor = (type: SearchModule): string => {
    switch (type) {
      case 'CLIENTS': return theme.colors.primary;
      case 'EQUIPMENTS': return '#F59E0B';
      case 'ORDERS': return '#10B981';
      case 'BUDGETS': return '#8B5CF6';
      case 'PRODUCTS': return '#EC4899';
      case 'COLLABORATORS': return '#14B8A6';
      case 'FINANCIAL': return '#EF4444';
      case 'PREVENTIVES': return '#3B82F6';
      default: return theme.colors.textSecondary;
    }
  };

  const handlePress = () => {
    if (result.url) {
      router.push(result.url as any);
    }
  };

  const moduleColor = getModuleColor(result.type);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${moduleColor}20` }]}>
        <Ionicons name={getModuleIcon(result.type) as any} size={24} color={moduleColor} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{result.title}</Text>
        {result.subtitle && <Text style={styles.subtitle}>{result.subtitle}</Text>}
        {result.description && <Text style={styles.description}>{result.description}</Text>}
      </View>

      <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    marginBottom: 2,
  },

  subtitle: {
    ...typography.caption,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },

  description: {
    ...typography.caption,
    color: theme.colors.textTertiary,
  },
});
