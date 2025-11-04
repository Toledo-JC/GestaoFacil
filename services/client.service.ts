import { storageService } from './storage.service';
import { Client, ClientFormData, ClientWithStats } from '../types';

const STORAGE_KEY = 'clients_data';

export const clientService = {
  async getAll(): Promise<Client[]> {
    if (storageService.isWebPlatform()) {
      return await storageService.webGet<Client[]>(STORAGE_KEY) || [];
    }

    const db = storageService.getDatabase();
    const results = await db.getAllAsync<any>(
      'SELECT * FROM clients ORDER BY created_at DESC'
    );

    return results.map(row => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      email: row.email,
      address: row.address,
      document: row.document,
      notes: row.notes,
      isFavorite: Boolean(row.is_favorite),
      latitude: row.latitude,
      longitude: row.longitude,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  async getWithStats(): Promise<ClientWithStats[]> {
    if (storageService.isWebPlatform()) {
      const clients = await storageService.webGet<Client[]>(STORAGE_KEY) || [];
      return clients.map(client => ({
        ...client,
        equipmentCount: 0,
        osCount: 0,
        lastOSDate: undefined,
      }));
    }

    const db = storageService.getDatabase();
    const results = await db.getAllAsync<any>(
      `SELECT 
        c.*,
        COUNT(DISTINCT e.id) as equipment_count,
        COUNT(DISTINCT os.id) as os_count,
        MAX(os.open_date) as last_os_date
       FROM clients c
       LEFT JOIN equipments e ON c.id = e.client_id
       LEFT JOIN ordens_servico os ON c.id = os.client_id
       GROUP BY c.id
       ORDER BY c.is_favorite DESC, c.created_at DESC`
    );

    return results.map(row => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      email: row.email,
      address: row.address,
      document: row.document,
      notes: row.notes,
      isFavorite: Boolean(row.is_favorite),
      latitude: row.latitude,
      longitude: row.longitude,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      equipmentCount: row.equipment_count || 0,
      osCount: row.os_count || 0,
      lastOSDate: row.last_os_date,
    }));
  },

  async getById(id: number): Promise<Client | null> {
    if (storageService.isWebPlatform()) {
      const clients = await storageService.webGet<Client[]>(STORAGE_KEY) || [];
      return clients.find(c => c.id === id) || null;
    }

    const db = storageService.getDatabase();
    const result = await db.getFirstAsync<any>(
      'SELECT * FROM clients WHERE id = ?',
      [id]
    );

    if (!result) return null;

    return {
      id: result.id,
      name: result.name,
      phone: result.phone,
      email: result.email,
      address: result.address,
      document: result.document,
      notes: result.notes,
      isFavorite: Boolean(result.is_favorite),
      latitude: result.latitude,
      longitude: result.longitude,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  },

  async create(data: ClientFormData): Promise<Client> {
    const now = new Date().toISOString();

    if (storageService.isWebPlatform()) {
      const clients = await storageService.webGet<Client[]>(STORAGE_KEY) || [];
      const newClient: Client = {
        id: clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1,
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      await storageService.webSet(STORAGE_KEY, [newClient, ...clients]);
      return newClient;
    }

    const db = storageService.getDatabase();
    const result = await db.runAsync(
      `INSERT INTO clients (
        name, phone, email, address, document, notes, is_favorite,
        latitude, longitude, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.phone || null,
        data.email || null,
        data.address || null,
        data.document || null,
        data.notes || null,
        data.isFavorite ? 1 : 0,
        data.latitude || null,
        data.longitude || null,
        now,
        now,
      ]
    );

    return {
      id: result.lastInsertRowId,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
  },

  async update(id: number, data: Partial<ClientFormData>): Promise<void> {
    const now = new Date().toISOString();

    if (storageService.isWebPlatform()) {
      const clients = await storageService.webGet<Client[]>(STORAGE_KEY) || [];
      const index = clients.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Client not found');
      clients[index] = { ...clients[index], ...data, updatedAt: now };
      await storageService.webSet(STORAGE_KEY, clients);
      return;
    }

    const db = storageService.getDatabase();
    const fields: string[] = ['updated_at = ?'];
    const values: any[] = [now];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
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
    if (data.document !== undefined) {
      fields.push('document = ?');
      values.push(data.document);
    }
    if (data.notes !== undefined) {
      fields.push('notes = ?');
      values.push(data.notes);
    }
    if (data.isFavorite !== undefined) {
      fields.push('is_favorite = ?');
      values.push(data.isFavorite ? 1 : 0);
    }
    if (data.latitude !== undefined) {
      fields.push('latitude = ?');
      values.push(data.latitude);
    }
    if (data.longitude !== undefined) {
      fields.push('longitude = ?');
      values.push(data.longitude);
    }

    values.push(id);

    await db.runAsync(
      `UPDATE clients SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  },

  async delete(id: number): Promise<void> {
    if (storageService.isWebPlatform()) {
      const clients = await storageService.webGet<Client[]>(STORAGE_KEY) || [];
      const filtered = clients.filter(c => c.id !== id);
      await storageService.webSet(STORAGE_KEY, filtered);
      return;
    }

    const db = storageService.getDatabase();
    await db.runAsync('DELETE FROM clients WHERE id = ?', [id]);
  },

  async toggleFavorite(id: number): Promise<void> {
    if (storageService.isWebPlatform()) {
      const clients = await storageService.webGet<Client[]>(STORAGE_KEY) || [];
      const index = clients.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Client not found');
      clients[index].isFavorite = !clients[index].isFavorite;
      clients[index].updatedAt = new Date().toISOString();
      await storageService.webSet(STORAGE_KEY, clients);
      return;
    }

    const db = storageService.getDatabase();
    await db.runAsync(
      `UPDATE clients 
       SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END,
           updated_at = ?
       WHERE id = ?`,
      [new Date().toISOString(), id]
    );
  },

  async search(query: string): Promise<Client[]> {
    if (storageService.isWebPlatform()) {
      const clients = await storageService.webGet<Client[]>(STORAGE_KEY) || [];
      const lowerQuery = query.toLowerCase();
      return clients.filter(c =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.phone?.toLowerCase().includes(lowerQuery) ||
        c.email?.toLowerCase().includes(lowerQuery) ||
        c.document?.toLowerCase().includes(lowerQuery)
      );
    }

    const db = storageService.getDatabase();
    const searchTerm = `%${query}%`;
    
    const results = await db.getAllAsync<any>(
      `SELECT * FROM clients 
       WHERE name LIKE ? OR phone LIKE ? OR email LIKE ? OR document LIKE ?
       ORDER BY is_favorite DESC, created_at DESC`,
      [searchTerm, searchTerm, searchTerm, searchTerm]
    );

    return results.map(row => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      email: row.email,
      address: row.address,
      document: row.document,
      notes: row.notes,
      isFavorite: Boolean(row.is_favorite),
      latitude: row.latitude,
      longitude: row.longitude,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },
};
