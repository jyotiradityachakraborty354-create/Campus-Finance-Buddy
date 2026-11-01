import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Plus,
  ArrowUpRight,
  Pencil,
  Check,
  X,
  Calculator,
  Calendar,
} from 'lucide-react';
import {
  CategoryBudgetMap,
  EXPENSE_CATEGORIES,
  NavigationSection,
  Transaction,
} from '../types/finance';
import {
  calculateRemainingBalance,
  calculateSavings,
  calculateSpendingPercentage,
  calculateTotalExpenses,
  formatINR,
  getHighestSpendingCategory,
} from '../services/financeEngine';
import { Button, Card, Input } from '../components/ui/primitives';

interface OverviewPageProps {
  transactions: Transaction[];
  allTransactions: Transaction[];
  monthlyAllowance: number;
  selectedMonth: string;
  categoryTotals: CategoryBudgetMap;
  onChangeMonth: (month: string) => void;
  onUpdateAllowance: (newAllowance: number) => void;
  onOpenAddExpense: () => void;
  onNavigate: (section: NavigationSection) => void;
}

const AVAILABLE_MONTHS = [
  { value: '2026-10', label: 'October 2026 (Hackathon Official)' },
  { value: '2026-09', label: 'September 2026' },
  { value: '2026-11', label: 'November 2026' },
  { value: 'all', label: 'All Recorded Months' },
];

