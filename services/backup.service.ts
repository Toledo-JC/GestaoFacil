import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Backup, BackupType, BackupData, BackupProgress, BackupSettings } from '../types';
import { storageService } from './storage.service';

// ============================================
// BACKUP SERVICE - CREATE & MANAGE BACKUPS
// ============================================

const BACKUP_VERSION = '1.0.0';
const BACKUP_DIR = `${FileSystem.documentDirectory}backups/`;

const DATA_TABLES = [
  'clients',
  'equipments',
  'service_orders',
  'service_order_items',
  'service_order_photos',
  'service_order_activities',
  'service_order_collaborators',
  'budgets',
  'budget_items',
  'collaborators',
  'commissions',
  'accounts_receivable',
  'accounts_payable',
  'bank_accounts',
  'financial_categories',
  'cash_flow',
  'products',
  'product_categories',
  'suppliers',
  'stock_movements',
  'stock_alerts',
  'preventive_maintenances',
  'preventive_templates',
  'preventive_executions',
  'maintenance_notifications',
  'preventive_checklist_items',
  'whatsapp_messages',
];

const SETTINGS_TABLES = [
  'professional',
  'theme_settings',
  'app_settings',
  'backup_settings',
];

export const backupService = {
  async initialize(): Promise<void> {
    if (Platform.OS === 'web') return;

    const dirInfo = await FileSystem.getInfoAsync(BACKUP_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(BACKUP_DIR, { intermediates: true });
    }
  },

  async createBackup(
    type: BackupType,
    options: {
      compression?: boolean;
      encryption?: boolean;
      uploadToCloud?: boolean;
    } = {},
    onProgress?: (progress: BackupProgress) => void
  ): Promise<Backup> {
    if (Platform.OS === 'web') {
      throw new Error('Backup not supported on web platform');
    }

    await this.initialize();

    const db = storageService.getDatabase();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup_${type}_${timestamp}.json`;
    const filePath = `${BACKUP_DIR}${fileName}`;

    try {
      // Create backup record
      const backupResult = await db.runAsync(
        `INSERT INTO backups (backup_type, file_name, file_path, status, compression_enabled, encryption_enabled)
         VALUES (?, ?, ?, 'CREATING', ?, ?)`,
        [type, fileName, filePath, options.compression ? 1 : 0, options.encryption ? 1 : 0]
      );
      const backupId = backupResult.lastInsertRowId;

      onProgress?.({
        stage: 'PREPARING',
        progress: 0,
        message: 'Preparando backup...',
      });

      // Determine which tables to include
      const tables = this.getTablesForBackupType(type);
      const backupData: BackupData = {
        version: BACKUP_VERSION,
        backupType: type,
        timestamp: new Date().toISOString(),
        device: Platform.OS,
        tables: {},
        metadata: {
          totalRecords: 0,
          tablesCount: tables.length,
          databaseVersion: '1.0',
        },
      };

      onProgress?.({
        stage: 'EXPORTING',
        progress: 10,
        message: 'Exportando dados...',
        totalTables: tables.length,
      });

      // Export tables
      let processedTables = 0;
      for (const table of tables) {
        const rows = await db.getAllAsync(`SELECT * FROM ${table}`);
        backupData.tables[table] = rows;
        backupData.metadata.totalRecords += rows.length;

        processedTables++;
        onProgress?.({
          stage: 'EXPORTING',
          progress: 10 + (processedTables / tables.length) * 60,
          message: `Exportando ${table}...`,
          currentTable: table,
          totalTables: tables.length,
          processedRecords: backupData.metadata.totalRecords,
        });
      }

      // Export settings if needed
      if (type === 'FULL' || type === 'SETTINGS_ONLY') {
        backupData.settings = await this.exportSettings();
      }

      onProgress?.({
        stage: 'COMPRESSING',
        progress: 80,
        message: 'Finalizando backup...',
      });

      // Write to file
      const jsonData = JSON.stringify(backupData, null, 2);
      await FileSystem.writeAsStringAsync(filePath, jsonData);

      const fileInfo = await FileSystem.getInfoAsync(filePath);
      const fileSize = fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;

      // Update backup record
      await db.runAsync(
        `UPDATE backups 
         SET status = 'COMPLETED', 
             file_size = ?, 
             tables_included = ?, 
             records_count = ?,
             completed_at = datetime('now')
         WHERE id = ?`,
        [fileSize, tables.join(','), backupData.metadata.totalRecords, backupId]
      );

      onProgress?.({
        stage: 'COMPLETED',
        progress: 100,
        message: 'Backup concluído!',
      });

      // Update last backup date in settings
      await this.updateLastBackupDate();

      // Cleanup old backups
      await this.cleanupOldBackups();

      return await this.getBackupById(backupId);
    } catch (error: any) {
      await db.runAsync(
        `UPDATE backups SET status = 'FAILED', error_message = ? WHERE id = ?`,
        [error.message, backupId]
      );

      onProgress?.({
        stage: 'FAILED',
        progress: 0,
        message: `Erro: ${error.message}`,
      });

      throw error;
    }
  },

  async exportSettings(): Promise<any> {
    const db = storageService.getDatabase();
    const settings: any = {};

    // Theme settings
    const theme = await db.getFirstAsync('SELECT * FROM theme_settings LIMIT 1');
    if (theme) settings.theme = theme;

    // App settings
    const appSettings = await db.getFirstAsync('SELECT * FROM app_settings LIMIT 1');
    if (appSettings) settings.appLock = appSettings;

    // Professional
    const professional = await db.getFirstAsync('SELECT * FROM professional LIMIT 1');
    if (professional) settings.professional = professional;

    // Backup settings
    const backupSettings = await db.getFirstAsync('SELECT * FROM backup_settings LIMIT 1');
    if (backupSettings) settings.backupSettings = backupSettings;

    return settings;
  },

  getTablesForBackupType(type: BackupType): string[] {
    switch (type) {
      case 'FULL':
        return [...DATA_TABLES, ...SETTINGS_TABLES];
      case 'DATA_ONLY':
        return DATA_TABLES;
      case 'SETTINGS_ONLY':
        return SETTINGS_TABLES;
      default:
        return [];
    }
  },

  async getBackupById(id: number): Promise<Backup> {
    const db = storageService.getDatabase();
    const row = await db.getFirstAsync('SELECT * FROM backups WHERE id = ?', [id]);
    
    if (!row) {
      throw new Error('Backup not found');
    }

    return this.mapRowToBackup(row);
  },

  async getAllBackups(): Promise<Backup[]> {
    const db = storageService.getDatabase();
    const rows = await db.getAllAsync('SELECT * FROM backups ORDER BY created_at DESC');
    return rows.map(this.mapRowToBackup);
  },

  async deleteBackup(id: number): Promise<void> {
    const backup = await this.getBackupById(id);
    
    if (backup.filePath) {
      const fileInfo = await FileSystem.getInfoAsync(backup.filePath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(backup.filePath);
      }
    }

    const db = storageService.getDatabase();
    await db.runAsync('DELETE FROM backups WHERE id = ?', [id]);
  },

  async cleanupOldBackups(): Promise<void> {
    const settings = await this.getSettings();
    const backups = await this.getAllBackups();
    
    const localBackups = backups.filter(b => !b.cloudUrl);
    
    if (localBackups.length > settings.maxLocalBackups) {
      const toDelete = localBackups.slice(settings.maxLocalBackups);
      for (const backup of toDelete) {
        await this.deleteBackup(backup.id);
      }
    }
  },

  async getSettings(): Promise<BackupSettings> {
    const db = storageService.getDatabase();
    const row = await db.getFirstAsync('SELECT * FROM backup_settings LIMIT 1');
    
    if (!row) {
      // Create default settings
      await db.runAsync(
        `INSERT INTO backup_settings (auto_backup_enabled, backup_type, max_local_backups)
         VALUES (0, 'FULL', 5)`
      );
      return await this.getSettings();
    }

    return this.mapRowToSettings(row);
  },

  async updateSettings(settings: Partial<BackupSettings>): Promise<void> {
    const db = storageService.getDatabase();
    const current = await this.getSettings();

    const updates: string[] = [];
    const values: any[] = [];

    if (settings.autoBackupEnabled !== undefined) {
      updates.push('auto_backup_enabled = ?');
      values.push(settings.autoBackupEnabled ? 1 : 0);
    }
    if (settings.backupFrequency) {
      updates.push('backup_frequency = ?');
      values.push(settings.backupFrequency);
    }
    if (settings.backupTime) {
      updates.push('backup_time = ?');
      values.push(settings.backupTime);
    }
    if (settings.backupType) {
      updates.push('backup_type = ?');
      values.push(settings.backupType);
    }
    if (settings.maxLocalBackups !== undefined) {
      updates.push('max_local_backups = ?');
      values.push(settings.maxLocalBackups);
    }
    if (settings.cloudBackupEnabled !== undefined) {
      updates.push('cloud_backup_enabled = ?');
      values.push(settings.cloudBackupEnabled ? 1 : 0);
    }
    if (settings.cloudProvider) {
      updates.push('cloud_provider = ?');
      values.push(settings.cloudProvider);
    }
    if (settings.compressionEnabled !== undefined) {
      updates.push('compression_enabled = ?');
      values.push(settings.compressionEnabled ? 1 : 0);
    }
    if (settings.encryptionEnabled !== undefined) {
      updates.push('encryption_enabled = ?');
      values.push(settings.encryptionEnabled ? 1 : 0);
    }
    if (settings.notificationEnabled !== undefined) {
      updates.push('notification_enabled = ?');
      values.push(settings.notificationEnabled ? 1 : 0);
    }

    if (updates.length > 0) {
      updates.push('updated_at = datetime("now")');
      await db.runAsync(
        `UPDATE backup_settings SET ${updates.join(', ')} WHERE id = ?`,
        [...values, current.id]
      );
    }
  },

  async updateLastBackupDate(): Promise<void> {
    const db = storageService.getDatabase();
    await db.runAsync(
      `UPDATE backup_settings SET last_backup_at = datetime('now')`
    );
  },

  async shareBackup(backupId: number): Promise<string> {
    const backup = await this.getBackupById(backupId);
    
    if (!backup.filePath) {
      throw new Error('Backup file not found');
    }

    return backup.filePath;
  },

  mapRowToBackup(row: any): Backup {
    return {
      id: row.id,
      backupType: row.backup_type,
      fileName: row.file_name,
      filePath: row.file_path,
      fileSize: row.file_size,
      cloudUrl: row.cloud_url,
      cloudProvider: row.cloud_provider,
      status: row.status,
      compressionEnabled: row.compression_enabled === 1,
      encryptionEnabled: row.encryption_enabled === 1,
      tablesIncluded: row.tables_included,
      recordsCount: row.records_count,
      errorMessage: row.error_message,
      createdAt: row.created_at,
      completedAt: row.completed_at,
    };
  },

  mapRowToSettings(row: any): BackupSettings {
    return {
      id: row.id,
      autoBackupEnabled: row.auto_backup_enabled === 1,
      backupFrequency: row.backup_frequency,
      backupTime: row.backup_time,
      backupType: row.backup_type,
      maxLocalBackups: row.max_local_backups,
      cloudBackupEnabled: row.cloud_backup_enabled === 1,
      cloudProvider: row.cloud_provider,
      lastBackupAt: row.last_backup_at,
      nextBackupAt: row.next_backup_at,
      compressionEnabled: row.compression_enabled === 1,
      encryptionEnabled: row.encryption_enabled === 1,
      notificationEnabled: row.notification_enabled === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },
};
