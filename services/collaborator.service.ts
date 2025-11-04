import { Platform } from 'react-native';
import { storageService } from './storage.service';
import { Collaborator, CollaboratorFormData, CollaboratorWithStats } from '../types';

/**
 * Collaborator Service - Gestão de colaboradores
 * Arquitetura: Service → Hook → Component
 */

const STORAGE_KEY = 'collaborators';
const ID_KEY = 'collaborator_next_id';

export const collaboratorService = {
  async getAll(): Promise<Collaborator[]> {
    if (Platform.OS === 'web') {
      const data = await storageService.webGet<Collaborator[]>(STORAGE_KEY);
      return data || [];
    }

    try {
      const db = storageService.getDatabase();
      const result = await db.getAllAsync<Collaborator>(
        'SELECT * FROM colaboradores ORDER BY name ASC'
      );
      return result || [];
    } catch (error) {
      console.error('[CollaboratorService] Error getting all:', error);
      return [];
    }
  },

  async getById(id: number): Promise<Collaborator | null> {
    if (Platform.OS === 'web') {
      const all = await this.getAll();
      return all.find(c => c.id === id) || null;
    }

    try {
      const db = storageService.getDatabase();
      const result = await db.getFirstAsync<Collaborator>(
        'SELECT * FROM colaboradores WHERE id = ?',
        [id]
      );
      return result || null;
    } catch (error) {
      console.error('[CollaboratorService] Error getting by id:', error);
      return null;
    }
  },

  async getActive(): Promise<Collaborator[]> {
    if (Platform.OS === 'web') {
      const all = await this.getAll();
      return all.filter(c => c.active);
    }

    try {
      const db = storageService.getDatabase();
      const result = await db.getAllAsync<Collaborator>(
        'SELECT * FROM colaboradores WHERE active = 1 ORDER BY name ASC'
      );
      return result || [];
    } catch (error) {
      console.error('[CollaboratorService] Error getting active:', error);
      return [];
    }
  },

  async getByType(type: string): Promise<Collaborator[]> {
    if (Platform.OS === 'web') {
      const all = await this.getAll();
      return all.filter(c => c.type === type);
    }

    try {
      const db = storageService.getDatabase();
      const result = await db.getAllAsync<Collaborator>(
        'SELECT * FROM colaboradores WHERE type = ? ORDER BY name ASC',
        [type]
      );
      return result || [];
    } catch (error) {
      console.error('[CollaboratorService] Error getting by type:', error);
      return [];
    }
  },

  async getWithStats(): Promise<CollaboratorWithStats[]> {
    const collaborators = await this.getAll();
    
    // Get commission stats for each collaborator
    const stats = await Promise.all(
      collaborators.map(async (collaborator) => {
        const commissions = await this.getCommissionStats(collaborator.id);
        return {
          ...collaborator,
          ...commissions,
        };
      })
    );

    return stats;
  },

  async getCommissionStats(collaboratorId: number): Promise<{
    totalCommissions: number;
    pendingCommissions: number;
    paidCommissions: number;
    serviceCount: number;
  }> {
    if (Platform.OS === 'web') {
      // Web fallback - simplified stats
      return {
        totalCommissions: 0,
        pendingCommissions: 0,
        paidCommissions: 0,
        serviceCount: 0,
      };
    }

    try {
      const db = storageService.getDatabase();
      const result = await db.getFirstAsync<any>(
        `SELECT 
          COUNT(*) as serviceCount,
          COALESCE(SUM(commission_value), 0) as totalCommissions,
          COALESCE(SUM(CASE WHEN status = 'Pendente' THEN commission_value ELSE 0 END), 0) as pendingCommissions,
          COALESCE(SUM(CASE WHEN status = 'Pago' THEN commission_value ELSE 0 END), 0) as paidCommissions
        FROM commissions 
        WHERE collaborator_id = ?`,
        [collaboratorId]
      );

      return {
        totalCommissions: result?.totalCommissions || 0,
        pendingCommissions: result?.pendingCommissions || 0,
        paidCommissions: result?.paidCommissions || 0,
        serviceCount: result?.serviceCount || 0,
      };
    } catch (error) {
      console.error('[CollaboratorService] Error getting commission stats:', error);
      return {
        totalCommissions: 0,
        pendingCommissions: 0,
        paidCommissions: 0,
        serviceCount: 0,
      };
    }
  },

  async create(data: CollaboratorFormData): Promise<Collaborator> {
    const now = new Date().toISOString();

    if (Platform.OS === 'web') {
      const all = await this.getAll();
      const nextId = await storageService.webGet<number>(ID_KEY) || 1;
      
      const newCollaborator: Collaborator = {
        id: nextId,
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      await storageService.webSet(STORAGE_KEY, [...all, newCollaborator]);
      await storageService.webSet(ID_KEY, nextId + 1);
      
      return newCollaborator;
    }

    try {
      const db = storageService.getDatabase();
      const result = await db.runAsync(
        `INSERT INTO colaboradores (
          name, type, phone, email, document,
          bank_name, bank_agency, bank_account, pix_key,
          commission_percentage, fixed_salary, daily_rate,
          active, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.name,
          data.type,
          data.phone || null,
          data.email || null,
          data.document || null,
          data.bankName || null,
          data.bankAgency || null,
          data.bankAccount || null,
          data.pixKey || null,
          data.commissionPercentage,
          data.fixedSalary,
          data.dailyRate,
          data.active ? 1 : 0,
          data.notes || null,
          now,
          now,
        ]
      );

      const created = await this.getById(result.lastInsertRowId);
      if (!created) throw new Error('Failed to retrieve created collaborator');
      
      return created;
    } catch (error) {
      console.error('[CollaboratorService] Error creating:', error);
      throw error;
    }
  },

  async update(id: number, data: Partial<CollaboratorFormData>): Promise<Collaborator> {
    const now = new Date().toISOString();

    if (Platform.OS === 'web') {
      const all = await this.getAll();
      const index = all.findIndex(c => c.id === id);
      
      if (index === -1) throw new Error('Collaborator not found');

      const updated: Collaborator = {
        ...all[index],
        ...data,
        updatedAt: now,
      };

      all[index] = updated;
      await storageService.webSet(STORAGE_KEY, all);
      
      return updated;
    }

    try {
      const db = storageService.getDatabase();
      
      const fields: string[] = [];
      const values: any[] = [];

      if (data.name !== undefined) {
        fields.push('name = ?');
        values.push(data.name);
      }
      if (data.type !== undefined) {
        fields.push('type = ?');
        values.push(data.type);
      }
      if (data.phone !== undefined) {
        fields.push('phone = ?');
        values.push(data.phone || null);
      }
      if (data.email !== undefined) {
        fields.push('email = ?');
        values.push(data.email || null);
      }
      if (data.document !== undefined) {
        fields.push('document = ?');
        values.push(data.document || null);
      }
      if (data.bankName !== undefined) {
        fields.push('bank_name = ?');
        values.push(data.bankName || null);
      }
      if (data.bankAgency !== undefined) {
        fields.push('bank_agency = ?');
        values.push(data.bankAgency || null);
      }
      if (data.bankAccount !== undefined) {
        fields.push('bank_account = ?');
        values.push(data.bankAccount || null);
      }
      if (data.pixKey !== undefined) {
        fields.push('pix_key = ?');
        values.push(data.pixKey || null);
      }
      if (data.commissionPercentage !== undefined) {
        fields.push('commission_percentage = ?');
        values.push(data.commissionPercentage);
      }
      if (data.fixedSalary !== undefined) {
        fields.push('fixed_salary = ?');
        values.push(data.fixedSalary);
      }
      if (data.dailyRate !== undefined) {
        fields.push('daily_rate = ?');
        values.push(data.dailyRate);
      }
      if (data.active !== undefined) {
        fields.push('active = ?');
        values.push(data.active ? 1 : 0);
      }
      if (data.notes !== undefined) {
        fields.push('notes = ?');
        values.push(data.notes || null);
      }

      fields.push('updated_at = ?');
      values.push(now);
      values.push(id);

      await db.runAsync(
        `UPDATE colaboradores SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      const updated = await this.getById(id);
      if (!updated) throw new Error('Failed to retrieve updated collaborator');
      
      return updated;
    } catch (error) {
      console.error('[CollaboratorService] Error updating:', error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    if (Platform.OS === 'web') {
      const all = await this.getAll();
      const filtered = all.filter(c => c.id !== id);
      await storageService.webSet(STORAGE_KEY, filtered);
      return;
    }

    try {
      const db = storageService.getDatabase();
      await db.runAsync('DELETE FROM colaboradores WHERE id = ?', [id]);
    } catch (error) {
      console.error('[CollaboratorService] Error deleting:', error);
      throw error;
    }
  },

  async toggleActive(id: number): Promise<Collaborator> {
    const collaborator = await this.getById(id);
    if (!collaborator) throw new Error('Collaborator not found');

    return this.update(id, { active: !collaborator.active });
  },

  async search(query: string): Promise<Collaborator[]> {
    if (!query.trim()) return this.getAll();

    const lowerQuery = query.toLowerCase();

    if (Platform.OS === 'web') {
      const all = await this.getAll();
      return all.filter(c => 
        c.name.toLowerCase().includes(lowerQuery) ||
        c.email?.toLowerCase().includes(lowerQuery) ||
        c.phone?.includes(query) ||
        c.document?.includes(query)
      );
    }

    try {
      const db = storageService.getDatabase();
      const result = await db.getAllAsync<Collaborator>(
        `SELECT * FROM colaboradores 
        WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR document LIKE ?
        ORDER BY name ASC`,
        [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
      );
      return result || [];
    } catch (error) {
      console.error('[CollaboratorService] Error searching:', error);
      return [];
    }
  },
};
