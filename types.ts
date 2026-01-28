
export interface User {
  id: string;
  name: string;
  email: string;
  isPro: boolean;
  credits: number;
}

export interface Transaction {
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'expense' | 'income';
}

export interface FinancialAnalysis {
  summary: string;
  totalExpenses: number;
  totalIncome: number;
  topCategories: { category: string; amount: number }[];
  suggestions: string[];
  transactions: Transaction[];
}

export interface AnalysisHistoryItem {
  id: string;
  timestamp: string;
  analysis: FinancialAnalysis;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}
