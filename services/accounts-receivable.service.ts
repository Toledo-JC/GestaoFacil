import { Platform } from 'react-native';
import { storageService } from './storage.service';
import { AccountReceivable } from '../types';
import { bankAccountService } from './bank-account.service';

// ============================================
// ACCOUNTS RECEIVABLE SERVICE
// ============================================

export const accountsReceivableService = {
  async getAll(): Promise<AccountReceivable[]> {
    if (Platform.OS === 'web') {
      const receivables = await storageService.webGet<AccountReceivable[]>('accounts_receivable');
      return receivables || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync('SELECT * FROM accounts_receivable ORDER BY due_date DESC');
    return rows.map(this.mapAccountReceivable);
  },

  async getByStatus(status: AccountReceivable['status']): Promise<AccountReceivable[]> {
    if (Platform.OS === 'web') {
      const receivables = await storageService.webGet<AccountReceivable[]>('accounts_receivable');
      return receivables?.filter(r => r.status === status) || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync(
      'SELECT * FROM accounts_receivable WHERE status = ? ORDER BY due_date',
      [status]
    );
    return rows.map(this.mapAccountReceivable);
  },

  async getByPeriod(startDate: string, endDate: string): Promise<AccountReceivable[]> {
    if (Platform.OS === 'web') {
      const receivables = await storageService.webGet<AccountReceivable[]>('accounts_receivable');
      return receivables?.filter(r => 
        r.dueDate >= startDate && r.dueDate <= endDate
      ) || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync(
      'SELECT * FROM accounts_receivable WHERE due_date BETWEEN ? AND ? ORDER BY due_date',
      [startDate, endDate]
    );
    return rows.map(this.mapAccountReceivable);
  },

  async create(receivable: Omit<AccountReceivable, 'id' | 'createdAt' | 'updatedAt'>): Promise<AccountReceivable> {
    const now = new Date().toISOString();

    if (Platform.OS === 'web') {
      const receivables = await storageService.webGet<AccountReceivable[]>('accounts_receivable') || [];
      const newReceivable: AccountReceivable = {
        id: Date.now(),
        ...receivable,
        createdAt: now,
        updatedAt: now,
      };
      receivables.push(newReceivable);
      await storageService.webSet('accounts_receivable', receivables);
      return newReceivable;
    }

    const db = storageService.getDatabase();
    const result = await db.runAsync(
      `INSERT INTO accounts_receivable (
        service_order_id, client_id, description, amount, due_date,
        payment_date, payment_method, bank_account_id, category_id,
        status, installment_number, total_installments, notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        receivable.serviceOrderId || null,
        receivable.clientId,
        receivable.description,
        receivable.amount,
        receivable.dueDate,
        receivable.paymentDate || null,
        receivable.paymentMethod || null,
        receivable.bankAccountId || null,
        receivable.categoryId || null,
        receivable.status,
        receivable.installmentNumber || null,
        receivable.totalInstallments || null,
        receivable.notes || null,
        now,
        now,
      ]
    );

    const created = await this.getById(result.lastInsertRowId);
    if (!created) throw new Error('Failed to create account receivable');
    return created;
  },

  async receivePayment(id: number, paymentDate: string, paymentMethod: string, bankAccountId?: number): Promise<void> {
    const receivable = await this.getById(id);
    if (!receivable) throw new Error('Receivable not found');

    await this.update(id, {
      status: 'RECEIVED',
      paymentDate,
      paymentMethod,
      bankAccountId,
    });

    // Update bank account balance
    if (bankAccountId) {
      await bankAccountService.updateBalance(bankAccountId, receivable.amount);
    }
  },

  async update(id: number, data: Partial<AccountReceivable>): Promise<void> {
    const now = new Date().toISOString();

    if (Platform.OS === 'web') {
      const receivables = await storageService.webGet<AccountReceivable[]>('accounts_receivable') || [];
      const index = receivables.findIndex(r => r.id === id);
      if (index !== -1) {
        receivables[index] = { ...receivables[index], ...data, updatedAt: now };
        await storageService.webSet('accounts_receivable', receivables);
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
        `UPDATE accounts_receivable SET ${fields.join(', ')}, updated_at = ? WHERE id = ?`,
        [...values, now, id]
      );
    }
  },

  async getById(id: number): Promise<AccountReceivable | null> {
    if (Platform.OS === 'web') {
      const receivables = await storageService.webGet<AccountReceivable[]>('accounts_receivable');
      return receivables?.find(r => r.id === id) || null;
    }

    const db = storageService.getDatabase();
    const row = await db.getFirstAsync('SELECT * FROM accounts_receivable WHERE id = ?', [id]);
    return row ? this.mapAccountReceivable(row) : null;
  },

  async checkOverdue(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const pending = await this.getByStatus('PENDING');
    
    for (const receivable of pending) {
      if (receivable.dueDate < today) {
        await this.update(receivable.id, { status: 'OVERDUE' });
      }
    }
  },

  mapAccountReceivable(row: any): AccountReceivable {
    return {
      id: row.id,
      serviceOrderId: row.service_order_id,
      clientId: row.client_id,
      description: row.description,
      amount: row.amount,
      dueDate: row.due_date,
      paymentDate: row.payment_date,
      paymentMethod: row.payment_method,
      bankAccountId: row.bank_account_id,
      categoryId: row.category_id,
      status: row.status,
      installmentNumber: row.installment_number,
      totalInstallments: row.total_installments,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  },
};
