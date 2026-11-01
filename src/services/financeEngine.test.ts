import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCategoryTotals,
  calculateRemainingBalance,
  calculateSavings,
  calculateSpendingPercentage,
  calculateTotalExpenses,
  formatINR,
  generateRevisedBudget,
  getHighestSpendingCategory,
} from './financeEngine';
import { ExpenseCategory, Transaction } from '../types/finance';

const DEMO_TRANSACTIONS: Transaction[] = [
  { id: '1', description: 'Campus Mess Monthly Pass', amount: 1500, category: ExpenseCategory.Food, date: '2026-10-02' },
  { id: '2', description: 'Late Night Canteen & Snacks', amount: 900, category: ExpenseCategory.Food, date: '2026-10-08' },
  { id: '3', description: 'Metro Smart Card Recharge', amount: 500, category: ExpenseCategory.Travel, date: '2026-10-04' },
  { id: '4', description: 'Shared Auto Commutes', amount: 300, category: ExpenseCategory.Travel, date: '2026-10-14' },
  { id: '5', description: 'Algorithms Textbook & Lab Manual', amount: 850, category: ExpenseCategory.Education, date: '2026-10-05' },
  { id: '6', description: 'Cloud Computing Workshop Fee', amount: 350, category: ExpenseCategory.Education, date: '2026-10-18' },
  { id: '7', description: 'Winter Hoodie & Basic Apparel', amount: 650, category: ExpenseCategory.Shopping, date: '2026-10-11' },
  { id: '8', description: 'USB-C Hub & Desk Lamp', amount: 350, category: ExpenseCategory.Shopping, date: '2026-10-21' },
  { id: '9', description: 'Weekend Movie & IMAX Outing', amount: 550, category: ExpenseCategory.Entertainment, date: '2026-10-16' },
  { id: '10', description: 'Campus Fest Pass & Music Sub', amount: 350, category: ExpenseCategory.Entertainment, date: '2026-10-24' },
  { id: '11', description: 'Hostel Laundry & Dry Cleaning', amount: 300, category: ExpenseCategory.Other, date: '2026-10-12' },
  { id: '12', description: 'Photocopies & Stationery Supplies', amount: 200, category: ExpenseCategory.Other, date: '2026-10-26' },
];

test('Official Hackathon Demo Dataset totals match specification exactly', () => {
  const allowance = 8000;
  const totalExpenses = calculateTotalExpenses(DEMO_TRANSACTIONS);
  const remaining = calculateRemainingBalance(allowance, totalExpenses);
  const pct = calculateSpendingPercentage(totalExpenses, allowance);
  const savings = calculateSavings(allowance, totalExpenses);
  const catTotals = calculateCategoryTotals(DEMO_TRANSACTIONS);
  const highest = getHighestSpendingCategory(catTotals);

  assert.equal(totalExpenses, 6800);
  assert.equal(remaining, 1200);
  assert.equal(pct, 85);
  assert.equal(savings, 1200);
  assert.equal(catTotals[ExpenseCategory.Food], 2400);
  assert.equal(catTotals[ExpenseCategory.Travel], 800);
  assert.equal(catTotals[ExpenseCategory.Education], 1200);
  assert.equal(catTotals[ExpenseCategory.Shopping], 1000);
  assert.equal(catTotals[ExpenseCategory.Entertainment], 900);
  assert.equal(catTotals[ExpenseCategory.Other], 500);
  assert.equal(highest.category, ExpenseCategory.Food);
  assert.equal(highest.amount, 2400);
  assert.equal(formatINR(8000), '₹8,000');
});

test('Mandatory ₹500 Savings Test generates exact expected category budget and passes all validations', () => {
  const catTotals = calculateCategoryTotals(DEMO_TRANSACTIONS);
  const plan = generateRevisedBudget({
    allowance: 8000,
    originalTotals: catTotals,
    targetAdditionalSavings: 500,
    lockedCategories: [ExpenseCategory.Education],
  });

  assert.equal(plan.monthlyAllowance, 8000);
  assert.equal(plan.originalTotalExpenses, 6800);
  assert.equal(plan.revisedTotalExpenses, 6300);
  assert.equal(plan.originalRemainingBalance, 1200);
  assert.equal(plan.revisedRemainingBalance, 1700);
  assert.equal(plan.actualAdditionalSavings, 500);
  assert.equal(plan.validation.passed, true);

  const byCat = Object.fromEntries(plan.categories.map((c) => [c.category, c.revisedAmount]));
  assert.equal(byCat[ExpenseCategory.Food], 2200);
  assert.equal(byCat[ExpenseCategory.Travel], 700);
  assert.equal(byCat[ExpenseCategory.Education], 1200);
  assert.equal(byCat[ExpenseCategory.Shopping], 800);
  assert.equal(byCat[ExpenseCategory.Entertainment], 900);
  assert.equal(byCat[ExpenseCategory.Other], 500);
});

test('Custom savings targets keep locked categories untouched and prevent negative budgets', () => {
  const catTotals = calculateCategoryTotals(DEMO_TRANSACTIONS);
  const plan = generateRevisedBudget({
    allowance: 8000,
    originalTotals: catTotals,
    targetAdditionalSavings: 1000,
    lockedCategories: [ExpenseCategory.Education, ExpenseCategory.Other],
  });

  assert.equal(plan.revisedTotalExpenses, 5800);
  assert.equal(plan.actualAdditionalSavings, 1000);
  assert.equal(plan.revisedRemainingBalance, 2200);
  assert.equal(plan.validation.passed, true);

  const byCat = Object.fromEntries(plan.categories.map((c) => [c.category, c.revisedAmount]));
  assert.equal(byCat[ExpenseCategory.Education], 1200);
  assert.equal(byCat[ExpenseCategory.Other], 500);
});
