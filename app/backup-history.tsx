import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { Screen } from '../components/layout';
import { useBackup } from '../hooks/useBackup';
import { Backup } from '../types';
import { theme, typography, spacing } from '../constants/theme';
import { formatFileSize, formatDateTime } from '../utils/format';

export default function BackupHistoryScreen() {
  const router = useRouter();
  const { backups, loadBackups, deleteBackup, shareBackup } = useBackup();

  useEffect(() => {
    loadBackups();
  }, []);

  const getBackupTypeLabel = (type: string) => {
    switch (type) {
      case 'FULL': return 'Completo';
      case 'DATA_ONLY': return 'Dados';
      case 'SETTINGS_ONLY': return 'Configurações';
      default: return type;
    }
  };

  const getBackupTypeColor = (type: string) => {
    switch (type) {
      case 'FULL': return '#3B82F6';
      case 'DATA_ONLY': return '#10B981';
      case 'SETTINGS_ONLY': return '#8B5CF6';
      default: return theme.colors.primary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '#10B981';
      case 'FAILED': return '#EF4444';
      default: return '#F59E0B';
    }
  };

  const handleShare = async (backup: Backup) => {
    try {
      const filePath = await shareBackup(backup.id);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao compartilhar backup');
    }
  };

  const handleDelete = (backup: Backup) => {
    Alert.alert(
      'Excluir Backup',
      'Tem certeza que deseja excluir este backup? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBackup(backup.id);
              Alert.alert('Sucesso', 'Backup excluído com sucesso');
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Falha ao excluir backup');
            }
          },
        },
      ]
    );
  };

  const renderBackupCard = ({ item }: { item: Backup }) => (
    <View style={styles.backupCard}>
      <View style={styles.backupHeader}>
        <View style={[styles.typeBadge, { backgroundColor: `${getBackupTypeColor(item.backupType)}20` }]}>
          <Text style={[styles.typeBadgeText, { color: getBackupTypeColor(item.backupType) }]}>
            {getBackupTypeLabel(item.backupType)}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
          <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>
            {item.status === 'COMPLETED' ? 'Concluído' : item.status === 'FAILED' ? 'Falhou' : 'Processando'}
          </Text>
        </View>
      </View>

      <Text style={styles.backupDate}>{formatDateTime(item.createdAt)}</Text>
      
      <View style={styles.backupInfo}>
        <Text style={styles.backupInfoText}>
          <Ionicons name="folder" size={14} color={theme.colors.textSecondary} /> 
          {' '}{formatFileSize(item.fileSize || 0)}
        </Text>
        <Text style={styles.backupInfoText}>
          <Ionicons name="document-text" size={14} color={theme.colors.textSecondary} /> 
          {' '}{item.recordsCount || 0} registros
        </Text>
      </View>

      {item.errorMessage && (
        <Text style={styles.errorText}>{item.errorMessage}</Text>
      )}

      <View style={styles.backupActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/restore?backupId=${item.id}` as any)}
        >
          <Ionicons name="cloud-download-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.actionButtonText}>Restaurar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleShare(item)}
        >
          <Ionicons name="share-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.actionButtonText}>Compartilhar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
          <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico de Backups</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={backups}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderBackupCard}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cloud-offline-outline" size={64} color={theme.colors.textTertiary} />
            <Text style={styles.emptyText}>Nenhum backup encontrado</Text>
            <Text style={styles.emptySubtext}>
              Crie seu primeiro backup para manter seus dados seguros
            </Text>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  backButton: {
    padding: 4,
  },

  headerTitle: {
    ...typography.h3,
    color: theme.colors.text,
  },

  content: {
    padding: spacing.lg,
  },

  backupCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  backupHeader: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },

  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },

  typeBadgeText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
  },

  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },

  statusBadgeText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
  },

  backupDate: {
    ...typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: spacing.xs,
  },

  backupInfo: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },

  backupInfoText: {
    ...typography.caption,
    color: theme.colors.textSecondary,
  },

  errorText: {
    ...typography.caption,
    color: theme.colors.error,
    marginBottom: spacing.sm,
  },

  backupActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  actionButtonText: {
    ...typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },

  emptyText: {
    ...typography.h4,
    color: theme.colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },

  emptySubtext: {
    ...typography.caption,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});
