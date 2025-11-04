import { Platform } from 'react-native';
import { storageService } from './storage.service';
import { FinancialCategory } from '../types';

// ============================================
// FINANCIAL CATEGORY SERVICE
// ============================================

export const financialCategoryService = {
  async getAll(): Promise<FinancialCategory[]> {
    if (Platform.OS === 'web') {
      const categories = await storageService.webGet<FinancialCategory[]>('financial_categories');
      return categories || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync('SELECT * FROM financial_categories ORDER BY name');
    return rows.map(this.mapCategory);
  },

  async getByType(type: 'INCOME' | 'EXPENSE'): Promise<FinancialCategory[]> {
    if (Platform.OS === 'web') {
      const categories = await storageService.webGet<FinancialCategory[]>('financial_categories');
      return categories?.filter(c => c.type === type && c.active) || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync(
      'SELECT * FROM financial_categories WHERE type = ? AND active = 1 ORDER BY name',
      [type]
    );
    return rows.map(this.mapCategory);
  },

  async create(category: Omit<FinancialCategory, 'id' | 'createdAt'>): Promise<FinancialCategory> {
    const now = new Date().toISOString();

    if (Platform.OS === 'web') {
      const categories = await storageService.webGet<FinancialCategory[]>('financial_categories') || [];
      const newCategory: FinancialCategory = {
        id: Date.now(),
        ...category,
        createdAt: now,
      };
      categories.push(newCategory);
      await storageService.webSet('financial_categories', categories);
      return newCategory;
    }

    const db = storageService.getDatabase();
    const result = await db.runAsync(
      `INSERT INTO financial_categories (name, type, color, icon, parent_id, active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        category.name,
        category.type,
        category.color || null,
        category.icon || null,
        category.parentId || null,
        category.active ? 1 : 0,
        now,
      ]
    );

    const categories = await this.getAll();
    const created = categories.find(c => c.id === result.lastInsertRowId);
    if (!created) throw new Error('Failed to create category');
    return created;
  },

  async seedDefaultCategories(): Promise<void> {
    const existing = await this.getAll();
    if (existing.length > 0) return;

    const defaultCategories = [
      // INCOME CATEGORIES
      { name: 'Serviços Prestados', type: 'INCOME' as const, color: '#10B981', icon: 'construct', active: true },
      { name: 'Venda de Peças', type: 'INCOME' as const, color: '#3B82F6', icon: 'cart', active: true },
      { name: 'Outras Receitas', type: 'INCOME' as const, color: '#8B5CF6', icon: 'cash', active: true },
      
      // EXPENSE CATEGORIES
      { name: 'Peças e Materiais', type: 'EXPENSE' as const, color: '#EF4444', icon: 'hardware-chip', active: true },
      { name: 'Colaboradores', type: 'EXPENSE' as const, color: '#F59E0B', icon: 'people', active: true },
      { name: 'Aluguel', type: 'EXPENSE' as const, color: '#6B7280', icon: 'home', active: true },
      { name: 'Energia e Água', type: 'EXPENSE' as const, color: '#14B8A6', icon: 'flash', active: true },
      { name: 'Internet e Telefone', type: 'EXPENSE' as const, color: '#06B6D4', icon: 'wifi', active: true },
      { name: 'Marketing', type: 'EXPENSE' as const, color: '#EC4899', icon: 'megaphone', active: true },
      { name: 'Ferramentas', type: 'EXPENSE' as const, color: '#F97316', icon: 'build', active: true },
      { name: 'Impostos', type: 'EXPENSE' as const, color: '#DC2626', icon: 'receipt', active: true },
      { name: 'Outras Despesas', type: 'EXPENSE' as const, color: '#64748B', icon: 'ellipsis-horizontal', active: true },
    ];

    for (const cat of defaultCategories) {
      await this.create(cat);
    }
  },

  mapCategory(row: any): FinancialCategory {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      color: row.color,
      icon: row.icon,
      parentId: row.parent_id,
      active: Boolean(row.active),
      createdAt: row.created_at,
    };
  },
};
