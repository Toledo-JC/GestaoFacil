import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { 
  BackupData, 
  RestoreType, 
  RestoreOptions, 
  RestoreProgress, 
  RestoreResult 
} from '../types';
import { storageService } from './storage.service';
import { backupService } from './backup.service';

// ============================================
// RESTORE SERVICE - RESTORE FROM BACKUPS
// ============================================

export const restoreService = {
  async restoreFromBackup(
    backupId: number,
    options: RestoreOptions,
    onProgress?: (progress: RestoreProgress) => void
  ): Promise<RestoreResult> {
    if (Platform.OS === 'web') {
      throw new Error('Restore not supported on web platform');
    }

    const db = storageService.getDatabase();
    const result: RestoreResult = {
      success: false,
      restoredTables: [],
      restoredRecords: 0,
      errors: [],
    };

    try {
      // Get backup
      const backup = await backupService.getBackupById(backupId);
      
      if (!backup.filePath) {
        throw new Error('Backup file path not found');
      }

      onProgress?.({
        stage: 'VALIDATING',
        progress: 0,
        message: 'Validando backup...',
      });

      // Read backup file
      const fileContent = await FileSystem.readAsStringAsync(backup.filePath);
      const backupData: BackupData = JSON.parse(fileContent);

      if (options.validateData) {
        this.validateBackupData(backupData);
      }

      onProgress?.({
        stage: 'VALIDATING',
        progress: 10,
        message: 'Backup válido!',
      });

      // Create safety backup before restore
      if (options.createBackupBeforeRestore) {
        onProgress?.({
          stage: 'BACKING_UP',
          progress: 15,
          message: 'Criando backup de segurança...',
        });

        const safetyBackup = await backupService.createBackup('FULL', {}, (progress) => {
          onProgress?.({
            stage: 'BACKING_UP',
            progress: 15 + (progress.progress * 0.2),
            message: progress.message,
          });
        });

        result.backupCreated = true;
        result.backupId = safetyBackup.id;
      }

      // Clear data if needed
      if (options.overwriteExisting) {
        onProgress?.({
          stage: 'CLEARING',
          progress: 40,
          message: 'Limpando dados existentes...',
        });

        await this.clearDataForRestoreType(options.restoreType);
      }

      // Restore data
      onProgress?.({
        stage: 'IMPORTING',
        progress: 50,
        message: 'Importando dados...',
      });

      const tablesToRestore = this.getTablesForRestoreType(options.restoreType, backupData);
      const totalRecords = this.getTotalRecords(backupData, tablesToRestore);
      
      let importedRecords = 0;
      let processedTables = 0;

      for (const table of tablesToRestore) {
        const records = backupData.tables[table] || [];
        
        if (records.length === 0) continue;

        try {
          await this.restoreTable(table, records, options.overwriteExisting);
          result.restoredTables.push(table);
          importedRecords += records.length;
          processedTables++;

          onProgress?.({
            stage: 'IMPORTING',
            progress: 50 + (processedTables / tablesToRestore.length) * 45,
            message: `Importando ${table}...`,
            currentTable: table,
            totalTables: tablesToRestore.length,
            importedRecords,
            totalRecords,
          });
        } catch (error: any) {
          result.errors.push(`${table}: ${error.message}`);
        }
      }

      // Restore settings if needed
      if ((options.restoreType === 'FULL' || options.restoreType === 'SETTINGS_ONLY') && backupData.settings) {
        await this.restoreSettings(backupData.settings);
      }

      result.restoredRecords = importedRecords;
      result.success = result.errors.length === 0;

      onProgress?.({
        stage: 'COMPLETED',
        progress: 100,
        message: 'Restauração concluída!',
      });

      return result;
    } catch (error: any) {
      result.errors.push(error.message);

      onProgress?.({
        stage: 'FAILED',
        progress: 0,
        message: `Erro: ${error.message}`,
      });

      return result;
    }
  },

  async restoreFromFile(
    filePath: string,
    options: RestoreOptions,
    onProgress?: (progress: RestoreProgress) => void
  ): Promise<RestoreResult> {
    if (Platform.OS === 'web') {
      throw new Error('Restore not supported on web platform');
    }

    const result: RestoreResult = {
      success: false,
      restoredTables: [],
      restoredRecords: 0,
      errors: [],
    };

    try {
      onProgress?.({
        stage: 'VALIDATING',
        progress: 0,
        message: 'Validando arquivo...',
      });

      // Read and validate file
      const fileContent = await FileSystem.readAsStringAsync(filePath);
      const backupData: BackupData = JSON.parse(fileContent);

      if (options.validateData) {
        this.validateBackupData(backupData);
      }

      // Import backup record
      const db = storageService.getDatabase();
      const timestamp = new Date().toISOString();
      const fileName = filePath.split('/').pop() || `imported_${timestamp}.json`;

      const importResult = await db.runAsync(
        `INSERT INTO backups (backup_type, file_name, file_path, status, records_count, completed_at)
         VALUES (?, ?, ?, 'COMPLETED', ?, ?)`,
        [backupData.backupType, fileName, filePath, backupData.metadata.totalRecords, timestamp]
      );

      // Restore using backup ID
      return await this.restoreFromBackup(importResult.lastInsertRowId, options, onProgress);
    } catch (error: any) {
      result.errors.push(error.message);

      onProgress?.({
        stage: 'FAILED',
        progress: 0,
        message: `Erro: ${error.message}`,
      });

      return result;
    }
  },

  validateBackupData(data: BackupData): void {
    if (!data.version) {
      throw new Error('Versão do backup não encontrada');
    }

    if (!data.backupType) {
      throw new Error('Tipo de backup inválido');
    }

    if (!data.tables) {
      throw new Error('Dados de tabelas não encontrados');
    }

    if (!data.metadata) {
      throw new Error('Metadados do backup não encontrados');
    }
  },

  getTablesForRestoreType(restoreType: RestoreType, backupData: BackupData): string[] {
    const availableTables = Object.keys(backupData.tables);

    switch (restoreType) {
      case 'FULL':
        return availableTables;
      
      case 'DATA_ONLY':
        return availableTables.filter(table => 
          !['professional', 'theme_settings', 'app_settings', 'backup_settings'].includes(table)
        );
      
      case 'SETTINGS_ONLY':
        return availableTables.filter(table => 
          ['professional', 'theme_settings', 'app_settings', 'backup_settings'].includes(table)
        );
      
      default:
        return [];
    }
  },

  getTotalRecords(backupData: BackupData, tables: string[]): number {
    return tables.reduce((total, table) => {
      const records = backupData.tables[table] || [];
      return total + records.length;
    }, 0);
  },

  async clearDataForRestoreType(restoreType: RestoreType): Promise<void> {
    const db = storageService.getDatabase();

    const dataTablesOrder = [
      'service_order_collaborators',
      'service_order_activities',
      'service_order_photos',
      'service_order_items',
      'service_orders',
      'budget_items',
      'budgets',
      'commissions',
      'preventive_checklist_items',
      'maintenance_notifications',
      'preventive_executions',
      'preventive_maintenances',
      'preventive_templates',
      'stock_alerts',
      'stock_movements',
      'products',
      'product_categories',
      'suppliers',
      'cash_flow',
      'accounts_payable',
      'accounts_receivable',
      'financial_categories',
      'bank_accounts',
      'collaborators',
      'equipments',
      'clients',
      'whatsapp_messages',
    ];

    const settingsTables = [
      'backup_settings',
      'app_settings',
      'theme_settings',
      'professional',
    ];

    if (restoreType === 'FULL') {
      for (const table of [...dataTablesOrder, ...settingsTables]) {
        await db.runAsync(`DELETE FROM ${table}`);
      }
    } else if (restoreType === 'DATA_ONLY') {
      for (const table of dataTablesOrder) {
        await db.runAsync(`DELETE FROM ${table}`);
      }
    } else if (restoreType === 'SETTINGS_ONLY') {
      for (const table of settingsTables) {
        await db.runAsync(`DELETE FROM ${table}`);
      }
    }
  },

  async restoreTable(table: string, records: any[], overwrite: boolean): Promise<void> {
    const db = storageService.getDatabase();

    if (overwrite) {
      await db.runAsync(`DELETE FROM ${table}`);
    }

    for (const record of records) {
      const columns = Object.keys(record).filter(key => key !== 'id');
      const values = columns.map(col => record[col]);
      const placeholders = columns.map(() => '?').join(', ');

      await db.runAsync(
        `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
        values
      );
    }
  },

  async restoreSettings(settings: any): Promise<void> {
    const db = storageService.getDatabase();

    if (settings.theme) {
      await db.runAsync('DELETE FROM theme_settings');
      const { id, ...themeData } = settings.theme;
      const columns = Object.keys(themeData);
      const values = columns.map(col => themeData[col]);
      await db.runAsync(
        `INSERT INTO theme_settings (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
        values
      );
    }

    if (settings.appLock) {
      await db.runAsync('DELETE FROM app_settings');
      const { id, ...appData } = settings.appLock;
      const columns = Object.keys(appData);
      const values = columns.map(col => appData[col]);
      await db.runAsync(
        `INSERT INTO app_settings (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
        values
      );
    }

    if (settings.professional) {
      await db.runAsync('DELETE FROM professional');
      const { id, ...profData } = settings.professional;
      const columns = Object.keys(profData);
      const values = columns.map(col => profData[col]);
      await db.runAsync(
        `INSERT INTO professional (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
        values
      );
    }
  },
};
