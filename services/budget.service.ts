import { Platform } from 'react-native';
import { storageService } from './storage.service';
import { Budget, BudgetItem } from '../types';

// ============================================
// BUDGET SERVICE - CRUD DE ORÇAMENTOS
// ============================================

export const budgetService = {
  // ========== BUDGETS ==========

  async getAll(): Promise<Budget[]> {
    if (Platform.OS === 'web') {
      const budgets = await storageService.webGet<Budget[]>('budgets');
      return budgets || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync('SELECT * FROM budgets ORDER BY created_at DESC');
    return rows.map(this.mapBudget);
  },

  async getById(id: number): Promise<Budget | null> {
    if (Platform.OS === 'web') {
      const budgets = await storageService.webGet<Budget[]>('budgets');
      return budgets?.find(b => b.id === id) || null;
    }

    const db = storageService.getDatabase();
    const row = await db.getFirstAsync('SELECT * FROM budgets WHERE id = ?', [id]);
    return row ? this.mapBudget(row) : null;
  },

  async getByClient(clientId: number): Promise<Budget[]> {
    if (Platform.OS === 'web') {
      const budgets = await storageService.webGet<Budget[]>('budgets');
      return budgets?.filter(b => b.clientId === clientId) || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync(
      'SELECT * FROM budgets WHERE client_id = ? ORDER BY created_at DESC',
      [clientId]
    );
    return rows.map(this.mapBudget);
  },

  async getByStatus(status: Budget['status']): Promise<Budget[]> {
    if (Platform.OS === 'web') {
      const budgets = await storageService.webGet<Budget[]>('budgets');
      return budgets?.filter(b => b.status === status) || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync(
      'SELECT * FROM budgets WHERE status = ? ORDER BY created_at DESC',
      [status]
    );
    return rows.map(this.mapBudget);
  },

  async create(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Budget> {
    const now = new Date().toISOString();
    const budgetNumber = await this.generateBudgetNumber();

    if (Platform.OS === 'web') {
      const budgets = await storageService.webGet<Budget[]>('budgets') || [];
      const newBudget: Budget = {
        id: Date.now(),
        ...budget,
        budgetNumber,
        createdAt: now,
        updatedAt: now,
      };
      budgets.push(newBudget);
      await storageService.webSet('budgets', budgets);
      return newBudget;
    }

    const db = storageService.getDatabase();
    const result = await db.runAsync(
      `INSERT INTO budgets (
        budget_number, client_id, equipment_id, title, description,
        subtotal, discount, total, validity_days, valid_until,
        payment_conditions, warranty_terms, technical_notes, status,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        budgetNumber,
        budget.clientId,
        budget.equipmentId || null,
        budget.title,
        budget.description || null,
        budget.subtotal,
        budget.discount,
        budget.total,
        budget.validityDays,
        budget.validUntil,
        budget.paymentConditions || null,
        budget.warrantyTerms || null,
        budget.technicalNotes || null,
        budget.status,
        now,
        now,
      ]
    );

    const created = await this.getById(result.lastInsertRowId);
    if (!created) throw new Error('Failed to create budget');
    return created;
  },

  async update(id: number, data: Partial<Budget>): Promise<void> {
    const now = new Date().toISOString();

    if (Platform.OS === 'web') {
      const budgets = await storageService.webGet<Budget[]>('budgets') || [];
      const index = budgets.findIndex(b => b.id === id);
      if (index !== -1) {
        budgets[index] = { ...budgets[index], ...data, updatedAt: now };
        await storageService.webSet('budgets', budgets);
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
        `UPDATE budgets SET ${fields.join(', ')}, updated_at = ? WHERE id = ?`,
        [...values, now, id]
      );
    }
  },

  async delete(id: number): Promise<void> {
    if (Platform.OS === 'web') {
      const budgets = await storageService.webGet<Budget[]>('budgets') || [];
      await storageService.webSet('budgets', budgets.filter(b => b.id !== id));
      return;
    }

    const db = storageService.getDatabase();
    await db.runAsync('DELETE FROM budgets WHERE id = ?', [id]);
  },

  async approve(id: number, signatureUri: string): Promise<void> {
    const now = new Date().toISOString();
    await this.update(id, {
      status: 'APPROVED',
      signatureUri,
      signatureDate: now,
      approvedAt: now,
    });
  },

  async reject(id: number): Promise<void> {
    await this.update(id, { status: 'REJECTED' });
  },

  async markAsConverted(id: number): Promise<void> {
    await this.update(id, { status: 'CONVERTED' });
  },

  // ========== BUDGET ITEMS ==========

  async getItems(budgetId: number): Promise<BudgetItem[]> {
    if (Platform.OS === 'web') {
      const items = await storageService.webGet<BudgetItem[]>(`budget_items_${budgetId}`);
      return items || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync(
      'SELECT * FROM budget_items WHERE budget_id = ? ORDER BY created_at',
      [budgetId]
    );
    return rows.map(this.mapBudgetItem);
  },

  async addItem(item: Omit<BudgetItem, 'id' | 'createdAt'>): Promise<BudgetItem> {
    const now = new Date().toISOString();

    if (Platform.OS === 'web') {
      const items = await storageService.webGet<BudgetItem[]>(`budget_items_${item.budgetId}`) || [];
      const newItem: BudgetItem = {
        id: Date.now(),
        ...item,
        createdAt: now,
      };
      items.push(newItem);
      await storageService.webSet(`budget_items_${item.budgetId}`, items);
      
      // Atualizar totais do orçamento
      await this.recalculateTotals(item.budgetId);
      
      return newItem;
    }

    const db = storageService.getDatabase();
    const result = await db.runAsync(
      `INSERT INTO budget_items (
        budget_id, type, description, quantity, unit_price, total, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.budgetId,
        item.type,
        item.description,
        item.quantity,
        item.unitPrice,
        item.total,
        item.notes || null,
        now,
      ]
    );

    // Atualizar totais do orçamento
    await this.recalculateTotals(item.budgetId);

    const items = await this.getItems(item.budgetId);
    const created = items.find(i => i.id === result.lastInsertRowId);
    if (!created) throw new Error('Failed to create budget item');
    return created;
  },

  async updateItem(id: number, budgetId: number, data: Partial<BudgetItem>): Promise<void> {
    if (Platform.OS === 'web') {
      const items = await storageService.webGet<BudgetItem[]>(`budget_items_${budgetId}`) || [];
      const index = items.findIndex(i => i.id === id);
      if (index !== -1) {
        items[index] = { ...items[index], ...data };
        await storageService.webSet(`budget_items_${budgetId}`, items);
        await this.recalculateTotals(budgetId);
      }
      return;
    }

    const db = storageService.getDatabase();
    const fields = Object.keys(data)
      .filter(key => key !== 'id' && key !== 'budgetId' && key !== 'createdAt')
      .map(key => `${this.camelToSnake(key)} = ?`);
    
    const values = Object.entries(data)
      .filter(([key]) => key !== 'id' && key !== 'budgetId' && key !== 'createdAt')
      .map(([, value]) => value);

    if (fields.length > 0) {
      await db.runAsync(
        `UPDATE budget_items SET ${fields.join(', ')} WHERE id = ?`,
        [...values, id]
      );
      await this.recalculateTotals(budgetId);
    }
  },

  async deleteItem(id: number, budgetId: number): Promise<void> {
    if (Platform.OS === 'web') {
      const items = await storageService.webGet<BudgetItem[]>(`budget_items_${budgetId}`) || [];
      await storageService.webSet(`budget_items_${budgetId}`, items.filter(i => i.id !== id));
      await this.recalculateTotals(budgetId);
      return;
    }

    const db = storageService.getDatabase();
    await db.runAsync('DELETE FROM budget_items WHERE id = ?', [id]);
    await this.recalculateTotals(budgetId);
  },

  // ========== HELPERS ==========

  async recalculateTotals(budgetId: number): Promise<void> {
    const items = await this.getItems(budgetId);
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    
    const budget = await this.getById(budgetId);
    if (budget) {
      const total = subtotal - budget.discount;
      await this.update(budgetId, { subtotal, total });
    }
  },

  async generateBudgetNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const budgets = await this.getAll();
    const yearBudgets = budgets.filter(b => 
      b.budgetNumber.startsWith(`ORC${year}`)
    );
    const nextNumber = yearBudgets.length + 1;
    return `ORC${year}${String(nextNumber).padStart(4, '0')}`;
  },

  mapBudget(row: any): Budget {
    return {
      id: row.id,
      budgetNumber: row.budget_number,
      clientId: row.client_id,
      equipmentId: row.equipment_id,
      title: row.title,
      description: row.description,
      subtotal: row.subtotal,
      discount: row.discount,
      total: row.total,
      validityDays: row.validity_days,
      validUntil: row.valid_until,
      paymentConditions: row.payment_conditions,
      warrantyTerms: row.warranty_terms,
      technicalNotes: row.technical_notes,
      status: row.status,
      signatureUri: row.signature_uri,
      signatureDate: row.signature_date,
      pdfUri: row.pdf_uri,
      approvedAt: row.approved_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  mapBudgetItem(row: any): BudgetItem {
    return {
      id: row.id,
      budgetId: row.budget_id,
      type: row.type,
      description: row.description,
      quantity: row.quantity,
      unitPrice: row.unit_price,
      total: row.total,
      notes: row.notes,
      createdAt: row.created_at,
    };
  },

  camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  },
};
