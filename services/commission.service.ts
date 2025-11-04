import { Platform } from 'react-native';
import { storageService } from './storage.service';
import { Commission, CommissionFormData, CommissionReport, CollaboratorType } from '../types';

/**
 * Commission Service - Gestão de comissões
 * Arquitetura: Service → Hook → Component
 */

const STORAGE_KEY = 'commissions';
const ID_KEY = 'commission_next_id';

export const commissionService = {
  async getAll(): Promise<Commission[]> {
    if (Platform.OS === 'web') {
      const data = await storageService.webGet<Commission[]>(STORAGE_KEY);
      return data || [];
    }

    try {
      const db = storageService.getDatabase();
      const result = await db.getAllAsync<Commission>(
        'SELECT * FROM commissions ORDER BY service_date DESC'
      );
      return result || [];
    } catch (error) {
      console.error('[CommissionService] Error getting all:', error);
      return [];
    }
  },

  async getById(id: number): Promise<Commission | null> {
    if (Platform.OS === 'web') {
      const all = await this.getAll();
      return all.find(c => c.id === id) || null;
    }

    try {
      const db = storageService.getDatabase();
      const result = await db.getFirstAsync<Commission>(
        'SELECT * FROM commissions WHERE id = ?',
        [id]
      );
      return result || null;
    } catch (error) {
      console.error('[CommissionService] Error getting by id:', error);
      return null;
    }
  },

  async getByCollaborator(collaboratorId: number): Promise<Commission[]> {
    if (Platform.OS === 'web') {
      const all = await this.getAll();
      return all.filter(c => c.collaboratorId === collaboratorId);
    }

    try {
      const db = storageService.getDatabase();
      const result = await db.getAllAsync<Commission>(
        'SELECT * FROM commissions WHERE collaborator_id = ? ORDER BY service_date DESC',
        [collaboratorId]
      );
      return result || [];
    } catch (error) {
      console.error('[CommissionService] Error getting by collaborator:', error);
      return [];
    }
  },

  async getByOS(osId: number): Promise<Commission[]> {
    if (Platform.OS === 'web') {
      const all = await this.getAll();
      return all.filter(c => c.osId === osId);
    }

    try {
      const db = storageService.getDatabase();
      const result = await db.getAllAsync<Commission>(
        'SELECT * FROM commissions WHERE os_id = ?',
        [osId]
      );
      return result || [];
    } catch (error) {
      console.error('[CommissionService] Error getting by OS:', error);
      return [];
    }
  },

  async getPending(): Promise<Commission[]> {
    if (Platform.OS === 'web') {
      const all = await this.getAll();
      return all.filter(c => c.status === 'Pendente');
    }

    try {
      const db = storageService.getDatabase();
      const result = await db.getAllAsync<Commission>(
        'SELECT * FROM commissions WHERE status = ? ORDER BY service_date ASC',
        ['Pendente']
      );
      return result || [];
    } catch (error) {
      console.error('[CommissionService] Error getting pending:', error);
      return [];
    }
  },

  async getByPeriod(startDate: string, endDate: string): Promise<Commission[]> {
    if (Platform.OS === 'web') {
      const all = await this.getAll();
      return all.filter(c => c.serviceDate >= startDate && c.serviceDate <= endDate);
    }

    try {
      const db = storageService.getDatabase();
      const result = await db.getAllAsync<Commission>(
        'SELECT * FROM commissions WHERE service_date BETWEEN ? AND ? ORDER BY service_date DESC',
        [startDate, endDate]
      );
      return result || [];
    } catch (error) {
      console.error('[CommissionService] Error getting by period:', error);
      return [];
    }
  },

  async getReportByCollaborator(
    collaboratorId: number,
    startDate?: string,
    endDate?: string
  ): Promise<CommissionReport | null> {
    const commissions = startDate && endDate
      ? (await this.getByPeriod(startDate, endDate)).filter(c => c.collaboratorId === collaboratorId)
      : await this.getByCollaborator(collaboratorId);

    if (commissions.length === 0) return null;

    const totalBaseValue = commissions.reduce((sum, c) => sum + c.baseValue, 0);
    const totalCommission = commissions.reduce((sum, c) => sum + c.commissionValue, 0);
    const paidCommission = commissions
      .filter(c => c.status === 'Pago')
      .reduce((sum, c) => sum + c.commissionValue, 0);
    const pendingCommission = commissions
      .filter(c => c.status === 'Pendente')
      .reduce((sum, c) => sum + c.commissionValue, 0);

    // Get collaborator name
    const collaboratorName = 'Colaborador'; // TODO: Get from collaborator service

    return {
      collaboratorId,
      collaboratorName,
      period: startDate && endDate ? `${startDate} - ${endDate}` : 'Todo período',
      totalServices: commissions.length,
      totalBaseValue,
      totalCommission,
      paidCommission,
      pendingCommission,
    };
  },

  calculateCommission(
    baseValue: number,
    collaboratorType: CollaboratorType,
    commissionPercentage: number,
    fixedSalary: number,
    dailyRate: number
  ): number {
    switch (collaboratorType) {
      case 'SOCIO':
        // Sócio: percentual fixo sobre lucro bruto
        return baseValue * (commissionPercentage / 100);

      case 'FUNCIONARIO':
        // Funcionário: salário + comissão
        return baseValue * (commissionPercentage / 100);

      case 'TERCEIRIZADO':
        // Terceirizado: comissão por serviço
        return baseValue * (commissionPercentage / 100);

      case 'AUXILIAR':
        // Auxiliar: valor fixo por diária
        return dailyRate;

      default:
        return 0;
    }
  },

  async create(data: CommissionFormData): Promise<Commission> {
    const now = new Date().toISOString();

    if (Platform.OS === 'web') {
      const all = await this.getAll();
      const nextId = await storageService.webGet<number>(ID_KEY) || 1;
      
      const newCommission: Commission = {
        id: nextId,
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      await storageService.webSet(STORAGE_KEY, [...all, newCommission]);
      await storageService.webSet(ID_KEY, nextId + 1);
      
      return newCommission;
    }

    try {
      const db = storageService.getDatabase();
      const result = await db.runAsync(
        `INSERT INTO commissions (
          collaborator_id, os_id, service_date,
          base_value, percentage, commission_value,
          status, payment_date, payment_method, notes,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.collaboratorId,
          data.osId,
          data.serviceDate,
          data.baseValue,
          data.percentage,
          data.commissionValue,
          data.status,
          data.paymentDate || null,
          data.paymentMethod || null,
          data.notes || null,
          now,
          now,
        ]
      );

      const created = await this.getById(result.lastInsertRowId);
      if (!created) throw new Error('Failed to retrieve created commission');
      
      return created;
    } catch (error) {
      console.error('[CommissionService] Error creating:', error);
      throw error;
    }
  },

  async update(id: number, data: Partial<CommissionFormData>): Promise<Commission> {
    const now = new Date().toISOString();

    if (Platform.OS === 'web') {
      const all = await this.getAll();
      const index = all.findIndex(c => c.id === id);
      
      if (index === -1) throw new Error('Commission not found');

      const updated: Commission = {
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

      if (data.baseValue !== undefined) {
        fields.push('base_value = ?');
        values.push(data.baseValue);
      }
      if (data.percentage !== undefined) {
        fields.push('percentage = ?');
        values.push(data.percentage);
      }
      if (data.commissionValue !== undefined) {
        fields.push('commission_value = ?');
        values.push(data.commissionValue);
      }
      if (data.status !== undefined) {
        fields.push('status = ?');
        values.push(data.status);
      }
      if (data.paymentDate !== undefined) {
        fields.push('payment_date = ?');
        values.push(data.paymentDate || null);
      }
      if (data.paymentMethod !== undefined) {
        fields.push('payment_method = ?');
        values.push(data.paymentMethod || null);
      }
      if (data.notes !== undefined) {
        fields.push('notes = ?');
        values.push(data.notes || null);
      }

      fields.push('updated_at = ?');
      values.push(now);
      values.push(id);

      await db.runAsync(
        `UPDATE commissions SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      const updated = await this.getById(id);
      if (!updated) throw new Error('Failed to retrieve updated commission');
      
      return updated;
    } catch (error) {
      console.error('[CommissionService] Error updating:', error);
      throw error;
    }
  },

  async markAsPaid(id: number, paymentDate: string, paymentMethod: string): Promise<Commission> {
    return this.update(id, {
      status: 'Pago',
      paymentDate,
      paymentMethod,
    });
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
      await db.runAsync('DELETE FROM commissions WHERE id = ?', [id]);
    } catch (error) {
      console.error('[CommissionService] Error deleting:', error);
      throw error;
    }
  },
};
