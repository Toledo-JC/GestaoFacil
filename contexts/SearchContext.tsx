import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { globalSearchService } from '../services/global-search.service';
import { clientAnalysisService } from '../services/client-analysis.service';
import { operationalEfficiencyService } from '../services/operational-efficiency.service';
import { seasonalityService } from '../services/seasonality.service';
import {
  SearchQuery,
  SearchResults,
  SavedSearch,
  SearchHistory,
  ClientAnalysisReport,
  OperationalEfficiencyReport,
  SeasonalityReport,
} from '../types';

// ============================================
// CONTEXT TYPE
// ============================================

interface SearchContextType {
  // Search
  results: SearchResults | null;
  loading: boolean;
  search: (query: SearchQuery) => Promise<void>;
  clearResults: () => void;

  // Saved searches
  savedSearches: SavedSearch[];
  loadSavedSearches: () => Promise<void>;
  saveSearch: (search: Omit<SavedSearch, 'id' | 'useCount' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteSavedSearch: (id: number) => Promise<void>;
  executeSavedSearch: (id: number) => Promise<void>;

  // Search history
  searchHistory: SearchHistory[];
  loadHistory: () => Promise<void>;
  clearHistory: () => Promise<void>;

  // Reports
  clientAnalysis: ClientAnalysisReport | null;
  operationalEfficiency: OperationalEfficiencyReport | null;
  seasonality: SeasonalityReport | null;
  generateClientAnalysis: (startDate: string, endDate: string) => Promise<void>;
  generateOperationalReport: (startDate: string, endDate: string) => Promise<void>;
  generateSeasonalityReport: (startDate: string, endDate: string) => Promise<void>;
}

// ============================================
// CONTEXT
// ============================================

export const SearchContext = createContext<SearchContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

export function SearchProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [clientAnalysis, setClientAnalysis] = useState<ClientAnalysisReport | null>(null);
  const [operationalEfficiency, setOperationalEfficiency] = useState<OperationalEfficiencyReport | null>(null);
  const [seasonality, setSeasonality] = useState<SeasonalityReport | null>(null);

  const search = useCallback(async (query: SearchQuery) => {
    try {
      setLoading(true);
      const { data } = await globalSearchService.search(query);
      setResults(data);
    } catch (error) {
      console.error('[SearchContext] Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults(null);
  }, []);

  const loadSavedSearches = useCallback(async () => {
    const { data } = await globalSearchService.getSavedSearches();
    setSavedSearches(data);
  }, []);

  const saveSearch = useCallback(async (search: Omit<SavedSearch, 'id' | 'useCount' | 'createdAt' | 'updatedAt'>) => {
    await globalSearchService.saveSearch(search);
    await loadSavedSearches();
  }, [loadSavedSearches]);

  const deleteSavedSearch = useCallback(async (id: number) => {
    await globalSearchService.deleteSavedSearch(id);
    await loadSavedSearches();
  }, [loadSavedSearches]);

  const executeSavedSearch = useCallback(async (id: number) => {
    const savedSearch = savedSearches.find(s => s.id === id);
    if (!savedSearch) return;

    await globalSearchService.updateSearchUseCount(id);
    
    const query: SearchQuery = {
      query: savedSearch.query,
      modules: savedSearch.modules ? JSON.parse(savedSearch.modules) : undefined,
      filters: savedSearch.filters ? JSON.parse(savedSearch.filters) : undefined,
    };

    await search(query);
    await loadSavedSearches();
  }, [savedSearches, search, loadSavedSearches]);

  const loadHistory = useCallback(async () => {
    const { data } = await globalSearchService.getHistory(20);
    setSearchHistory(data);
  }, []);

  const clearHistory = useCallback(async () => {
    await globalSearchService.clearHistory();
    setSearchHistory([]);
  }, []);

  const generateClientAnalysis = useCallback(async (startDate: string, endDate: string) => {
    setLoading(true);
    try {
      const { data } = await clientAnalysisService.generateReport(startDate, endDate);
      setClientAnalysis(data);
    } catch (error) {
      console.error('[SearchContext] Client analysis error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateOperationalReport = useCallback(async (startDate: string, endDate: string) => {
    setLoading(true);
    try {
      const { data } = await operationalEfficiencyService.generateReport(startDate, endDate);
      setOperationalEfficiency(data);
    } catch (error) {
      console.error('[SearchContext] Operational report error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateSeasonalityReport = useCallback(async (startDate: string, endDate: string) => {
    setLoading(true);
    try {
      const { data } = await seasonalityService.generateReport(startDate, endDate);
      setSeasonality(data);
    } catch (error) {
      console.error('[SearchContext] Seasonality report error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: SearchContextType = {
    results,
    loading,
    search,
    clearResults,

    savedSearches,
    loadSavedSearches,
    saveSearch,
    deleteSavedSearch,
    executeSavedSearch,

    searchHistory,
    loadHistory,
    clearHistory,

    clientAnalysis,
    operationalEfficiency,
    seasonality,
    generateClientAnalysis,
    generateOperationalReport,
    generateSeasonalityReport,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}
