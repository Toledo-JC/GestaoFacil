import { Platform } from 'react-native';
import { storageService } from './storage.service';
import { Product, ProductWithStats, InventorySummary } from '../types';

// ============================================
// PRODUCT SERVICE
// ============================================

export const productService = {
  async getAll(): Promise<Product[]> {
    if (Platform.OS === 'web') {
      const products = await storageService.webGet<Product[]>('products');
      return products || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync('SELECT * FROM products ORDER BY name');
    return rows.map(this.mapProduct);
  },

  async getActive(): Promise<Product[]> {
    if (Platform.OS === 'web') {
      const products = await storageService.webGet<Product[]>('products');
      return products?.filter(p => p.active) || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync('SELECT * FROM products WHERE active = 1 ORDER BY name');
    return rows.map(this.mapProduct);
  },

  async getByType(type: Product['type']): Promise<Product[]> {
    if (Platform.OS === 'web') {
      const products = await storageService.webGet<Product[]>('products');
      return products?.filter(p => p.type === type && p.active) || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync(
      'SELECT * FROM products WHERE type = ? AND active = 1 ORDER BY name',
      [type]
    );
    return rows.map(this.mapProduct);
  },

  async getByCategory(categoryId: number): Promise<Product[]> {
    if (Platform.OS === 'web') {
      const products = await storageService.webGet<Product[]>('products');
      return products?.filter(p => p.categoryId === categoryId && p.active) || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync(
      'SELECT * FROM products WHERE category_id = ? AND active = 1 ORDER BY name',
      [categoryId]
    );
    return rows.map(this.mapProduct);
  },

  async getById(id: number): Promise<Product | null> {
    if (Platform.OS === 'web') {
      const products = await storageService.webGet<Product[]>('products');
      return products?.find(p => p.id === id) || null;
    }

    const db = storageService.getDatabase();
    const row = await db.getFirstAsync('SELECT * FROM products WHERE id = ?', [id]);
    return row ? this.mapProduct(row) : null;
  },

  async search(query: string): Promise<Product[]> {
    if (Platform.OS === 'web') {
      const products = await storageService.webGet<Product[]>('products');
      const lowerQuery = query.toLowerCase();
      return products?.filter(p => 
        p.active && (
          p.name.toLowerCase().includes(lowerQuery) ||
          p.code?.toLowerCase().includes(lowerQuery) ||
          p.barcode?.toLowerCase().includes(lowerQuery)
        )
      ) || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM products 
       WHERE active = 1 AND (
         name LIKE ? OR 
         code LIKE ? OR 
         barcode LIKE ?
       )
       ORDER BY name`,
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );
    return rows.map(this.mapProduct);
  },

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const now = new Date().toISOString();

    // Calculate margin percentage
    const marginPercentage = product.costPrice > 0
      ? ((product.salePrice - product.costPrice) / product.costPrice) * 100
      : 0;

    if (Platform.OS === 'web') {
      const products = await storageService.webGet<Product[]>('products') || [];
      const newProduct: Product = {
        id: Date.now(),
        ...product,
        marginPercentage,
        createdAt: now,
        updatedAt: now,
      };
      products.push(newProduct);
      await storageService.webSet('products', products);
      return newProduct;
    }

    const db = storageService.getDatabase();
    const result = await db.runAsync(
      `INSERT INTO products (
        category_id, type, code, barcode, name, description, unit,
        cost_price, sale_price, margin_percentage, stock_quantity, min_stock, max_stock,
        stock_location, expiration_date, track_stock, active, technical_specs,
        supplier_id, manufacturer, warranty_months, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product.categoryId || null,
        product.type,
        product.code || null,
        product.barcode || null,
        product.name,
        product.description || null,
        product.unit,
        product.costPrice,
        product.salePrice,
        marginPercentage,
        product.stockQuantity,
        product.minStock,
        product.maxStock || null,
        product.stockLocation || null,
        product.expirationDate || null,
        product.trackStock ? 1 : 0,
        product.active ? 1 : 0,
        product.technicalSpecs || null,
        product.supplierId || null,
        product.manufacturer || null,
        product.warrantyMonths || null,
        product.notes || null,
        now,
        now,
      ]
    );

    const created = await this.getById(result.lastInsertRowId);
    if (!created) throw new Error('Failed to create product');
    return created;
  },

  async update(id: number, data: Partial<Product>): Promise<void> {
    const now = new Date().toISOString();

    // Recalculate margin if prices changed
    if (data.costPrice !== undefined || data.salePrice !== undefined) {
      const current = await this.getById(id);
      if (current) {
        const costPrice = data.costPrice ?? current.costPrice;
        const salePrice = data.salePrice ?? current.salePrice;
        data.marginPercentage = costPrice > 0
          ? ((salePrice - costPrice) / costPrice) * 100
          : 0;
      }
    }

    if (Platform.OS === 'web') {
      const products = await storageService.webGet<Product[]>('products') || [];
      const index = products.findIndex(p => p.id === id);
      if (index !== -1) {
        products[index] = { ...products[index], ...data, updatedAt: now };
        await storageService.webSet('products', products);
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
        `UPDATE products SET ${fields.join(', ')}, updated_at = ? WHERE id = ?`,
        [...values, now, id]
      );
    }
  },

  async updateStock(id: number, quantity: number): Promise<void> {
    const product = await this.getById(id);
    if (!product) throw new Error('Product not found');
    
    await this.update(id, { stockQuantity: product.stockQuantity + quantity });
  },

  async getLowStockProducts(): Promise<Product[]> {
    if (Platform.OS === 'web') {
      const products = await storageService.webGet<Product[]>('products');
      return products?.filter(p => 
        p.active && 
        p.trackStock && 
        p.stockQuantity <= p.minStock
      ) || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM products 
       WHERE active = 1 
         AND track_stock = 1 
         AND stock_quantity <= min_stock
       ORDER BY stock_quantity ASC`,
      []
    );
    return rows.map(this.mapProduct);
  },

  async getInventorySummary(): Promise<InventorySummary> {
    const allProducts = await this.getAll();
    const activeProducts = allProducts.filter(p => p.active);
    
    const lowStockProducts = activeProducts.filter(p => 
      p.trackStock && p.stockQuantity > 0 && p.stockQuantity <= p.minStock
    ).length;

    const outOfStockProducts = activeProducts.filter(p => 
      p.trackStock && p.stockQuantity === 0
    ).length;

    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringThreshold = thirtyDaysFromNow.toISOString().split('T')[0];

    const expiringProducts = activeProducts.filter(p => 
      p.expirationDate && p.expirationDate <= expiringThreshold && p.expirationDate >= today
    ).length;

    const totalStockValue = activeProducts.reduce((sum, p) => 
      sum + (p.stockQuantity * p.costPrice), 0
    );

    // For web, we can't easily get movement stats, so return zeros
    return {
      totalProducts: allProducts.length,
      activeProducts: activeProducts.length,
      lowStockProducts,
      outOfStockProducts,
      expiringProducts,
      totalStockValue,
      totalMovementsThisMonth: 0,
      purchasesThisMonth: 0,
      salesThisMonth: 0,
    };
  },

  mapProduct(row: any): Product {
    return {
      id: row.id,
      categoryId: row.category_id,
      type: row.type,
      code: row.code,
      barcode: row.barcode,
      name: row.name,
      description: row.description,
      unit: row.unit,
      costPrice: row.cost_price,
      salePrice: row.sale_price,
      marginPercentage: row.margin_percentage,
      stockQuantity: row.stock_quantity,
      minStock: row.min_stock,
      maxStock: row.max_stock,
      stockLocation: row.stock_location,
      expirationDate: row.expiration_date,
      trackStock: Boolean(row.track_stock),
      active: Boolean(row.active),
      technicalSpecs: row.technical_specs,
      supplierId: row.supplier_id,
      manufacturer: row.manufacturer,
      warrantyMonths: row.warranty_months,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  },
};
