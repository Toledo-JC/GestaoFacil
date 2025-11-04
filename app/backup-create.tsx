import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { Screen } from '../components/layout';
import { Button } from '../components/ui';
import { BackupTypeCard } from '../components/backup';
import { useBackup } from '../hooks/useBackup';
import { BackupType, BackupProgress } from '../types';
import { theme, typography, spacing } from '../constants/theme';

export default function BackupCreateScreen() {
  const router = useRouter();
  const { createBackup } = useBackup();
  const [selectedType, setSelectedType] = useState<BackupType>('FULL');
  const [creating, setCreating] = useState(false);
  const [progress, setProgress] = useState<BackupProgress | null>(null);

  const backupTypes = [
    {
      type: 'FULL' as BackupType,
      title: 'Backup Completo',
      description: 'Todos os dados e configurações',
      icon: 'cloud' as const,
      color: '#3B82F6',
    },
    {
      type: 'DATA_ONLY' as BackupType,
      title: 'Apenas Dados',
      description: 'Clientes, OSs, financeiro e estoque',
      icon: 'document-text' as const,
      color: '#10B981',
    },
    {
      type: 'SETTINGS_ONLY' as BackupType,
      title: 'Apenas Configurações',
      description: 'Tema, preferências e ajustes',
      icon: 'settings' as const,
      color: '#8B5CF6',
    },
  ];

  const handleCreate = async () => {
    try {
      setCreating(true);
      
      const backup = await createBackup(
        selectedType,
        { compression: true },
        (prog) => setProgress(prog)
      );

      setCreating(false);
      setProgress(null);

      Alert.alert(
        'Backup Criado!',
        'Backup criado com sucesso. Deseja compartilhar o arquivo?',
        [
          { text: 'Agora Não', onPress: () => router.back() },
          {
            text: 'Compartilhar',
            onPress: async () => {
              if (backup.filePath && await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(backup.filePath);
              }
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      setCreating(false);
      setProgress(null);
      Alert.alert('Erro', error.message || 'Falha ao criar backup');
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Criar Backup</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Escolha o tipo de backup:</Text>

        {backupTypes.map(type => (
          <BackupTypeCard
            key={type.type}
            type={type.type}
            title={type.title}
            description={type.description}
            icon={type.icon}
            color={type.color}
            selected={selectedType === type.type}
            onPress={() => setSelectedType(type.type)}
          />
        ))}

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={theme.colors.info} />
          <Text style={styles.infoText}>
            O backup será salvo localmente no dispositivo. 
            Você poderá compartilhar o arquivo após a criação.
          </Text>
        </View>

        <Button
          title="Criar Backup"
          onPress={handleCreate}
          disabled={creating}
        />
      </ScrollView>

      {/* Progress Modal */}
      <Modal visible={creating} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.modalTitle}>Criando Backup...</Text>
            {progress && (
              <>
                <Text style={styles.modalMessage}>{progress.message}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress.progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{Math.round(progress.progress)}%</Text>
              </>
            )}
          </View>
        </View>
      </Modal>
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

  sectionTitle: {
    ...typography.h4,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },

  infoCard: {
    flexDirection: 'row',
    backgroundColor: `${theme.colors.info}10`,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  infoText: {
    ...typography.caption,
    color: theme.colors.info,
    flex: 1,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    minWidth: 280,
  },

  modalTitle: {
    ...typography.h4,
    color: theme.colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },

  modalMessage: {
    ...typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },

  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },

  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },

  progressText: {
    ...typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
});
