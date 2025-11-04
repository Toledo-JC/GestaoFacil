import { storageService } from './storage.service';
import { Equipment, EquipmentFormData, EquipmentWithStats } from '../types';

const STORAGE_KEY = 'equipments_data';

export const equipmentService = {
  async getAll(): Promise<Equipment[]> {
    if (storageService.isWebPlatform()) {
      return await storageService.webGet<Equipment[]>(STORAGE_KEY) || [];
    }

    const db = storageService.getDatabase();
    const results = await db.getAllAsync<any>(
      'SELECT * FROM equipments ORDER BY created_at DESC'
    );

    return results.map(row => ({
      id: row.id,
      clientId: row.client_id,
      type: row.type,
      brand: row.brand,
      model: row.model,
      serialNumber: row.serial_number,
      yearManufacture: row.year_manufacture,
      technicalData: row.technical_data ? JSON.parse(row.technical_data) : undefined,
      notes: row.notes,
      photos: row.photos ? JSON.parse(row.photos) : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  async getByClientId(clientId: number): Promise<Equipment[]> {
    if (storageService.isWebPlatform()) {
      const equipments = await storageService.webGet<Equipment[]>(STORAGE_KEY) || [];
      return equipments.filter(e => e.clientId === clientId);
    }

    const db = storageService.getDatabase();
    const results = await db.getAllAsync<any>(
      'SELECT * FROM equipments WHERE client_id = ? ORDER BY created_at DESC',
      [clientId]
    );

    return results.map(row => ({
      id: row.id,
      clientId: row.client_id,
      type: row.type,
      brand: row.brand,
      model: row.model,
      serialNumber: row.serial_number,
      yearManufacture: row.year_manufacture,
      technicalData: row.technical_data ? JSON.parse(row.technical_data) : undefined,
      notes: row.notes,
      photos: row.photos ? JSON.parse(row.photos) : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  async getById(id: number): Promise<Equipment | null> {
    if (storageService.isWebPlatform()) {
      const equipments = await storageService.webGet<Equipment[]>(STORAGE_KEY) || [];
      return equipments.find(e => e.id === id) || null;
    }

    const db = storageService.getDatabase();
    const result = await db.getFirstAsync<any>(
      'SELECT * FROM equipments WHERE id = ?',
      [id]
    );

    if (!result) return null;

    return {
      id: result.id,
      clientId: result.client_id,
      type: result.type,
      brand: result.brand,
      model: result.model,
      serialNumber: result.serial_number,
      yearManufacture: result.year_manufacture,
      technicalData: result.technical_data ? JSON.parse(result.technical_data) : undefined,
      notes: result.notes,
      photos: result.photos ? JSON.parse(result.photos) : [],
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  },

  async getWithStats(clientId?: number): Promise<EquipmentWithStats[]> {
    if (storageService.isWebPlatform()) {
      const equipments = await storageService.webGet<Equipment[]>(STORAGE_KEY) || [];
      const filtered = clientId ? equipments.filter(e => e.clientId === clientId) : equipments;
      
      return filtered.map(equipment => ({
        ...equipment,
        osCount: 0,
        lastOSDate: undefined,
        clientName: undefined,
      }));
    }

    const db = storageService.getDatabase();
    
    const query = clientId
      ? `SELECT 
           e.*,
           c.name as client_name,
           COUNT(DISTINCT os.id) as os_count,
           MAX(os.open_date) as last_os_date
         FROM equipments e
         LEFT JOIN clients c ON e.client_id = c.id
         LEFT JOIN ordens_servico os ON e.id = os.equipment_id
         WHERE e.client_id = ?
         GROUP BY e.id
         ORDER BY e.created_at DESC`
      : `SELECT 
           e.*,
           c.name as client_name,
           COUNT(DISTINCT os.id) as os_count,
           MAX(os.open_date) as last_os_date
         FROM equipments e
         LEFT JOIN clients c ON e.client_id = c.id
         LEFT JOIN ordens_servico os ON e.id = os.equipment_id
         GROUP BY e.id
         ORDER BY e.created_at DESC`;

    const params = clientId ? [clientId] : [];
    const results = await db.getAllAsync<any>(query, params);

    return results.map(row => ({
      id: row.id,
      clientId: row.client_id,
      type: row.type,
      brand: row.brand,
      model: row.model,
      serialNumber: row.serial_number,
      yearManufacture: row.year_manufacture,
      technicalData: row.technical_data ? JSON.parse(row.technical_data) : undefined,
      notes: row.notes,
      photos: row.photos ? JSON.parse(row.photos) : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      osCount: row.os_count || 0,
      lastOSDate: row.last_os_date,
      clientName: row.client_name,
    }));
  },

  async create(data: EquipmentFormData): Promise<Equipment> {
    const now = new Date().toISOString();

    if (storageService.isWebPlatform()) {
      const equipments = await storageService.webGet<Equipment[]>(STORAGE_KEY) || [];
      const newEquipment: Equipment = {
        id: equipments.length > 0 ? Math.max(...equipments.map(e => e.id)) + 1 : 1,
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      await storageService.webSet(STORAGE_KEY, [newEquipment, ...equipments]);
      return newEquipment;
    }

    const db = storageService.getDatabase();
    const result = await db.runAsync(
      `INSERT INTO equipments (
        client_id, type, brand, model, serial_number, year_manufacture,
        technical_data, notes, photos, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.clientId,
        data.type,
        data.brand || null,
        data.model || null,
        data.serialNumber || null,
        data.yearManufacture || null,
        data.technicalData ? JSON.stringify(data.technicalData) : null,
        data.notes || null,
        data.photos ? JSON.stringify(data.photos) : JSON.stringify([]),
        now,
        now,
      ]
    );

    return {
      id: result.lastInsertRowId,
      ...data,
      photos: data.photos || [],
      createdAt: now,
      updatedAt: now,
    };
  },

  async update(id: number, data: Partial<EquipmentFormData>): Promise<void> {
    const now = new Date().toISOString();

    if (storageService.isWebPlatform()) {
      const equipments = await storageService.webGet<Equipment[]>(STORAGE_KEY) || [];
      const index = equipments.findIndex(e => e.id === id);
      if (index === -1) throw new Error('Equipment not found');
      equipments[index] = { ...equipments[index], ...data, updatedAt: now };
      await storageService.webSet(STORAGE_KEY, equipments);
      return;
    }

    const db = storageService.getDatabase();
    const fields: string[] = ['updated_at = ?'];
    const values: any[] = [now];

    if (data.type !== undefined) {
      fields.push('type = ?');
      values.push(data.type);
    }
    if (data.brand !== undefined) {
      fields.push('brand = ?');
      values.push(data.brand);
    }
    if (data.model !== undefined) {
      fields.push('model = ?');
      values.push(data.model);
    }
    if (data.serialNumber !== undefined) {
      fields.push('serial_number = ?');
      values.push(data.serialNumber);
    }
    if (data.yearManufacture !== undefined) {
      fields.push('year_manufacture = ?');
      values.push(data.yearManufacture);
    }
    if (data.technicalData !== undefined) {
      fields.push('technical_data = ?');
      values.push(JSON.stringify(data.technicalData));
    }
    if (data.notes !== undefined) {
      fields.push('notes = ?');
      values.push(data.notes);
    }
    if (data.photos !== undefined) {
      fields.push('photos = ?');
      values.push(JSON.stringify(data.photos));
    }

    values.push(id);

    await db.runAsync(
      `UPDATE equipments SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  },

  async delete(id: number): Promise<void> {
    if (storageService.isWebPlatform()) {
      const equipments = await storageService.webGet<Equipment[]>(STORAGE_KEY) || [];
      const filtered = equipments.filter(e => e.id !== id);
      await storageService.webSet(STORAGE_KEY, filtered);
      return;
    }

    const db = storageService.getDatabase();
    await db.runAsync('DELETE FROM equipments WHERE id = ?', [id]);
  },

  async search(query: string, clientId?: number): Promise<Equipment[]> {
    if (storageService.isWebPlatform()) {
      const equipments = await storageService.webGet<Equipment[]>(STORAGE_KEY) || [];
      const lowerQuery = query.toLowerCase();
      const filtered = clientId ? equipments.filter(e => e.clientId === clientId) : equipments;
      
      return filtered.filter(e =>
        e.type.toLowerCase().includes(lowerQuery) ||
        e.brand?.toLowerCase().includes(lowerQuery) ||
        e.model?.toLowerCase().includes(lowerQuery) ||
        e.serialNumber?.toLowerCase().includes(lowerQuery)
      );
    }

    const db = storageService.getDatabase();
    const searchTerm = `%${query}%`;
    
    const queryStr = clientId
      ? `SELECT * FROM equipments 
         WHERE (type LIKE ? OR brand LIKE ? OR model LIKE ? OR serial_number LIKE ?)
           AND client_id = ?
         ORDER BY created_at DESC`
      : `SELECT * FROM equipments 
         WHERE type LIKE ? OR brand LIKE ? OR model LIKE ? OR serial_number LIKE ?
         ORDER BY created_at DESC`;

    const params = clientId
      ? [searchTerm, searchTerm, searchTerm, searchTerm, clientId]
      : [searchTerm, searchTerm, searchTerm, searchTerm];

    const results = await db.getAllAsync<any>(queryStr, params);

    return results.map(row => ({
      id: row.id,
      clientId: row.client_id,
      type: row.type,
      brand: row.brand,
      model: row.model,
      serialNumber: row.serial_number,
      yearManufacture: row.year_manufacture,
      technicalData: row.technical_data ? JSON.parse(row.technical_data) : undefined,
      notes: row.notes,
      photos: row.photos ? JSON.parse(row.photos) : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  async getCountByClient(clientId: number): Promise<number> {
    if (storageService.isWebPlatform()) {
      const equipments = await storageService.webGet<Equipment[]>(STORAGE_KEY) || [];
      return equipments.filter(e => e.clientId === clientId).length;
    }

    const db = storageService.getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM equipments WHERE client_id = ?',
      [clientId]
    );

    return result?.count || 0;
  },
};
