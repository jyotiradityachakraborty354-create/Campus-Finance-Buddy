import React, { useMemo, useState } from 'react';
import {
  AppPreferences,
  CategoryBudgetMap,
  ChatMessage,
  NavigationSection,
  SavingsGoal,
  Transaction,
} from './types/finance';
import {
  INITIAL_CHAT_MESSAGES,
  loadChatHistory,
  loadPreferences,
  loadSavingsGoals,
  loadTransactions,
  resetAllToOfficialDemoData,
  saveChatHistory,
  savePreferences,
  saveSavingsGoals,
  saveTransactions,
} from './services/storage';
import {
  calculateCategoryTotals,
  calculateRemainingBalance,
  calculateTotalExpenses,
} from './services/financeEngine';
import { AppShell } from './layouts/AppShell';
import { OverviewPage } from './pages/OverviewPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AssistantPage } from './pages/AssistantPage';
import { BudgetPlannerPage } from './pages/BudgetPlannerPage';
import { SavingsGoalsPage } from './pages/SavingsGoalsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const [activeSection, setActiveSection] = useState<NavigationSection>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions());
  const [preferences, setPreferences] = useState<AppPreferences>(() => loadPreferences());
  const [goals, setGoals] = useState<SavingsGoal[]>(() => loadSavingsGoals());
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => loadChatHistory());
  const [quickAddTrigger, setQuickAddTrigger] = useState<number>(0);

  // Filter transactions by selected month unless 'all' is selected
  const activeTransactions = useMemo(() => {
    if (preferences.selectedMonth === 'all') {
      return transactions;
    }
    const monthFiltered = transactions.filter((tx) =>
      tx.date.startsWith(preferences.selectedMonth)
    );
    return monthFiltered;
  }, [transactions, preferences.selectedMonth]);

  const totalExpenses = useMemo(
    () => calculateTotalExpenses(activeTransactions),
    [activeTransactions]
  );

  const remainingBalance = useMemo(
    () => calculateRemainingBalance(preferences.monthlyAllowance, totalExpenses),
    [preferences.monthlyAllowance, totalExpenses]
  );

  const categoryTotals = useMemo(
    () => calculateCategoryTotals(activeTransactions),
    [activeTransactions]
  );

  // Handlers for Preferences
  const handleUpdateAllowance = (newAllowance: number) => {
    const nextPrefs: AppPreferences = {
      ...preferences,
      monthlyAllowance: newAllowance,
    };
    setPreferences(nextPrefs);
    savePreferences(nextPrefs);
  };

  const handleChangeMonth = (month: string) => {
    const nextPrefs: AppPreferences = {
      ...preferences,
      selectedMonth: month,
    };
    setPreferences(nextPrefs);
    savePreferences(nextPrefs);
  };

  const handleApplyRevisedBudget = (
    revisedBudgets: CategoryBudgetMap,
    newSavingsTarget: number
  ) => {
    const nextPrefs: AppPreferences = {
      ...preferences,
      customCategoryBudgets: revisedBudgets,
      savingsTarget: newSavingsTarget,
    };
    setPreferences(nextPrefs);
    savePreferences(nextPrefs);
  };

  // Handlers for Transactions
  const handleAddTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    const next = [newTx, ...transactions];
    setTransactions(next);
    saveTransactions(next);
  };

  const handleUpdateTransaction = (updated: Transaction) => {
    const next = transactions.map((tx) => (tx.id === updated.id ? updated : tx));
    setTransactions(next);
    saveTransactions(next);
  };

  const handleDeleteTransaction = (id: string) => {
    const next = transactions.filter((tx) => tx.id !== id);
    setTransactions(next);
    saveTransactions(next);
  };

  // Handlers for Savings Goals
  const handleAddGoal = (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const next = [...goals, newGoal];
    setGoals(next);
    saveSavingsGoals(next);
  };

  const handleUpdateGoal = (updated: SavingsGoal) => {
    const next = goals.map((g) => (g.id === updated.id ? updated : g));
    setGoals(next);
    saveSavingsGoals(next);
  };

  const handleDeleteGoal = (id: string) => {
    const next = goals.filter((g) => g.id !== id);
    setGoals(next);
    saveSavingsGoals(next);
  };

  // Handlers for Chat History
  const handleUpdateChatHistory = (messages: ChatMessage[]) => {
    setChatHistory(messages);
    saveChatHistory(messages);
  };

  const handleClearConversation = () => {
    const resetMessages = [...INITIAL_CHAT_MESSAGES];
    setChatHistory(resetMessages);
    saveChatHistory(resetMessages);
  };

  // Reset Official Hackathon Demo Dataset
  const handleResetDemoData = () => {
    const restored = resetAllToOfficialDemoData();
    setTransactions(restored.transactions);
    setPreferences(restored.preferences);
    setGoals(restored.goals);
    setChatHistory(restored.chatHistory);
  };

  // Quick Add Expense Action from Sidebar/Topbar/Overview
  const handleQuickAddExpense = () => {
    setActiveSection('expenses');
    setQuickAddTrigger((prev) => prev + 1);
  };

  return (
    <AppShell
      activeSection={activeSection}
      onSelectSection={setActiveSection}
      onQuickAddExpense={handleQuickAddExpense}
      monthlyAllowance={preferences.monthlyAllowance}
      remainingBalance={remainingBalance}
    >
      {activeSection === 'overview' && (
        <OverviewPage
          transactions={activeTransactions}
          allTransactions={transactions}
          monthlyAllowance={preferences.monthlyAllowance}
          selectedMonth={preferences.selectedMonth}
          categoryTotals={categoryTotals}
          onChangeMonth={handleChangeMonth}
          onUpdateAllowance={handleUpdateAllowance}
          onOpenAddExpense={handleQuickAddExpense}
          onNavigate={setActiveSection}
        />
      )}

      {activeSection === 'expenses' && (
        <ExpensesPage
          transactions={activeTransactions}
          onAddTransaction={handleAddTransaction}
          onUpdateTransaction={handleUpdateTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          openModalTrigger={quickAddTrigger}
        />
      )}

      {activeSection === 'analytics' && (
        <AnalyticsPage
          transactions={activeTransactions}
          monthlyAllowance={preferences.monthlyAllowance}
          categoryTotals={categoryTotals}
          categoryBudgets={preferences.customCategoryBudgets}
        />
      )}

      {activeSection === 'assistant' && (
        <AssistantPage
          messages={chatHistory}
          onUpdateMessages={handleUpdateChatHistory}
          onClearConversation={handleClearConversation}
          monthlyAllowance={preferences.monthlyAllowance}
          totalExpenses={totalExpenses}
          categoryTotals={categoryTotals}
          currentBudget={preferences.customCategoryBudgets}
          savingsTarget={preferences.savingsTarget}
        />
      )}

      {activeSection === 'planner' && (
        <BudgetPlannerPage
          monthlyAllowance={preferences.monthlyAllowance}
          categoryTotals={categoryTotals}
          savingsTarget={preferences.savingsTarget}
          onApplyRevisedBudget={handleApplyRevisedBudget}
          onLoadHackathonDemoDataset={handleResetDemoData}
        />
      )}

      {activeSection === 'goals' && (
        <SavingsGoalsPage
          goals={goals}
          onAddGoal={handleAddGoal}
          onUpdateGoal={handleUpdateGoal}
          onDeleteGoal={handleDeleteGoal}
        />
      )}

      {activeSection === 'settings' && (
        <SettingsPage
          monthlyAllowance={preferences.monthlyAllowance}
          transactionCount={transactions.length}
          goalCount={goals.length}
          onUpdateAllowance={handleUpdateAllowance}
          onResetDemoData={handleResetDemoData}
        />
      )}
    </AppShell>
  );
}
