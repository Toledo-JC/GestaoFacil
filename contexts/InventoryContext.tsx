import React, { createContext, useState, useCallback, ReactNode } from 'react';
import {
  Product,
  ProductCategory,
  Supplier,
  StockMovement,
  StockAlert,
  InventorySummary,
} from '../types';
import { productService } from '../services/product.service';
import { stockMovementService } from '../services/stock-movement.service';
import { stockAlertService } from '../services/stock-alert.service';
import { supplierService } from '../services/supplier.service';

interface InventoryContextType {
  // Products
  products: Product[];
  loadProducts: () => Promise<void>;
  createProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
  updateProduct: (id: number, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  searchProducts: (query: string) => Promise<Product[]>;

  // Stock Movements
  movements: StockMovement[];
  loadMovements: () => Promise<void>;
  createMovement: (movement: Omit<StockMovement, 'id' | 'createdAt'>) => Promise<StockMovement>;
  getProductMovements: (productId: number) => Promise<StockMovement[]>;

  // Stock Alerts
  alerts: StockAlert[];
  loadAlerts: () => Promise<void>;
  acknowledgeAlert: (id: number) => Promise<void>;
  checkAlerts: () => Promise<void>;

  // Suppliers
  suppliers: Supplier[];
  loadSuppliers: () => Promise<void>;
  createSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Supplier>;
  updateSupplier: (id: number, data: Partial<Supplier>) => Promise<void>;

  // Summary
  summary: InventorySummary | null;
  loadSummary: () => Promise<void>;

  // State
  loading: boolean;
  refresh: () => Promise<void>;
}

export const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }, []);

  const createProduct = useCallback(async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct = await productService.create(product);
    setProducts(prev => [newProduct, ...prev]);
    await loadSummary();
    return newProduct;
  }, []);

  const updateProduct = useCallback(async (id: number, data: Partial<Product>) => {
    await productService.update(id, data);
    await loadProducts();
    await loadSummary();
  }, [loadProducts]);

  const deleteProduct = useCallback(async (id: number) => {
    await productService.update(id, { active: false });
    await loadProducts();
    await loadSummary();
  }, [loadProducts]);

  const searchProducts = useCallback(async (query: string) => {
    return await productService.search(query);
  }, []);

  const loadMovements = useCallback(async () => {
    try {
      const data = await stockMovementService.getAll();
      setMovements(data.slice(0, 50)); // Last 50 movements
    } catch (error) {
      console.error('Error loading movements:', error);
    }
  }, []);

  const createMovement = useCallback(async (movement: Omit<StockMovement, 'id' | 'createdAt'>) => {
    const newMovement = await stockMovementService.create(movement, true);
    setMovements(prev => [newMovement, ...prev]);
    await loadProducts();
    await loadSummary();
    await checkAlerts();
    return newMovement;
  }, [loadProducts]);

  const getProductMovements = useCallback(async (productId: number) => {
    return await stockMovementService.getByProduct(productId);
  }, []);

  const loadAlerts = useCallback(async () => {
    try {
      const data = await stockAlertService.getPending();
      setAlerts(data);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  }, []);

  const acknowledgeAlert = useCallback(async (id: number) => {
    await stockAlertService.acknowledge(id);
    await loadAlerts();
  }, [loadAlerts]);

  const checkAlerts = useCallback(async () => {
    await stockAlertService.checkAndCreateAlerts();
    await loadAlerts();
  }, [loadAlerts]);

  const loadSuppliers = useCallback(async () => {
    try {
      const data = await supplierService.getAll();
      setSuppliers(data);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  }, []);

  const createSupplier = useCallback(async (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSupplier = await supplierService.create(supplier);
    setSuppliers(prev => [newSupplier, ...prev]);
    return newSupplier;
  }, []);

  const updateSupplier = useCallback(async (id: number, data: Partial<Supplier>) => {
    await supplierService.update(id, data);
    await loadSuppliers();
  }, [loadSuppliers]);

  const loadSummary = useCallback(async () => {
    try {
      const data = await productService.getInventorySummary();
      setSummary(data);
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProducts(),
        loadMovements(),
        loadAlerts(),
        loadSuppliers(),
        loadSummary(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [loadProducts, loadMovements, loadAlerts, loadSuppliers, loadSummary]);

  return (
    <InventoryContext.Provider
      value={{
        products,
        loadProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        searchProducts,
        movements,
        loadMovements,
        createMovement,
        getProductMovements,
        alerts,
        loadAlerts,
        acknowledgeAlert,
        checkAlerts,
        suppliers,
        loadSuppliers,
        createSupplier,
        updateSupplier,
        summary,
        loadSummary,
        loading,
        refresh,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}
