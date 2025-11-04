import { Platform } from 'react-native';
import { storageService } from './storage.service';
import { Supplier } from '../types';

// ============================================
// SUPPLIER SERVICE
// ============================================

export const supplierService = {
  async getAll(): Promise<Supplier[]> {
    if (Platform.OS === 'web') {
      const suppliers = await storageService.webGet<Supplier[]>('suppliers');
      return suppliers || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync('SELECT * FROM suppliers ORDER BY name');
    return rows.map(this.mapSupplier);
  },

  async getActive(): Promise<Supplier[]> {
    if (Platform.OS === 'web') {
      const suppliers = await storageService.webGet<Supplier[]>('suppliers');
      return suppliers?.filter(s => s.active) || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync('SELECT * FROM suppliers WHERE active = 1 ORDER BY name');
    return rows.map(this.mapSupplier);
  },

  async getById(id: number): Promise<Supplier | null> {
    if (Platform.OS === 'web') {
      const suppliers = await storageService.webGet<Supplier[]>('suppliers');
      return suppliers?.find(s => s.id === id) || null;
    }

    const db = storageService.getDatabase();
    const row = await db.getFirstAsync('SELECT * FROM suppliers WHERE id = ?', [id]);
    return row ? this.mapSupplier(row) : null;
  },

  async create(supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
    const now = new Date().toISOString();

    if (Platform.OS === 'web') {
      const suppliers = await storageService.webGet<Supplier[]>('suppliers') || [];
      const newSupplier: Supplier = {
        id: Date.now(),
        ...supplier,
        createdAt: now,
        updatedAt: now,
      };
      suppliers.push(newSupplier);
      await storageService.webSet('suppliers', suppliers);
      return newSupplier;
    }

    const db = storageService.getDatabase();
    const result = await db.runAsync(
      `INSERT INTO suppliers (
        name, trade_name, document, phone, email, website, address,
        contact_person, payment_terms, delivery_time_days, min_order_value,
        active, rating, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        supplier.name,
        supplier.tradeName || null,
        supplier.document || null,
        supplier.phone || null,
        supplier.email || null,
        supplier.website || null,
        supplier.address || null,
        supplier.contactPerson || null,
        supplier.paymentTerms || null,
        supplier.deliveryTimeDays || null,
        supplier.minOrderValue || null,
        supplier.active ? 1 : 0,
        supplier.rating || null,
        supplier.notes || null,
        now,
        now,
      ]
    );

    const created = await this.getById(result.lastInsertRowId);
    if (!created) throw new Error('Failed to create supplier');
    return created;
  },

  async update(id: number, data: Partial<Supplier>): Promise<void> {
    const now = new Date().toISOString();

    if (Platform.OS === 'web') {
      const suppliers = await storageService.webGet<Supplier[]>('suppliers') || [];
      const index = suppliers.findIndex(s => s.id === id);
      if (index !== -1) {
        suppliers[index] = { ...suppliers[index], ...data, updatedAt: now };
        await storageService.webSet('suppliers', suppliers);
      }
      return;
    }

    const db = storageService.getDatabase();
    const fields = Object.keys(data)
      .filter(key => key !== 'id' && key !== 'createdAt')
      .map(key => `${this.camelToSnake(key)} = ?`);
    
    const values = Object.entries(data)
      .filter(([key]) => key !== 'id' && key !== 'createdAt')
      .map(([, value]) => value);

    if (fields.length > 0) {
      await db.runAsync(
        `UPDATE suppliers SET ${fields.join(', ')}, updated_at = ? WHERE id = ?`,
        [...values, now, id]
      );
    }
  },

  async delete(id: number): Promise<void> {
    if (Platform.OS === 'web') {
      const suppliers = await storageService.webGet<Supplier[]>('suppliers') || [];
      const filtered = suppliers.filter(s => s.id !== id);
      await storageService.webSet('suppliers', filtered);
      return;
    }

    const db = storageService.getDatabase();
    await db.runAsync('DELETE FROM suppliers WHERE id = ?', [id]);
  },

  mapSupplier(row: any): Supplier {
    return {
      id: row.id,
      name: row.name,
      tradeName: row.trade_name,
      document: row.document,
      phone: row.phone,
      email: row.email,
      website: row.website,
      address: row.address,
      contactPerson: row.contact_person,
      paymentTerms: row.payment_terms,
      deliveryTimeDays: row.delivery_time_days,
      minOrderValue: row.min_order_value,
      active: Boolean(row.active),
      rating: row.rating,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  },
};
