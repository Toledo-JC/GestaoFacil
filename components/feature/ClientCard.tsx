import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Client } from '../../types';
import { theme } from '../../constants/theme';

interface ClientCardProps {
  client: Client;
  onPress: () => void;
  onDelete: () => void;
}

const ClientCardComponent = ({ client, onPress, onDelete }: ClientCardProps) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{client.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{client.name}</Text>
          {client.phone && (
            <View style={styles.row}>
              <Ionicons name="call-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.detail}>{client.phone}</Text>
            </View>
          )}
          {client.email && (
            <View style={styles.row}>
              <Ionicons name="mail-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.detail}>{client.email}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  avatar: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.surface,
  },
  
  info: {
    flex: 1,
  },
  
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  
  detail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  
  deleteButton: {
    padding: theme.spacing.sm,
  },
});

export const ClientCard = memo(ClientCardComponent);
