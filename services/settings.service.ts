import { storageService } from './storage.service';
import { ThemeSettings, AppLockSettings } from '../types';

const THEME_KEY = 'theme_settings';
const LOCK_KEY = 'app_lock_settings';

export const settingsService = {
  // Theme settings
  async getThemeSettings(): Promise<ThemeSettings | null> {
    if (storageService.isWebPlatform()) {
      return await storageService.webGet<ThemeSettings>(THEME_KEY);
    }

    const db = storageService.getDatabase();
    const result = await db.getFirstAsync<any>(
      "SELECT valor FROM configuracoes WHERE chave = 'theme_settings'"
    );

    if (!result) return null;
    return JSON.parse(result.valor);
  },

  async saveThemeSettings(settings: ThemeSettings): Promise<void> {
    if (storageService.isWebPlatform()) {
      await storageService.webSet(THEME_KEY, settings);
      return;
    }

    const db = storageService.getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO configuracoes (chave, valor, tipo, descricao, atualizado_em)
       VALUES ('theme_settings', ?, 'json', 'Theme customization settings', CURRENT_TIMESTAMP)`,
      [JSON.stringify(settings)]
    );
  },

  // App lock settings
  async getLockSettings(): Promise<AppLockSettings | null> {
    if (storageService.isWebPlatform()) {
      return await storageService.webGet<AppLockSettings>(LOCK_KEY);
    }

    const db = storageService.getDatabase();
    const result = await db.getFirstAsync<any>(
      "SELECT valor FROM configuracoes WHERE chave = 'app_lock_settings'"
    );

    if (!result) return null;
    return JSON.parse(result.valor);
  },

  async saveLockSettings(settings: AppLockSettings): Promise<void> {
    if (storageService.isWebPlatform()) {
      await storageService.webSet(LOCK_KEY, settings);
      return;
    }

    const db = storageService.getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO configuracoes (chave, valor, tipo, descricao, atualizado_em)
       VALUES ('app_lock_settings', ?, 'json', 'App security settings', CURRENT_TIMESTAMP)`,
      [JSON.stringify(settings)]
    );
  },

  async verifyPin(pin: string): Promise<boolean> {
    const settings = await this.getLockSettings();
    return settings?.pin === pin;
  },
};