export const OverviewPage: React.FC<OverviewPageProps> = ({
  transactions,
  monthlyAllowance,
  selectedMonth,
  categoryTotals,
  onChangeMonth,
  onUpdateAllowance,
  onOpenAddExpense,
  onNavigate,
}) => {
  const [editingAllowance, setEditingAllowance] = useState(false);
  const [allowanceDraft, setAllowanceDraft] = useState(String(monthlyAllowance));
  const [allowanceError, setAllowanceError] = useState('');

  const totalExpenses = calculateTotalExpenses(transactions);
  const remainingBalance = calculateRemainingBalance(monthlyAllowance, totalExpenses);
  const monthlySavings = calculateSavings(monthlyAllowance, totalExpenses);
  const utilizationPct = calculateSpendingPercentage(totalExpenses, monthlyAllowance);
  const highestCategory = getHighestSpendingCategory(categoryTotals);

  const handleStartEditAllowance = () => {
    setAllowanceDraft(String(monthlyAllowance));
    setAllowanceError('');
    setEditingAllowance(true);
  };

  const handleSaveAllowance = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(allowanceDraft);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setAllowanceError('Please enter a valid positive amount in INR.');
      return;
    }
    onUpdateAllowance(Math.round(parsed));
    setEditingAllowance(false);
    setAllowanceError('');
  };

  const categoryChartData = EXPENSE_CATEGORIES.map((category) => ({
    name: category,
    amount: categoryTotals[category] || 0,
    percentage:
      totalExpenses > 0
        ? Math.round(((categoryTotals[category] || 0) / totalExpenses) * 100)
        : 0,
  }));

  const recentTransactions = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  return (
    <div className="space-y-[32px]">
      {/* Hero Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-[16px]">
        <div className="max-w-[520px]">
          <p className="text-[12px] uppercase tracking-[0.05em] text-[#737373] font-medium">
            Financial Blueprint · Student Ledger
          </p>
          <h1 className="display-heading mt-[4px]">Overview</h1>
          <p className="text-[14px] text-[#737373] mt-[6px]">
            Your Money. Your Decisions. Your Future. Real-time allowance, expenditure, and savings telemetry.
          </p>
        </div>

        {/* Month Selector & Quick Actions */}
        <div className="flex flex-wrap items-center gap-[8px] shrink-0">
          <div className="relative flex items-center">
            <Calendar className="w-[14px] h-[14px] text-[#737373] absolute left-[12px] pointer-events-none" />
            <select
              aria-label="Select Month"
              value={selectedMonth}
              onChange={(e) => onChangeMonth(e.target.value)}
              className="h-[38px] bg-[#ffffff] text-[#0a0a0a] border border-[#e5e5e5] rounded-[18px] pl-[34px] pr-[14px] text-[13px] font-medium focus:outline-none focus:border-[#0a0a0a] cursor-pointer"
            >
              {AVAILABLE_MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="md"
            onClick={() => onNavigate('planner')}
          >
            <Calculator className="w-[14px] h-[14px]" />
            <span>₹500 Savings Test</span>
          </Button>

          <Button variant="primary" size="md" onClick={onOpenAddExpense}>
            <Plus className="w-[14px] h-[14px]" />
            <span>Add Expense</span>
          </Button>
        </div>
      </div>

      {/* Primary 6 Stat Blocks (DESIGN.md Stat Block specification) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px]">
        {/* 1. Monthly Allowance */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between gap-[8px]">
            <span className="text-[12px] uppercase tracking-[0.05em] text-[#737373] font-medium">
              Monthly Allowance
            </span>
            {!editingAllowance && (
              <button
                type="button"
                onClick={handleStartEditAllowance}
                aria-label="Edit Monthly Allowance"
                className="inline-flex items-center gap-[4px] text-[12px] text-[#737373] hover:text-[#0a0a0a] cursor-pointer"
              >
                <Pencil className="w-[12px] h-[12px]" />
                <span>Edit</span>
              </button>
            )}
          </div>

          {editingAllowance ? (
            <form onSubmit={handleSaveAllowance} className="mt-[12px] space-y-[8px]">
              <div className="flex items-center gap-[8px]">
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={allowanceDraft}
                  onChange={(e) => setAllowanceDraft(e.target.value)}
                  aria-label="New Monthly Allowance in INR"
                  className="font-mono"
                  autoFocus
                />
                <Button type="submit" variant="primary" size="sm" aria-label="Save Allowance">
                  <Check className="w-[14px] h-[14px]" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingAllowance(false)}
                  aria-label="Cancel Edit Allowance"
                >
                  <X className="w-[14px] h-[14px]" />
                </Button>
              </div>
              {allowanceError && (
                <p className="text-[12px] text-[#e7000b]">{allowanceError}</p>
              )}
            </form>
          ) : (
            <div className="mt-[10px]">
              <div className="metric-value" data-testid="overview-monthly-allowance">
                {formatINR(monthlyAllowance)}
              </div>
              <p className="text-[13px] text-[#737373] mt-[6px]">
                Base monthly student budget allocation
              </p>
            </div>
          )}
        </Card>

        {/* 2. Total Monthly Expenses */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12px] uppercase tracking-[0.05em] text-[#737373] font-medium">
              Total Monthly Expenses
            </span>
            <span className="text-[12px] text-[#737373] font-mono tabular-nums">
              {transactions.length} entries
            </span>
          </div>
          <div className="mt-[10px]">
            <div className="metric-value" data-testid="overview-total-expenses">
              {formatINR(totalExpenses)}
            </div>
            <p className="text-[13px] text-[#737373] mt-[6px]">
              Across all 6 campus expense categories
            </p>
          </div>
        </Card>

        {/* 3. Remaining Balance */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12px] uppercase tracking-[0.05em] text-[#737373] font-medium">
              Remaining Balance
            </span>
            <span className="text-[12px] text-[#737373]">
              {remainingBalance >= 0 ? 'Within allowance' : 'Over allowance'}
            </span>
          </div>
          <div className="mt-[10px]">
            <div
              className={`metric-value ${
                remainingBalance < 0 ? '!text-[#e7000b]' : ''
              }`}
              data-testid="overview-remaining-balance"
            >
              {formatINR(remainingBalance)}
            </div>
            <p className="text-[13px] text-[#737373] mt-[6px]">
              Available unspent liquidity this month
            </p>
          </div>
        </Card>

        {/* 4. Monthly Savings */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12px] uppercase tracking-[0.05em] text-[#737373] font-medium">
              Projected Monthly Savings
            </span>
            <span className="text-[12px] text-[#737373] font-mono tabular-nums">
              {monthlyAllowance > 0
                ? `${Math.max(0, Math.round((monthlySavings / monthlyAllowance) * 1000) / 10)}% saved`
                : '0%'}
            </span>
          </div>
          <div className="mt-[10px]">
            <div className="metric-value" data-testid="overview-monthly-savings">
              {formatINR(monthlySavings)}
            </div>
            <p className="text-[13px] text-[#737373] mt-[6px]">
              Net positive surplus retained from allowance
            </p>
          </div>
        </Card>

        {/* 5. Allowance Utilisation Percentage */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12px] uppercase tracking-[0.05em] text-[#737373] font-medium">
              Allowance Utilisation
            </span>
            <span className="text-[12px] font-mono text-[#737373] tabular-nums">
              {formatINR(totalExpenses)} / {formatINR(monthlyAllowance)}
            </span>
          </div>
          <div className="mt-[10px]">
            <div
              className={`metric-value ${
                utilizationPct > 100 ? '!text-[#e7000b]' : ''
              }`}
              data-testid="overview-utilization-pct"
            >
              {utilizationPct}%
            </div>
            <div className="w-full h-[6px] bg-[#f5f5f5] rounded-[18px] overflow-hidden mt-[10px]">
              <div
                className={`h-full rounded-[18px] transition-all duration-200 ${
                  utilizationPct > 100 ? 'bg-[#e7000b]' : 'bg-[#0a0a0a]'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, utilizationPct))}%` }}
              />
            </div>
          </div>
        </Card>

        {/* 6. Highest-Spending Category */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12px] uppercase tracking-[0.05em] text-[#737373] font-medium">
              Highest-Spending Category
            </span>
            <span className="text-[12px] font-mono text-[#737373] tabular-nums">
              {highestCategory.percentageOfTotal}% of spend
            </span>
          </div>
          <div className="mt-[10px]">
            <div className="metric-value" data-testid="overview-highest-category">
              {highestCategory.category}
            </div>
            <p className="text-[13px] text-[#737373] mt-[6px] tabular-nums">
              {formatINR(highestCategory.amount)} spent this period
            </p>
          </div>
        </Card>
      </div>

      {/* Category-Wise Expenditure & Monthly Spending Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[20px]">
        {/* Category-wise expenditure list with progress bars */}
        <Card className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-[16px]">
              <div>
                <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
                  Category-Wise Expenditure
                </h2>
                <p className="text-[13px] text-[#737373]">
                  Exact breakdown across all 6 mandatory categories
                </p>
              </div>
              <span className="text-[12px] font-mono text-[#737373] tabular-nums">
                Total {formatINR(totalExpenses)}
              </span>
            </div>

            <div className="space-y-[14px]">
              {EXPENSE_CATEGORIES.map((category) => {
                const amount = categoryTotals[category] || 0;
                const shareOfSpend =
                  totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
                const shareOfAllowance =
                  monthlyAllowance > 0 ? Math.round((amount / monthlyAllowance) * 100) : 0;

                return (
                  <div key={category} className="space-y-[6px]">
                    <div className="flex items-center justify-between text-[14px]">
                      <div className="flex items-center gap-[8px]">
                        <span className="font-medium text-[#0a0a0a]">{category}</span>
                        <span className="text-[12px] text-[#737373] tabular-nums">
                          · {shareOfSpend}% of spend
                        </span>
                      </div>
                      <span className="font-mono font-medium text-[#0a0a0a] tabular-nums">
                        {formatINR(amount)}
                      </span>
                    </div>
                    <div className="w-full h-[6px] bg-[#f5f5f5] rounded-[18px] overflow-hidden">
                      <div
                        className="h-full bg-[#171717] rounded-[18px]"
                        style={{ width: `${Math.min(100, shareOfAllowance)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-[20px] pt-[16px] border-t border-[#e5e5e5] flex items-center justify-between text-[13px]">
            <span className="text-[#737373]">Need to trim ₹500 for next month?</span>
            <button
              type="button"
              onClick={() => onNavigate('planner')}
              className="font-medium text-[#0a0a0a] hover:underline inline-flex items-center gap-[4px] cursor-pointer"
            >
              <span>Open Budget Planner</span>
              <ArrowUpRight className="w-[14px] h-[14px]" />
            </button>
          </div>
        </Card>

        {/* Monthly Spending Overview Chart (Monochromatic Bar Chart) */}
        <Card className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-[16px]">
              <div>
                <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
                  Monthly Spending Overview
                </h2>
                <p className="text-[13px] text-[#737373]">
                  Visual comparison of category expenditure in INR (₹)
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onNavigate('analytics')}
              >
                <span>Detailed Analytics</span>
                <ArrowUpRight className="w-[13px] h-[13px]" />
              </Button>
            </div>

            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryChartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                >
                  <XAxis
                    dataKey="name"
                    axisLine={{ stroke: '#e5e5e5' }}
                    tickLine={false}
                    tick={{ fill: '#737373', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#737373', fontSize: 12 }}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip
                    cursor={{ fill: '#f5f5f5' }}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e5e5',
                      borderRadius: '18px',
                      fontSize: '13px',
                      color: '#0a0a0a',
                    }}
                    formatter={(value: any) => [formatINR(Number(value)), 'Spent']}
                  />
                  <Bar dataKey="amount" radius={[10, 10, 0, 0]} isAnimationActive={false}>
                    {categoryChartData.map((entry, idx) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={idx === 0 ? '#0a0a0a' : idx % 2 === 1 ? '#404040' : '#737373'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-[16px] pt-[16px] border-t border-[#e5e5e5] grid grid-cols-3 gap-[12px] text-[13px]">
            <div>
              <span className="text-[#737373] block text-[12px]">Top Category</span>
              <span className="font-medium text-[#0a0a0a]">
                {highestCategory.category} ({formatINR(highestCategory.amount)})
              </span>
            </div>
            <div>
              <span className="text-[#737373] block text-[12px]">Academic Spend</span>
              <span className="font-medium text-[#0a0a0a] tabular-nums">
                {formatINR(categoryTotals.Education || 0)}
              </span>
            </div>
            <div>
              <span className="text-[#737373] block text-[12px]">Balance Left</span>
              <span className="font-medium text-[#0a0a0a] tabular-nums">
                {formatINR(remainingBalance)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Transactions Table */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[12px] mb-[16px]">
          <div>
            <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
              Recent Transactions
            </h2>
            <p className="text-[13px] text-[#737373]">
              Latest recorded campus expenses contributing to your monthly totals
            </p>
          </div>
          <div className="flex items-center gap-[8px]">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('expenses')}
            >
              <span>View All Transactions ({transactions.length})</span>
              <ArrowUpRight className="w-[13px] h-[13px]" />
            </Button>
          </div>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-[32px] text-center space-y-[12px]">
            <p className="text-[14px] text-[#737373]">
              No transactions recorded for this period yet.
            </p>
            <Button variant="primary" size="sm" onClick={onOpenAddExpense}>
              <Plus className="w-[14px] h-[14px]" />
              <span>Log First Expense</span>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e5e5e5] text-[12px] uppercase tracking-[0.05em] text-[#737373]">
                  <th className="py-[10px] pr-[12px] font-medium">Description</th>
                  <th className="py-[10px] px-[12px] font-medium">Category</th>
                  <th className="py-[10px] px-[12px] font-medium">Date</th>
                  <th className="py-[10px] pl-[12px] text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5] text-[14px]">
                {recentTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-[#fafafa] transition-colors"
                  >
                    <td className="py-[12px] pr-[12px]">
                      <div className="font-medium text-[#0a0a0a]">{tx.description}</div>
                      {tx.notes && (
                        <div className="text-[12px] text-[#737373]">{tx.notes}</div>
                      )}
                    </td>
                    <td className="py-[12px] px-[12px] text-[#737373]">
                      {tx.category}
                    </td>
                    <td className="py-[12px] px-[12px] font-mono text-[13px] text-[#737373] tabular-nums">
                      {tx.date}
                    </td>
                    <td className="py-[12px] pl-[12px] text-right font-mono font-medium text-[#0a0a0a] tabular-nums">
                      {formatINR(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
