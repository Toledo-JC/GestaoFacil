import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/layout';
import { Button } from '../components/ui';
import { useBackup } from '../hooks/useBackup';
import { BackupFrequency } from '../types';
import { theme, typography, spacing } from '../constants/theme';
import { formatFileSize, formatDateTime } from '../utils/format';

export default function BackupSettingsScreen() {
  const router = useRouter();
  const { settings, loadSettings, updateSettings, backups, loadBackups } = useBackup();
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [cloudBackupEnabled, setCloudBackupEnabled] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [frequency, setFrequency] = useState<BackupFrequency>('WEEKLY');

  useEffect(() => {
    loadSettings();
    loadBackups();
  }, []);

  useEffect(() => {
    if (settings) {
      setAutoBackupEnabled(settings.autoBackupEnabled);
      setCloudBackupEnabled(settings.cloudBackupEnabled);
      setNotificationEnabled(settings.notificationEnabled);
      if (settings.backupFrequency) {
        setFrequency(settings.backupFrequency);
      }
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings({
      autoBackupEnabled,
      cloudBackupEnabled,
      notificationEnabled,
      backupFrequency: autoBackupEnabled ? frequency : undefined,
    });

    Alert.alert('Sucesso', 'Configurações salvas com sucesso!');
  };

  const getFrequencyLabel = (freq: BackupFrequency) => {
    switch (freq) {
      case 'DAILY': return 'Diário';
      case 'WEEKLY': return 'Semanal';
      case 'MONTHLY': return 'Mensal';
    }
  };

  const lastBackup = backups.length > 0 ? backups[0] : null;

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Backup e Restauração</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons name="cloud-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.statusTitle}>Status do Backup</Text>
          </View>
          
          {lastBackup ? (
            <>
              <Text style={styles.statusDate}>
                Último backup: {formatDateTime(lastBackup.createdAt)}
              </Text>
              <Text style={styles.statusSize}>
                Tamanho: {formatFileSize(lastBackup.fileSize || 0)} • {lastBackup.recordsCount} registros
              </Text>
            </>
          ) : (
            <Text style={styles.statusEmpty}>Nenhum backup realizado ainda</Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/backup-create')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#3B82F620' }]}>
              <Ionicons name="cloud-upload" size={24} color="#3B82F6" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Criar Novo Backup</Text>
              <Text style={styles.actionDescription}>Fazer backup completo ou seletivo</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/backup-history')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#10B98120' }]}>
              <Ionicons name="time" size={24} color="#10B981" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Histórico de Backups</Text>
              <Text style={styles.actionDescription}>{backups.length} backups disponíveis</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/restore')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#F59E0B20' }]}>
              <Ionicons name="cloud-download" size={24} color="#F59E0B" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Restaurar Dados</Text>
              <Text style={styles.actionDescription}>Importar backup anterior</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configurações</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Backup Automático</Text>
              <Text style={styles.settingDescription}>
                Criar backups periodicamente
              </Text>
            </View>
            <Switch
              value={autoBackupEnabled}
              onValueChange={setAutoBackupEnabled}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>

          {autoBackupEnabled && (
            <View style={styles.frequencyContainer}>
              <Text style={styles.frequencyLabel}>Frequência:</Text>
              <View style={styles.frequencyButtons}>
                {(['DAILY', 'WEEKLY', 'MONTHLY'] as BackupFrequency[]).map(freq => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.frequencyButton,
                      frequency === freq && styles.frequencyButtonActive
                    ]}
                    onPress={() => setFrequency(freq)}
                  >
                    <Text style={[
                      styles.frequencyButtonText,
                      frequency === freq && styles.frequencyButtonTextActive
                    ]}>
                      {getFrequencyLabel(freq)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Backup na Nuvem</Text>
              <Text style={styles.settingDescription}>
                Sincronizar com Google Drive
              </Text>
            </View>
            <Switch
              value={cloudBackupEnabled}
              onValueChange={setCloudBackupEnabled}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Notificações</Text>
              <Text style={styles.settingDescription}>
                Avisar ao concluir backup
              </Text>
            </View>
            <Switch
              value={notificationEnabled}
              onValueChange={setNotificationEnabled}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>
        </View>

        <Button
          title="Salvar Configurações"
          onPress={handleSave}
          style={styles.saveButton}
        />

        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={theme.colors.info} />
          <Text style={styles.infoText}>
            Os backups são armazenados localmente no dispositivo. 
            Para maior segurança, ative o backup na nuvem.
          </Text>
        </View>
      </ScrollView>
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

  statusCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },

  statusTitle: {
    ...typography.body,
    fontWeight: '700',
    color: theme.colors.text,
  },

  statusDate: {
    ...typography.body,
    color: theme.colors.text,
    marginBottom: 4,
  },

  statusSize: {
    ...typography.caption,
    color: theme.colors.textSecondary,
  },

  statusEmpty: {
    ...typography.body,
    color: theme.colors.textTertiary,
    fontStyle: 'italic',
  },

  section: {
    marginBottom: spacing.xl,
  },

  sectionTitle: {
    ...typography.h4,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: spacing.md,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  actionContent: {
    flex: 1,
  },

  actionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },

  actionDescription: {
    ...typography.caption,
    color: theme.colors.textSecondary,
  },

  settingItem: {
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

  settingContent: {
    flex: 1,
    marginRight: spacing.md,
  },

  settingTitle: {
    ...typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },

  settingDescription: {
    ...typography.caption,
    color: theme.colors.textSecondary,
  },

  frequencyContainer: {
    backgroundColor: theme.colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  frequencyLabel: {
    ...typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: spacing.sm,
  },

  frequencyButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  frequencyButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },

  frequencyButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },

  frequencyButtonText: {
    ...typography.caption,
    color: theme.colors.text,
    fontWeight: '600',
  },

  frequencyButtonTextActive: {
    color: theme.colors.surface,
  },

  saveButton: {
    marginBottom: spacing.lg,
  },

  infoCard: {
    flexDirection: 'row',
    backgroundColor: `${theme.colors.info}10`,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },

  infoText: {
    ...typography.caption,
    color: theme.colors.info,
    flex: 1,
  },
});
