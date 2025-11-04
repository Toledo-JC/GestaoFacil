import React, { createContext, useState, useEffect, ReactNode } from 'react';
import {
  BankAccount,
  FinancialCategory,
  AccountReceivable,
  AccountPayable,
  FinancialSummary,
  MonthlyReport,
  CategoryReport,
} from '../types';
import { bankAccountService } from '../services/bank-account.service';
import { financialCategoryService } from '../services/financial-category.service';
import { accountsReceivableService } from '../services/accounts-receivable.service';
import { accountsPayableService } from '../services/accounts-payable.service';
import { financialReportService } from '../services/financial-report.service';

interface FinancialContextType {
  // Bank Accounts
  bankAccounts: BankAccount[];
  createBankAccount: (account: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>) => Promise<BankAccount>;
  updateBankAccount: (id: number, data: Partial<BankAccount>) => Promise<void>;
  deleteBankAccount: (id: number) => Promise<void>;

  // Categories
  categories: FinancialCategory[];
  incomeCategories: FinancialCategory[];
  expenseCategories: FinancialCategory[];
  createCategory: (category: Omit<FinancialCategory, 'id' | 'createdAt'>) => Promise<FinancialCategory>;

  // Receivables
  receivables: AccountReceivable[];
  createReceivable: (receivable: Omit<AccountReceivable, 'id' | 'createdAt' | 'updatedAt'>) => Promise<AccountReceivable>;
  updateReceivable: (id: number, data: Partial<AccountReceivable>) => Promise<void>;
  receivePayment: (id: number, paymentDate: string, paymentMethod: string, bankAccountId?: number) => Promise<void>;

  // Payables
  payables: AccountPayable[];
  createPayable: (payable: Omit<AccountPayable, 'id' | 'createdAt' | 'updatedAt'>) => Promise<AccountPayable>;
  updatePayable: (id: number, data: Partial<AccountPayable>) => Promise<void>;
  payExpense: (id: number, paymentDate: string, paymentMethod: string, bankAccountId?: number) => Promise<void>;

  // Reports
  summary: FinancialSummary | null;
  monthlyReports: MonthlyReport[];
  loadReports: () => Promise<void>;
  getCategoryReport: (type: 'INCOME' | 'EXPENSE', months?: number) => Promise<CategoryReport[]>;

  loading: boolean;
  refresh: () => Promise<void>;
}

export const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export function FinancialProvider({ children }: { children: ReactNode }) {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [receivables, setReceivables] = useState<AccountReceivable[]>([]);
  const [payables, setPayables] = useState<AccountPayable[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      await loadData();
      await financialCategoryService.seedDefaultCategories();
      await checkOverdueAccounts();
    } catch (error) {
      console.error('Error initializing financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    const [accounts, cats, recv, pay] = await Promise.all([
      bankAccountService.getAll(),
      financialCategoryService.getAll(),
      accountsReceivableService.getAll(),
      accountsPayableService.getAll(),
    ]);

    setBankAccounts(accounts);
    setCategories(cats);
    setReceivables(recv);
    setPayables(pay);
  };

  const loadReports = async () => {
    const [summaryData, monthlyData] = await Promise.all([
      financialReportService.getSummary(),
      financialReportService.getMonthlyReports(6),
    ]);

    setSummary(summaryData);
    setMonthlyReports(monthlyData);
  };

  const checkOverdueAccounts = async () => {
    await Promise.all([
      accountsReceivableService.checkOverdue(),
      accountsPayableService.checkOverdue(),
    ]);
  };

  const refresh = async () => {
    setLoading(true);
    await loadData();
    await loadReports();
    setLoading(false);
  };

  const incomeCategories = categories.filter(c => c.type === 'INCOME' && c.active);
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE' && c.active);

  return (
    <FinancialContext.Provider
      value={{
        bankAccounts,
        createBankAccount: async (account) => {
          const created = await bankAccountService.create(account);
          await loadData();
          return created;
        },
        updateBankAccount: async (id, data) => {
          await bankAccountService.update(id, data);
          await loadData();
        },
        deleteBankAccount: async (id) => {
          await bankAccountService.delete(id);
          await loadData();
        },

        categories,
        incomeCategories,
        expenseCategories,
        createCategory: async (category) => {
          const created = await financialCategoryService.create(category);
          await loadData();
          return created;
        },

        receivables,
        createReceivable: async (receivable) => {
          const created = await accountsReceivableService.create(receivable);
          await loadData();
          return created;
        },
        updateReceivable: async (id, data) => {
          await accountsReceivableService.update(id, data);
          await loadData();
        },
        receivePayment: async (id, paymentDate, paymentMethod, bankAccountId) => {
          await accountsReceivableService.receivePayment(id, paymentDate, paymentMethod, bankAccountId);
          await refresh();
        },

        payables,
        createPayable: async (payable) => {
          const created = await accountsPayableService.create(payable);
          await loadData();
          return created;
        },
        updatePayable: async (id, data) => {
          await accountsPayableService.update(id, data);
          await loadData();
        },
        payExpense: async (id, paymentDate, paymentMethod, bankAccountId) => {
          await accountsPayableService.payExpense(id, paymentDate, paymentMethod, bankAccountId);
          await refresh();
        },

        summary,
        monthlyReports,
        loadReports,
        getCategoryReport: financialReportService.getCategoryReport,

        loading,
        refresh,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
}
