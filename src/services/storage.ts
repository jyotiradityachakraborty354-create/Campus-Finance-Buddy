import {
  AppPreferences,
  CategoryBudgetMap,
  ChatMessage,
  ExpenseCategory,
  SavingsGoal,
  Transaction,
} from '../types/finance';

const STORAGE_KEYS = {
  TRANSACTIONS: 'cfb_transactions_v1',
  PREFERENCES: 'cfb_preferences_v1',
  SAVINGS_GOALS: 'cfb_savings_goals_v1',
  CHAT_HISTORY: 'cfb_chat_history_v1',
};

export const DEFAULT_MONTH = '2026-10';
export const DEFAULT_MONTHLY_ALLOWANCE = 8000;

export const OFFICIAL_DEMO_CATEGORY_BUDGETS: CategoryBudgetMap = {
  [ExpenseCategory.Food]: 2400,
  [ExpenseCategory.Travel]: 800,
  [ExpenseCategory.Education]: 1200,
  [ExpenseCategory.Shopping]: 1000,
  [ExpenseCategory.Entertainment]: 900,
  [ExpenseCategory.Other]: 500,
};

/**
 * Official Hackathon Demo Transactions whose category totals equal:
 * Food: ₹2,400 | Travel: ₹800 | Education: ₹1,200 | Shopping: ₹1,000 | Entertainment: ₹900 | Other: ₹500
 * Total Expenses: ₹6,800 | Monthly Allowance: ₹8,000 | Remaining Balance: ₹1,200 (85% spent)
 */
export const OFFICIAL_DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'demo-food-1',
    description: 'Hostel Mess Monthly Subscription',
    amount: 1450,
    category: ExpenseCategory.Food,
    date: '2026-10-02',
    notes: 'Standard weekday lunch and dinner plan',
  },
  {
    id: 'demo-food-2',
    description: 'Evening Canteen Tiffin & Filter Coffee',
    amount: 550,
    category: ExpenseCategory.Food,
    date: '2026-10-11',
    notes: 'Post-lecture snacks with lab group',
  },
  {
    id: 'demo-food-3',
    description: 'Late-Night Exam Study Food Delivery',
    amount: 400,
    category: ExpenseCategory.Food,
    date: '2026-10-21',
    notes: 'Biryani & rolls during mid-sem prep',
  },
  {
    id: 'demo-travel-1',
    description: 'Metro & City Bus Student Pass Recharge',
    amount: 500,
    category: ExpenseCategory.Travel,
    date: '2026-10-03',
    notes: 'Monthly transit smart card top-up',
  },
  {
    id: 'demo-travel-2',
    description: 'Shared Auto Rides to Railway Station & City',
    amount: 300,
    category: ExpenseCategory.Travel,
    date: '2026-10-17',
    notes: 'Weekend commute trips',
  },
  {
    id: 'demo-edu-1',
    description: 'Data Structures Reference Book & Lab Manual',
    amount: 750,
    category: ExpenseCategory.Education,
    date: '2026-10-05',
    notes: 'Mandatory semester coursework material',
  },
  {
    id: 'demo-edu-2',
    description: 'IEEE Student Workshop & Lab Printing',
    amount: 450,
    category: ExpenseCategory.Education,
    date: '2026-10-15',
    notes: 'Technical symposium registration and record binding',
  },
  {
    id: 'demo-shop-1',
    description: 'Campus Store Hoodie & Casual T-Shirt',
    amount: 650,
    category: ExpenseCategory.Shopping,
    date: '2026-10-09',
    notes: 'Seasonal wardrobe purchase',
  },
  {
    id: 'demo-shop-2',
    description: 'Braided USB-C Cable & Desk Organizer',
    amount: 350,
    category: ExpenseCategory.Shopping,
    date: '2026-10-19',
    notes: 'Dorm desk accessories',
  },
  {
    id: 'demo-ent-1',
    description: 'Weekend Cinema Outing & Popcorn',
    amount: 550,
    category: ExpenseCategory.Entertainment,
    date: '2026-10-14',
    notes: 'Friday evening show with hostel friends',
  },
  {
    id: 'demo-ent-2',
    description: 'Music Streaming & Campus Gaming Night',
    amount: 350,
    category: ExpenseCategory.Entertainment,
    date: '2026-10-24',
    notes: 'Student plan renewal and tournament entry',
  },
  {
    id: 'demo-other-1',
    description: 'Hostel Laundry & Ironing Service',
    amount: 300,
    category: ExpenseCategory.Other,
    date: '2026-10-12',
    notes: 'Monthly wash and press package',
  },
  {
    id: 'demo-other-2',
    description: 'Pharmacy Basics & Notebook Refills',
    amount: 200,
    category: ExpenseCategory.Other,
    date: '2026-10-25',
    notes: 'First-aid supplies and pens',
  },
];

export const OFFICIAL_DEMO_GOALS: SavingsGoal[] = [
  {
    id: 'goal-emergency',
    title: 'Student Emergency Buffer',
    targetAmount: 5000,
    savedAmount: 2400,
    deadline: '2026-12-31',
    notes: 'Reserve for unplanned medical or travel emergencies',
    createdAt: '2026-09-01',
  },
  {
    id: 'goal-monitor',
    title: 'External Coding Monitor (24-inch)',
    targetAmount: 9500,
    savedAmount: 3800,
    deadline: '2027-02-15',
    notes: 'For dual-screen project development in dorm',
    createdAt: '2026-09-15',
  },
  {
    id: 'goal-certification',
    title: 'Cloud Associate Exam Voucher',
    targetAmount: 3000,
    savedAmount: 1950,
    deadline: '2026-11-30',
    notes: 'Final-year placement certification fee',
    createdAt: '2026-10-01',
  },
];

