import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, ActivityIndicator, Switch } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Screen } from '../components/layout';
import { Button } from '../components/ui';
import { BackupTypeCard } from '../components/backup';
import { useBackup } from '../hooks/useBackup';
import { RestoreType, RestoreProgress } from '../types';
import { theme, typography, spacing } from '../constants/theme';

export default function RestoreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const backupId = params.backupId ? parseInt(params.backupId as string) : undefined;
  
  const { restoreFromBackup, restoreFromFile } = useBackup();
  const [selectedType, setSelectedType] = useState<RestoreType>('FULL');
  const [createBackup, setCreateBackup] = useState(true);
  const [validateData, setValidateData] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [progress, setProgress] = useState<RestoreProgress | null>(null);

  const restoreTypes = [
    {
      type: 'FULL' as RestoreType,
      title: 'Restauração Completa',
      description: 'Substituir todos os dados e configurações',
      icon: 'refresh-circle' as const,
      color: '#3B82F6',
    },
    {
      type: 'DATA_ONLY' as RestoreType,
      title: 'Apenas Dados',
      description: 'Restaurar dados, manter configurações',
      icon: 'document-text' as const,
      color: '#10B981',
    },
    {
      type: 'SETTINGS_ONLY' as RestoreType,
      title: 'Apenas Configurações',
      description: 'Restaurar configurações, manter dados',
      icon: 'settings' as const,
      color: '#8B5CF6',
    },
  ];

  const handleRestore = async () => {
    Alert.alert(
      'Confirmar Restauração',
      'Esta ação substituirá os dados atuais. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: performRestore,
        },
      ]
    );
  };

  const performRestore = async () => {
    try {
      setRestoring(true);

      const options = {
        restoreType: selectedType,
        createBackupBeforeRestore: createBackup,
        validateData,
        overwriteExisting: true,
      };

      let result;
      if (backupId) {
        result = await restoreFromBackup(backupId, options, (prog) => setProgress(prog));
      } else {
        // Pick file
        const file = await DocumentPicker.getDocumentAsync({
          type: 'application/json',
        });

        if (file.canceled || !file.assets[0]) {
          setRestoring(false);
          return;
        }

        result = await restoreFromFile(file.assets[0].uri, options, (prog) => setProgress(prog));
      }

      setRestoring(false);
      setProgress(null);

      if (result.success) {
        Alert.alert(
          'Restauração Concluída!',
          `${result.restoredRecords} registros restaurados com sucesso.`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert(
          'Restauração Parcial',
          `Alguns erros ocorreram:\n${result.errors.join('\n')}`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error: any) {
      setRestoring(false);
      setProgress(null);
      Alert.alert('Erro', error.message || 'Falha ao restaurar backup');
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Restaurar Backup</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Tipo de restauração:</Text>

        {restoreTypes.map(type => (
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

        <Text style={styles.sectionTitle}>Opções de segurança:</Text>

        <View style={styles.optionItem}>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Criar backup de segurança</Text>
            <Text style={styles.optionDescription}>
              Backup automático antes de restaurar
            </Text>
          </View>
          <Switch
            value={createBackup}
            onValueChange={setCreateBackup}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>

        <View style={styles.optionItem}>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Validar dados</Text>
            <Text style={styles.optionDescription}>
              Verificar integridade antes de importar
            </Text>
          </View>
          <Switch
            value={validateData}
            onValueChange={setValidateData}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>

        <View style={styles.warningCard}>
          <Ionicons name="warning" size={20} color={theme.colors.warning} />
          <Text style={styles.warningText}>
            Esta ação substituirá os dados atuais. 
            {createBackup ? ' Um backup de segurança será criado automaticamente.' : ' Recomendamos criar um backup antes de continuar.'}
          </Text>
        </View>

        <Button
          title={backupId ? 'Restaurar Backup' : 'Escolher Arquivo e Restaurar'}
          onPress={handleRestore}
          disabled={restoring}
        />
      </ScrollView>

      {/* Progress Modal */}
      <Modal visible={restoring} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.modalTitle}>Restaurando...</Text>
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
    marginTop: spacing.md,
  },

  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  optionContent: {
    flex: 1,
    marginRight: spacing.md,
  },

  optionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },

  optionDescription: {
    ...typography.caption,
    color: theme.colors.textSecondary,
  },

  warningCard: {
    flexDirection: 'row',
    backgroundColor: `${theme.colors.warning}10`,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },

  warningText: {
    ...typography.caption,
    color: theme.colors.warning,
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
