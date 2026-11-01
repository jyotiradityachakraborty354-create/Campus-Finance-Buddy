export enum ExpenseCategory {
  Food = 'Food',
  Travel = 'Travel',
  Education = 'Education',
  Shopping = 'Shopping',
  Entertainment = 'Entertainment',
  Other = 'Other',
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  ExpenseCategory.Food,
  ExpenseCategory.Travel,
  ExpenseCategory.Education,
  ExpenseCategory.Shopping,
  ExpenseCategory.Entertainment,
  ExpenseCategory.Other,
];

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  notes?: string;
}

export type CategoryBudgetMap = Record<ExpenseCategory, number>;

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  deadline?: string;
  notes?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isFallback?: boolean;
}

export interface RevisedBudgetCategoryDetail {
  category: ExpenseCategory;
  originalAmount: number;
  revisedAmount: number;
  deltaAmount: number; // positive means reduction
  deltaPercentage: number;
  isLocked: boolean;
  rationale: string;
}

export interface BudgetValidationResult {
  passed: boolean;
  checks: {
    id: string;
    label: string;
    passed: boolean;
    actualValue: string;
    expectedValue: string;
  }[];
}

export interface BudgetPlanResult {
  monthlyAllowance: number;
  originalTotalExpenses: number;
  revisedTotalExpenses: number;
  originalRemainingBalance: number;
  revisedRemainingBalance: number;
  targetAdditionalSavings: number;
  actualAdditionalSavings: number;
  categories: RevisedBudgetCategoryDetail[];
  validation: BudgetValidationResult;
  aiSummary?: string;
  isFallbackExplanation?: boolean;
}

export interface AppPreferences {
  monthlyAllowance: number;
  selectedMonth: string; // YYYY-MM
  customCategoryBudgets: CategoryBudgetMap;
  savingsTarget: number;
}

export type NavigationSection =
  | 'overview'
  | 'expenses'
  | 'analytics'
  | 'assistant'
  | 'planner'
  | 'goals'
  | 'settings';