export const DEFAULT_PREFERENCES: AppPreferences = {
  monthlyAllowance: DEFAULT_MONTHLY_ALLOWANCE,
  selectedMonth: DEFAULT_MONTH,
  customCategoryBudgets: { ...OFFICIAL_DEMO_CATEGORY_BUDGETS },
  savingsTarget: 500,
};

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-msg',
    role: 'assistant',
    content:
      'Welcome to Campus Finance Buddy. I have loaded your October financial context: ₹8,000 monthly allowance, ₹6,800 total expenses across 6 categories, and ₹1,200 remaining balance (85% utilized). Ask me to analyze your spending, explain financial concepts, or help you save an extra ₹500 next month.',
    timestamp: new Date().toISOString(),
  },
];

function safeParseJSON<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function loadTransactions(): Transaction[] {
  if (typeof window === 'undefined') return OFFICIAL_DEMO_TRANSACTIONS;
  const raw = window.localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  if (!raw) {
    saveTransactions(OFFICIAL_DEMO_TRANSACTIONS);
    return OFFICIAL_DEMO_TRANSACTIONS;
  }
  const parsed = safeParseJSON<Transaction[]>(raw, OFFICIAL_DEMO_TRANSACTIONS);
  if (!Array.isArray(parsed)) {
    saveTransactions(OFFICIAL_DEMO_TRANSACTIONS);
    return OFFICIAL_DEMO_TRANSACTIONS;
  }
  return parsed;
}

export function saveTransactions(transactions: Transaction[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch {
    // Ignore quota errors
  }
}

export function loadPreferences(): AppPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  const raw = window.localStorage.getItem(STORAGE_KEYS.PREFERENCES);
  if (!raw) {
    savePreferences(DEFAULT_PREFERENCES);
    return DEFAULT_PREFERENCES;
  }
  const parsed = safeParseJSON<Partial<AppPreferences>>(raw, DEFAULT_PREFERENCES);
  return {
    monthlyAllowance:
      typeof parsed.monthlyAllowance === 'number' && parsed.monthlyAllowance >= 0
        ? parsed.monthlyAllowance
        : DEFAULT_PREFERENCES.monthlyAllowance,
    selectedMonth:
      typeof parsed.selectedMonth === 'string' && parsed.selectedMonth.length === 7
        ? parsed.selectedMonth
        : DEFAULT_PREFERENCES.selectedMonth,
    customCategoryBudgets: {
      ...OFFICIAL_DEMO_CATEGORY_BUDGETS,
      ...(parsed.customCategoryBudgets || {}),
    },
    savingsTarget:
      typeof parsed.savingsTarget === 'number' && parsed.savingsTarget >= 0
        ? parsed.savingsTarget
        : DEFAULT_PREFERENCES.savingsTarget,
  };
}

export function savePreferences(prefs: AppPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  } catch {
    // Ignore quota errors
  }
}

export function loadSavingsGoals(): SavingsGoal[] {
  if (typeof window === 'undefined') return OFFICIAL_DEMO_GOALS;
  const raw = window.localStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS);
  if (!raw) {
    saveSavingsGoals(OFFICIAL_DEMO_GOALS);
    return OFFICIAL_DEMO_GOALS;
  }
  const parsed = safeParseJSON<SavingsGoal[]>(raw, OFFICIAL_DEMO_GOALS);
  return Array.isArray(parsed) ? parsed : OFFICIAL_DEMO_GOALS;
}

export function saveSavingsGoals(goals: SavingsGoal[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(goals));
  } catch {
    // Ignore quota errors
  }
}

export function loadChatHistory(): ChatMessage[] {
  if (typeof window === 'undefined') return INITIAL_CHAT_MESSAGES;
  const raw = window.localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
  if (!raw) {
    saveChatHistory(INITIAL_CHAT_MESSAGES);
    return INITIAL_CHAT_MESSAGES;
  }
  const parsed = safeParseJSON<ChatMessage[]>(raw, INITIAL_CHAT_MESSAGES);
  return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CHAT_MESSAGES;
}

export function saveChatHistory(messages: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(messages));
  } catch {
    // Ignore quota errors
  }
}

export function resetAllToOfficialDemoData(): {
  transactions: Transaction[];
  preferences: AppPreferences;
  goals: SavingsGoal[];
  chatHistory: ChatMessage[];
} {
  const transactions = [...OFFICIAL_DEMO_TRANSACTIONS];
  const preferences: AppPreferences = {
    monthlyAllowance: DEFAULT_MONTHLY_ALLOWANCE,
    selectedMonth: DEFAULT_MONTH,
    customCategoryBudgets: { ...OFFICIAL_DEMO_CATEGORY_BUDGETS },
    savingsTarget: 500,
  };
  const goals = [...OFFICIAL_DEMO_GOALS];
  const chatHistory = [...INITIAL_CHAT_MESSAGES];

  saveTransactions(transactions);
  savePreferences(preferences);
  saveSavingsGoals(goals);
  saveChatHistory(chatHistory);

  return { transactions, preferences, goals, chatHistory };
}
