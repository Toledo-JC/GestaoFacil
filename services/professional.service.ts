import { Platform } from 'react-native';
import { storageService } from './storage.service';
import { Professional } from '../types';

const STORAGE_KEY = 'professional_data';

export const professionalService = {
  async create(data: Omit<Professional, 'id' | 'createdAt'>): Promise<Professional> {
    const createdAt = new Date().toISOString();
    
    if (storageService.isWebPlatform()) {
      const professional: Professional = {
        id: 1,
        ...data,
        createdAt,
      };
      await storageService.webSet(STORAGE_KEY, professional);
      return professional;
    }

    const db = storageService.getDatabase();
    const result = await db.runAsync(
      `INSERT INTO professional (name, business_name, segment, phone, email, address, logo_uri, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.businessName || null,
        data.segment,
        data.phone || null,
        data.email || null,
        data.address || null,
        data.logoUri || null,
        createdAt,
      ]
    );

    return {
      id: result.lastInsertRowId,
      ...data,
      createdAt,
    };
  },

  async get(): Promise<Professional | null> {
    if (storageService.isWebPlatform()) {
      return await storageService.webGet<Professional>(STORAGE_KEY);
    }

    const db = storageService.getDatabase();
    const result = await db.getFirstAsync<any>(
      'SELECT * FROM professional LIMIT 1'
    );

    if (!result) return null;

    return {
      id: result.id,
      name: result.name,
      businessName: result.business_name,
      segment: result.segment,
      phone: result.phone,
      email: result.email,
      address: result.address,
      logoUri: result.logo_uri,
      createdAt: result.created_at,
    };
  },

  async update(data: Partial<Professional>): Promise<void> {
    if (storageService.isWebPlatform()) {
      const current = await storageService.webGet<Professional>(STORAGE_KEY);
      if (!current) throw new Error('Professional not found');
      await storageService.webSet(STORAGE_KEY, { ...current, ...data });
      return;
    }

    const db = storageService.getDatabase();
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.businessName !== undefined) {
      fields.push('business_name = ?');
      values.push(data.businessName);
    }
    if (data.segment !== undefined) {
      fields.push('segment = ?');
      values.push(data.segment);
    }
    if (data.phone !== undefined) {
      fields.push('phone = ?');
      values.push(data.phone);
    }
    if (data.email !== undefined) {
      fields.push('email = ?');
      values.push(data.email);
    }
    if (data.address !== undefined) {
      fields.push('address = ?');
      values.push(data.address);
    }
    if (data.logoUri !== undefined) {
      fields.push('logo_uri = ?');
      values.push(data.logoUri);
    }

    if (fields.length === 0) return;

    await db.runAsync(
      `UPDATE professional SET ${fields.join(', ')}`,
      values
    );
  },
};
