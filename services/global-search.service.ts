import { storageService } from './storage.service';
import { clientService } from './client.service';
import { equipmentService } from './equipment.service';
import { serviceOrderService } from './service-order.service';
import { budgetService } from './budget.service';
import { productService } from './product.service';
import { collaboratorService } from './collaborator.service';
import { accountsReceivableService } from './accounts-receivable.service';
import { preventiveMaintenanceService } from './preventive-maintenance.service';
import {
  SearchQuery,
  SearchResult,
  SearchResults,
  SearchModule,
  SavedSearch,
  SearchHistory,
} from '../types';

// ============================================
// GLOBAL SEARCH SERVICE
// ============================================

export const globalSearchService = {
  // ============================================
  // SEARCH EXECUTION
  // ============================================

  async search(searchQuery: SearchQuery): Promise<{ data: SearchResults | null; error: string | null }> {
    try {
      const results: SearchResult[] = [];
      const byModule: Record<SearchModule, number> = {
        CLIENTS: 0,
        EQUIPMENTS: 0,
        ORDERS: 0,
        BUDGETS: 0,
        PRODUCTS: 0,
        COLLABORATORS: 0,
        FINANCIAL: 0,
        PREVENTIVES: 0,
      };

      const modules = searchQuery.modules || ['CLIENTS', 'EQUIPMENTS', 'ORDERS', 'BUDGETS', 'PRODUCTS', 'COLLABORATORS', 'FINANCIAL', 'PREVENTIVES'];

      // Search clients
      if (modules.includes('CLIENTS')) {
        const clientResults = await this.searchClients(searchQuery.query);
        results.push(...clientResults);
        byModule.CLIENTS = clientResults.length;
      }

      // Search equipments
      if (modules.includes('EQUIPMENTS')) {
        const equipmentResults = await this.searchEquipments(searchQuery.query);
        results.push(...equipmentResults);
        byModule.EQUIPMENTS = equipmentResults.length;
      }

      // Search orders
      if (modules.includes('ORDERS')) {
        const orderResults = await this.searchOrders(searchQuery.query);
        results.push(...orderResults);
        byModule.ORDERS = orderResults.length;
      }

      // Search budgets
      if (modules.includes('BUDGETS')) {
        const budgetResults = await this.searchBudgets(searchQuery.query);
        results.push(...budgetResults);
        byModule.BUDGETS = budgetResults.length;
      }

      // Search products
      if (modules.includes('PRODUCTS')) {
        const productResults = await this.searchProducts(searchQuery.query);
        results.push(...productResults);
        byModule.PRODUCTS = productResults.length;
      }

      // Search collaborators
      if (modules.includes('COLLABORATORS')) {
        const collaboratorResults = await this.searchCollaborators(searchQuery.query);
        results.push(...collaboratorResults);
        byModule.COLLABORATORS = collaboratorResults.length;
      }

      // Search financial
      if (modules.includes('FINANCIAL')) {
        const financialResults = await this.searchFinancial(searchQuery.query);
        results.push(...financialResults);
        byModule.FINANCIAL = financialResults.length;
      }

      // Search preventives
      if (modules.includes('PREVENTIVES')) {
        const preventiveResults = await this.searchPreventives(searchQuery.query);
        results.push(...preventiveResults);
        byModule.PREVENTIVES = preventiveResults.length;
      }

      const searchResults: SearchResults = {
        query: searchQuery.query,
        total: results.length,
        results,
        byModule,
        executedAt: new Date().toISOString(),
      };

      // Save to history
      await this.addToHistory(searchQuery.query, searchQuery.modules?.join(','), results.length);

      return { data: searchResults, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async searchClients(query: string): Promise<SearchResult[]> {
    const { data: clients } = await clientService.getAll();
    if (!clients) return [];

    const lowerQuery = query.toLowerCase();
    return clients
      .filter(c => 
        c.name.toLowerCase().includes(lowerQuery) ||
        c.phone?.toLowerCase().includes(lowerQuery) ||
        c.email?.toLowerCase().includes(lowerQuery) ||
        c.document?.toLowerCase().includes(lowerQuery)
      )
      .map(c => ({
        id: c.id,
        type: 'CLIENTS' as SearchModule,
        title: c.name,
        subtitle: c.phone || c.email,
        description: c.address,
        url: `/client-detail?id=${c.id}`,
      }));
  },

  async searchEquipments(query: string): Promise<SearchResult[]> {
    const { data: equipments } = await equipmentService.getAll();
    if (!equipments) return [];

    const lowerQuery = query.toLowerCase();
    return equipments
      .filter(e => 
        e.name.toLowerCase().includes(lowerQuery) ||
        e.brand?.toLowerCase().includes(lowerQuery) ||
        e.model?.toLowerCase().includes(lowerQuery) ||
        e.serialNumber?.toLowerCase().includes(lowerQuery)
      )
      .map(e => ({
        id: e.id,
        type: 'EQUIPMENTS' as SearchModule,
        title: e.name,
        subtitle: `${e.brand || ''} ${e.model || ''}`.trim(),
        description: e.serialNumber,
        url: `/equipment-detail?id=${e.id}`,
      }));
  },

  async searchOrders(query: string): Promise<SearchResult[]> {
    const { data: orders } = await serviceOrderService.getAll();
    if (!orders) return [];

    const lowerQuery = query.toLowerCase();
    return orders
      .filter(o => 
        o.osNumber.toLowerCase().includes(lowerQuery) ||
        o.title.toLowerCase().includes(lowerQuery) ||
        o.description?.toLowerCase().includes(lowerQuery)
      )
      .map(o => ({
        id: o.id,
        type: 'ORDERS' as SearchModule,
        title: `OS ${o.osNumber}`,
        subtitle: o.title,
        description: o.status,
        url: `/os-detail?id=${o.id}`,
      }));
  },

  async searchBudgets(query: string): Promise<SearchResult[]> {
    const { data: budgets } = await budgetService.getAll();
    if (!budgets) return [];

    const lowerQuery = query.toLowerCase();
    return budgets
      .filter(b => 
        b.budgetNumber.toLowerCase().includes(lowerQuery) ||
        b.title.toLowerCase().includes(lowerQuery) ||
        b.description?.toLowerCase().includes(lowerQuery)
      )
      .map(b => ({
        id: b.id,
        type: 'BUDGETS' as SearchModule,
        title: `Orçamento ${b.budgetNumber}`,
        subtitle: b.title,
        description: b.status,
        url: `/budget-detail?id=${b.id}`,
      }));
  },

  async searchProducts(query: string): Promise<SearchResult[]> {
    const { data: products } = await productService.getAll();
    if (!products) return [];

    const lowerQuery = query.toLowerCase();
    return products
      .filter(p => 
        p.name.toLowerCase().includes(lowerQuery) ||
        p.code?.toLowerCase().includes(lowerQuery) ||
        p.barcode?.toLowerCase().includes(lowerQuery) ||
        p.description?.toLowerCase().includes(lowerQuery)
      )
      .map(p => ({
        id: p.id,
        type: 'PRODUCTS' as SearchModule,
        title: p.name,
        subtitle: p.code,
        description: `Estoque: ${p.stockQuantity} ${p.unit}`,
        url: `/product-detail?id=${p.id}`,
      }));
  },

  async searchCollaborators(query: string): Promise<SearchResult[]> {
    const { data: collaborators } = await collaboratorService.getAll();
    if (!collaborators) return [];

    const lowerQuery = query.toLowerCase();
    return collaborators
      .filter(c => 
        c.name.toLowerCase().includes(lowerQuery) ||
        c.phone?.toLowerCase().includes(lowerQuery) ||
        c.email?.toLowerCase().includes(lowerQuery) ||
        c.document?.toLowerCase().includes(lowerQuery)
      )
      .map(c => ({
        id: c.id,
        type: 'COLLABORATORS' as SearchModule,
        title: c.name,
        subtitle: c.type,
        description: c.phone || c.email,
        url: `/collaborator-detail?id=${c.id}`,
      }));
  },

  async searchFinancial(query: string): Promise<SearchResult[]> {
    const { data: receivables } = await accountsReceivableService.getAll({});
    if (!receivables) return [];

    const lowerQuery = query.toLowerCase();
    return receivables
      .filter(r => 
        r.description.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 10)
      .map(r => ({
        id: r.id,
        type: 'FINANCIAL' as SearchModule,
        title: r.description,
        subtitle: `R$ ${r.amount.toFixed(2)}`,
        description: r.status,
        url: '/accounts-receivable',
      }));
  },

  async searchPreventives(query: string): Promise<SearchResult[]> {
    const { data: preventives } = await preventiveMaintenanceService.getAll({});
    if (!preventives) return [];

    const lowerQuery = query.toLowerCase();
    return preventives
      .filter(p => 
        p.title.toLowerCase().includes(lowerQuery) ||
        p.description?.toLowerCase().includes(lowerQuery)
      )
      .map(p => ({
        id: p.id,
        type: 'PREVENTIVES' as SearchModule,
        title: p.title,
        subtitle: p.clientName || '',
        description: `Próxima: ${p.nextExecutionDate || 'N/A'}`,
        url: '/(tabs)/maintenance',
      }));
  },

  // ============================================
  // SAVED SEARCHES
  // ============================================

  async saveSearch(search: Omit<SavedSearch, 'id' | 'useCount' | 'createdAt' | 'updatedAt'>): Promise<{ data: SavedSearch | null; error: string | null }> {
    try {
      if (storageService.isWebPlatform()) {
        const searches = (await storageService.webGet<SavedSearch[]>('saved_searches')) || [];
        const newSearch: SavedSearch = {
          ...search,
          id: Date.now(),
          useCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        searches.push(newSearch);
        await storageService.webSet('saved_searches', searches);
        return { data: newSearch, error: null };
      }

      const db = storageService.getDatabase();
      const result = await db.runAsync(
        `INSERT INTO saved_searches (name, description, query, filters, modules, is_favorite) VALUES (?, ?, ?, ?, ?, ?)`,
        [search.name, search.description || null, search.query, search.filters || null, search.modules || null, search.isFavorite ? 1 : 0]
      );

      const created = await db.getFirstAsync<SavedSearch>(
        'SELECT * FROM saved_searches WHERE id = ?',
        [result.lastInsertRowId]
      );

      return { data: created || null, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async getSavedSearches(): Promise<{ data: SavedSearch[]; error: string | null }> {
    try {
      if (storageService.isWebPlatform()) {
        const searches = (await storageService.webGet<SavedSearch[]>('saved_searches')) || [];
        return { data: searches, error: null };
      }

      const db = storageService.getDatabase();
      const searches = await db.getAllAsync<SavedSearch>(
        'SELECT * FROM saved_searches ORDER BY is_favorite DESC, use_count DESC, created_at DESC'
      );

      return { data: searches, error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  },

  async updateSearchUseCount(id: number): Promise<{ error: string | null }> {
    try {
      if (storageService.isWebPlatform()) {
        const searches = (await storageService.webGet<SavedSearch[]>('saved_searches')) || [];
        const search = searches.find(s => s.id === id);
        if (search) {
          search.useCount++;
          search.lastUsedAt = new Date().toISOString();
          await storageService.webSet('saved_searches', searches);
        }
        return { error: null };
      }

      const db = storageService.getDatabase();
      await db.runAsync(
        'UPDATE saved_searches SET use_count = use_count + 1, last_used_at = ? WHERE id = ?',
        [new Date().toISOString(), id]
      );

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async deleteSavedSearch(id: number): Promise<{ error: string | null }> {
    try {
      if (storageService.isWebPlatform()) {
        const searches = (await storageService.webGet<SavedSearch[]>('saved_searches')) || [];
        const filtered = searches.filter(s => s.id !== id);
        await storageService.webSet('saved_searches', filtered);
        return { error: null };
      }

      const db = storageService.getDatabase();
      await db.runAsync('DELETE FROM saved_searches WHERE id = ?', [id]);

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // ============================================
  // SEARCH HISTORY
  // ============================================

  async addToHistory(query: string, modules?: string, resultsCount?: number): Promise<{ error: string | null }> {
    try {
      if (storageService.isWebPlatform()) {
        const history = (await storageService.webGet<SearchHistory[]>('search_history')) || [];
        const newEntry: SearchHistory = {
          id: Date.now(),
          query,
          modules: modules || null,
          resultsCount: resultsCount || 0,
          executedAt: new Date().toISOString(),
        };
        history.unshift(newEntry);
        // Keep only last 50 searches
        if (history.length > 50) {
          history.splice(50);
        }
        await storageService.webSet('search_history', history);
        return { error: null };
      }

      const db = storageService.getDatabase();
      await db.runAsync(
        `INSERT INTO search_history (query, modules, results_count) VALUES (?, ?, ?)`,
        [query, modules || null, resultsCount || 0]
      );

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async getHistory(limit: number = 20): Promise<{ data: SearchHistory[]; error: string | null }> {
    try {
      if (storageService.isWebPlatform()) {
        const history = (await storageService.webGet<SearchHistory[]>('search_history')) || [];
        return { data: history.slice(0, limit), error: null };
      }

      const db = storageService.getDatabase();
      const history = await db.getAllAsync<SearchHistory>(
        `SELECT * FROM search_history ORDER BY executed_at DESC LIMIT ?`,
        [limit]
      );

      return { data: history, error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  },

  async clearHistory(): Promise<{ error: string | null }> {
    try {
      if (storageService.isWebPlatform()) {
        await storageService.webSet('search_history', []);
        return { error: null };
      }

      const db = storageService.getDatabase();
      await db.runAsync('DELETE FROM search_history');

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },
};
