import { Platform } from 'react-native';
import { storageService } from './storage.service';
import { AccountPayable } from '../types';
import { bankAccountService } from './bank-account.service';

// ============================================
// ACCOUNTS PAYABLE SERVICE
// ============================================

export const accountsPayableService = {
  async getAll(): Promise<AccountPayable[]> {
    if (Platform.OS === 'web') {
      const payables = await storageService.webGet<AccountPayable[]>('accounts_payable');
      return payables || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync('SELECT * FROM accounts_payable ORDER BY due_date DESC');
    return rows.map(this.mapAccountPayable);
  },

  async getByStatus(status: AccountPayable['status']): Promise<AccountPayable[]> {
    if (Platform.OS === 'web') {
      const payables = await storageService.webGet<AccountPayable[]>('accounts_payable');
      return payables?.filter(p => p.status === status) || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync(
      'SELECT * FROM accounts_payable WHERE status = ? ORDER BY due_date',
      [status]
    );
    return rows.map(this.mapAccountPayable);
  },

  async create(payable: Omit<AccountPayable, 'id' | 'createdAt' | 'updatedAt'>): Promise<AccountPayable> {
    const now = new Date().toISOString();

    if (Platform.OS === 'web') {
      const payables = await storageService.webGet<AccountPayable[]>('accounts_payable') || [];
      const newPayable: AccountPayable = {
        id: Date.now(),
        ...payable,
        createdAt: now,
        updatedAt: now,
      };
      payables.push(newPayable);
      await storageService.webSet('accounts_payable', payables);
      return newPayable;
    }

    const db = storageService.getDatabase();
    const result = await db.runAsync(
      `INSERT INTO accounts_payable (
        description, amount, due_date, payment_date, payment_method,
        bank_account_id, category_id, supplier_name, supplier_document,
        status, installment_number, total_installments, recurring,
        recurring_type, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payable.description,
        payable.amount,
        payable.dueDate,
        payable.paymentDate || null,
        payable.paymentMethod || null,
        payable.bankAccountId || null,
        payable.categoryId,
        payable.supplierName || null,
        payable.supplierDocument || null,
        payable.status,
        payable.installmentNumber || null,
        payable.totalInstallments || null,
        payable.recurring ? 1 : 0,
        payable.recurringType || null,
        payable.notes || null,
        now,
        now,
      ]
    );

    const created = await this.getById(result.lastInsertRowId);
    if (!created) throw new Error('Failed to create account payable');
    return created;
  },

  async payExpense(id: number, paymentDate: string, paymentMethod: string, bankAccountId?: number): Promise<void> {
    const payable = await this.getById(id);
    if (!payable) throw new Error('Payable not found');

    await this.update(id, {
      status: 'PAID',
      paymentDate,
      paymentMethod,
      bankAccountId,
    });

    // Update bank account balance
    if (bankAccountId) {
      await bankAccountService.updateBalance(bankAccountId, -payable.amount);
    }
  },

  async update(id: number, data: Partial<AccountPayable>): Promise<void> {
    const now = new Date().toISOString();

    if (Platform.OS === 'web') {
      const payables = await storageService.webGet<AccountPayable[]>('accounts_payable') || [];
      const index = payables.findIndex(p => p.id === id);
      if (index !== -1) {
        payables[index] = { ...payables[index], ...data, updatedAt: now };
        await storageService.webSet('accounts_payable', payables);
      }
      return;
    }

    const db = storageService.getDatabase();
    const fields = Object.keys(data)
      .filter(key => key !== 'id' && key !== 'createdAt')
      .map(key => `${this.camelToSnake(key)} = ?`);
    
    const values = Object.entries(data)
      .filter(([key]) => key !== 'id' && key !== 'createdAt')
      .map(([key, value]) => key === 'recurring' ? (value ? 1 : 0) : value);

    if (fields.length > 0) {
      await db.runAsync(
        `UPDATE accounts_payable SET ${fields.join(', ')}, updated_at = ? WHERE id = ?`,
        [...values, now, id]
      );
    }
  },

  async getById(id: number): Promise<AccountPayable | null> {
    if (Platform.OS === 'web') {
      const payables = await storageService.webGet<AccountPayable[]>('accounts_payable');
      return payables?.find(p => p.id === id) || null;
    }

    const db = storageService.getDatabase();
    const row = await db.getFirstAsync('SELECT * FROM accounts_payable WHERE id = ?', [id]);
    return row ? this.mapAccountPayable(row) : null;
  },

  async checkOverdue(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const pending = await this.getByStatus('PENDING');
    
    for (const payable of pending) {
      if (payable.dueDate < today) {
        await this.update(payable.id, { status: 'OVERDUE' });
      }
    }
  },

  mapAccountPayable(row: any): AccountPayable {
    return {
      id: row.id,
      description: row.description,
      amount: row.amount,
      dueDate: row.due_date,
      paymentDate: row.payment_date,
      paymentMethod: row.payment_method,
      bankAccountId: row.bank_account_id,
      categoryId: row.category_id,
      supplierName: row.supplier_name,
      supplierDocument: row.supplier_document,
      status: row.status,
      installmentNumber: row.installment_number,
      totalInstallments: row.total_installments,
      recurring: Boolean(row.recurring),
      recurringType: row.recurring_type,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  },
};
