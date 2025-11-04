import { Platform } from 'react-native';
import { storageService } from './storage.service';
import { StockAlert } from '../types';
import { productService } from './product.service';

// ============================================
// STOCK ALERT SERVICE
// ============================================

export const stockAlertService = {
  async getAll(): Promise<StockAlert[]> {
    if (Platform.OS === 'web') {
      const alerts = await storageService.webGet<StockAlert[]>('stock_alerts');
      return alerts || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync('SELECT * FROM stock_alerts ORDER BY created_at DESC');
    return rows.map(this.mapAlert);
  },

  async getPending(): Promise<StockAlert[]> {
    if (Platform.OS === 'web') {
      const alerts = await storageService.webGet<StockAlert[]>('stock_alerts');
      return alerts?.filter(a => !a.acknowledged) || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync(
      'SELECT * FROM stock_alerts WHERE acknowledged = 0 ORDER BY severity DESC, created_at DESC'
    );
    return rows.map(this.mapAlert);
  },

  async getByProduct(productId: number): Promise<StockAlert[]> {
    if (Platform.OS === 'web') {
      const alerts = await storageService.webGet<StockAlert[]>('stock_alerts');
      return alerts?.filter(a => a.productId === productId) || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync(
      'SELECT * FROM stock_alerts WHERE product_id = ? ORDER BY created_at DESC',
      [productId]
    );
    return rows.map(this.mapAlert);
  },

  async create(alert: Omit<StockAlert, 'id' | 'createdAt'>): Promise<StockAlert> {
    const now = new Date().toISOString();

    if (Platform.OS === 'web') {
      const alerts = await storageService.webGet<StockAlert[]>('stock_alerts') || [];
      const newAlert: StockAlert = {
        id: Date.now(),
        ...alert,
        createdAt: now,
      };
      alerts.push(newAlert);
      await storageService.webSet('stock_alerts', alerts);
      return newAlert;
    }

    const db = storageService.getDatabase();
    const result = await db.runAsync(
      `INSERT INTO stock_alerts (
        product_id, type, severity, message, current_value, threshold_value,
        acknowledged, acknowledged_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        alert.productId,
        alert.type,
        alert.severity,
        alert.message,
        alert.currentValue || null,
        alert.thresholdValue || null,
        alert.acknowledged ? 1 : 0,
        alert.acknowledgedAt || null,
        now,
      ]
    );

    const alerts = await this.getAll();
    const created = alerts.find(a => a.id === result.lastInsertRowId);
    if (!created) throw new Error('Failed to create alert');
    return created;
  },

  async acknowledge(id: number): Promise<void> {
    const now = new Date().toISOString();

    if (Platform.OS === 'web') {
      const alerts = await storageService.webGet<StockAlert[]>('stock_alerts') || [];
      const index = alerts.findIndex(a => a.id === id);
      if (index !== -1) {
        alerts[index].acknowledged = true;
        alerts[index].acknowledgedAt = now;
        await storageService.webSet('stock_alerts', alerts);
      }
      return;
    }

    const db = storageService.getDatabase();
    await db.runAsync(
      'UPDATE stock_alerts SET acknowledged = 1, acknowledged_at = ? WHERE id = ?',
      [now, id]
    );
  },

  async checkAndCreateAlerts(): Promise<void> {
    const products = await productService.getAll();
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringThreshold = thirtyDaysFromNow.toISOString().split('T')[0];

    for (const product of products) {
      if (!product.active) continue;

      // Check for low stock
      if (product.trackStock && product.stockQuantity > 0 && product.stockQuantity <= product.minStock) {
        await this.createIfNotExists(product.id, 'LOW_STOCK', {
          severity: product.stockQuantity === 0 ? 'CRITICAL' : 'WARNING',
          message: `Estoque baixo: ${product.stockQuantity} ${product.unit} (mínimo: ${product.minStock})`,
          currentValue: product.stockQuantity,
          thresholdValue: product.minStock,
        });
      }

      // Check for no stock
      if (product.trackStock && product.stockQuantity === 0) {
        await this.createIfNotExists(product.id, 'NO_STOCK', {
          severity: 'CRITICAL',
          message: `Produto sem estoque`,
          currentValue: 0,
          thresholdValue: product.minStock,
        });
      }

      // Check for expiring products
      if (product.expirationDate && product.expirationDate <= expiringThreshold && product.expirationDate >= today) {
        const daysUntilExpiration = Math.ceil(
          (new Date(product.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        await this.createIfNotExists(product.id, 'EXPIRING_SOON', {
          severity: daysUntilExpiration <= 7 ? 'CRITICAL' : 'WARNING',
          message: `Produto vence em ${daysUntilExpiration} dias`,
          currentValue: daysUntilExpiration,
          thresholdValue: 30,
        });
      }

      // Check for expired products
      if (product.expirationDate && product.expirationDate < today) {
        await this.createIfNotExists(product.id, 'EXPIRED', {
          severity: 'CRITICAL',
          message: `Produto vencido`,
        });
      }
    }
  },

  async createIfNotExists(
    productId: number,
    type: StockAlert['type'],
    data: Partial<StockAlert>
  ): Promise<void> {
    const existing = await this.getByProduct(productId);
    const hasUnacknowledged = existing.some(a => 
      a.type === type && !a.acknowledged
    );

    if (!hasUnacknowledged) {
      await this.create({
        productId,
        type,
        severity: data.severity || 'WARNING',
        message: data.message || '',
        currentValue: data.currentValue,
        thresholdValue: data.thresholdValue,
        acknowledged: false,
      });
    }
  },

  mapAlert(row: any): StockAlert {
    return {
      id: row.id,
      productId: row.product_id,
      type: row.type,
      severity: row.severity,
      message: row.message,
      currentValue: row.current_value,
      thresholdValue: row.threshold_value,
      acknowledged: Boolean(row.acknowledged),
      acknowledgedAt: row.acknowledged_at,
      createdAt: row.created_at,
    };
  },
};
