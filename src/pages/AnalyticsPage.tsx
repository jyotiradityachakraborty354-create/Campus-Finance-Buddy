import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import {
  CategoryBudgetMap,
  EXPENSE_CATEGORIES,
  Transaction,
} from '../types/finance';
import {
  calculateRemainingBalance,
  calculateSpendingPercentage,
  calculateTotalExpenses,
  formatINR,
  getHighestSpendingCategory,
} from '../services/financeEngine';
import { Card } from '../components/ui/primitives';

interface AnalyticsPageProps {
  transactions: Transaction[];
  monthlyAllowance: number;
  categoryTotals: CategoryBudgetMap;
  categoryBudgets: CategoryBudgetMap;
}

// Monochromatic palette strictly adhering to DESIGN.md
const MONO_SHADES = ['#0a0a0a', '#262626', '#525252', '#737373', '#a3a3a3', '#d4d4d4'];

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  transactions,
  monthlyAllowance,
  categoryTotals,
  categoryBudgets,
}) => {
  const totalExpenses = calculateTotalExpenses(transactions);
  const remainingBalance = calculateRemainingBalance(monthlyAllowance, totalExpenses);
  const utilizationPct = calculateSpendingPercentage(totalExpenses, monthlyAllowance);
  const highestCategory = getHighestSpendingCategory(categoryTotals);

  const donutData = useMemo(() => {
    return EXPENSE_CATEGORIES.map((category, idx) => ({
      name: category,
      value: categoryTotals[category] || 0,
      color: MONO_SHADES[idx % MONO_SHADES.length],
      share:
        totalExpenses > 0
          ? Math.round(((categoryTotals[category] || 0) / totalExpenses) * 100)
          : 0,
    })).filter((item) => item.value > 0);
  }, [categoryTotals, totalExpenses]);

  const categoryComparisonData = useMemo(() => {
    return EXPENSE_CATEGORIES.map((category) => ({
      category,
      actual: categoryTotals[category] || 0,
      budget: categoryBudgets[category] || 0,
    }));
  }, [categoryTotals, categoryBudgets]);

  const dailyExpenditureData = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of transactions) {
      map.set(tx.date, (map.get(tx.date) || 0) + tx.amount);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, amount]) => ({
        date: date.slice(5), // MM-DD
        fullDate: date,
        amount,
      }));
  }, [transactions]);

  const cumulativeTrendData = useMemo(() => {
    let runningTotal = 0;
    return dailyExpenditureData.map((d) => {
      runningTotal += d.amount;
      return {
        date: d.date,
        cumulative: runningTotal,
        allowance: monthlyAllowance,
      };
    });
  }, [dailyExpenditureData, monthlyAllowance]);

  return (
    <div className="space-y-[28px]">
      {/* Header */}
      <div>
        <p className="text-[12px] uppercase tracking-[0.05em] text-[#737373] font-medium">
          Quantitative Spending Telemetry
        </p>
        <h1 className="display-heading mt-[4px]">Analytics</h1>
        <p className="text-[14px] text-[#737373] mt-[6px]">
          Category distribution, daily cash-flow velocity, and budget utilization computed directly from your stored transactions.
        </p>
      </div>

      {/* Top Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
        <Card>
          <span className="text-[12px] uppercase tracking-[0.05em] text-[#737373] font-medium">
            Budget Utilisation
          </span>
          <div className="metric-value mt-[8px]">{utilizationPct}%</div>
          <p className="text-[13px] text-[#737373] mt-[4px] tabular-nums">
            {formatINR(totalExpenses)} of {formatINR(monthlyAllowance)} spent
          </p>
        </Card>

        <Card>
          <span className="text-[12px] uppercase tracking-[0.05em] text-[#737373] font-medium">
            Remaining Balance
          </span>
          <div
            className={`metric-value mt-[8px] ${
              remainingBalance < 0 ? '!text-[#e7000b]' : ''
            }`}
          >
            {formatINR(remainingBalance)}
          </div>
          <p className="text-[13px] text-[#737373] mt-[4px]">
            Unspent monthly allowance reserve
          </p>
        </Card>

        <Card>
          <span className="text-[12px] uppercase tracking-[0.05em] text-[#737373] font-medium">
            Highest-Spending Category
          </span>
          <div className="metric-value mt-[8px]">{highestCategory.category}</div>
          <p className="text-[13px] text-[#737373] mt-[4px] tabular-nums">
            {formatINR(highestCategory.amount)} ({highestCategory.percentageOfTotal}% of total)
          </p>
        </Card>

        <Card>
          <span className="text-[12px] uppercase tracking-[0.05em] text-[#737373] font-medium">
            Average Transaction
          </span>
          <div className="metric-value mt-[8px]">
            {transactions.length > 0
              ? formatINR(Math.round(totalExpenses / transactions.length))
              : '₹0'}
          </div>
          <p className="text-[13px] text-[#737373] mt-[4px] tabular-nums">
            Across {transactions.length} recorded transactions
          </p>
        </Card>
      </div>

      {transactions.length === 0 ? (
        <Card className="py-[48px] text-center">
          <p className="text-[16px] font-medium text-[#0a0a0a]">
            No expenditure data available to chart
          </p>
          <p className="text-[13px] text-[#737373] mt-[4px]">
            Add transactions in the Expenses tab or reset demo data in Settings to populate analytics.
          </p>
        </Card>
      ) : (
        <>
          {/* Row 1: Category Breakdown Donut Chart + Category Comparison Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[20px]">
            {/* Donut Chart & Category Table */}
            <Card className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
                  Category-Wise Breakdown
                </h2>
                <p className="text-[13px] text-[#737373] mb-[16px]">
                  Proportional distribution of {formatINR(totalExpenses)} total expenses
                </p>

                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={88}
                        paddingAngle={2}
                        isAnimationActive={false}
                      >
                        {donutData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e5e5e5',
                          borderRadius: '18px',
                          fontSize: '13px',
                        }}
                        formatter={(value: any) => [formatINR(Number(value)), 'Spent']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-[12px] pt-[12px] border-t border-[#e5e5e5] space-y-[8px]">
                {EXPENSE_CATEGORIES.map((category, idx) => {
                  const val = categoryTotals[category] || 0;
                  const pct =
                    totalExpenses > 0 ? Math.round((val / totalExpenses) * 100) : 0;
                  return (
                    <div
                      key={category}
                      className="flex items-center justify-between text-[13px]"
                    >
                      <div className="flex items-center gap-[8px]">
                        <span
                          className="w-[10px] h-[10px] rounded-[3px] inline-block shrink-0"
                          style={{ backgroundColor: MONO_SHADES[idx % MONO_SHADES.length] }}
                        />
                        <span className="text-[#0a0a0a] font-medium">{category}</span>
                      </div>
                      <div className="font-mono text-[#0a0a0a] tabular-nums">
                        {formatINR(val)}{' '}
                        <span className="text-[#737373] text-[12px]">({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Category Comparison vs Target Budget */}
            <Card className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
                  Category Comparison (Actual vs Active Budget)
                </h2>
                <p className="text-[13px] text-[#737373] mb-[16px]">
                  Compares actual category expenditure against your active target category allocations
                </p>

                <div className="h-[290px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryComparisonData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis
                        dataKey="category"
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
                        }}
                        formatter={(value: any, name: any) => [
                          formatINR(Number(value)),
                          name === 'actual' ? 'Actual Spend' : 'Target Budget',
                        ]}
                      />
                      <Bar dataKey="actual" name="actual" fill="#0a0a0a" radius={[8, 8, 0, 0]} isAnimationActive={false} />
                      <Bar dataKey="budget" name="budget" fill="#a3a3a3" radius={[8, 8, 0, 0]} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-[12px] pt-[12px] border-t border-[#e5e5e5] flex items-center justify-between text-[12px] text-[#737373]">
                <span>Solid Black (#0a0a0a): Actual Recorded Spend</span>
                <span>Neutral Gray (#a3a3a3): Active Category Budget Target</span>
              </div>
            </Card>
          </div>

          {/* Row 2: Daily Expenditure Overview & Monthly Cumulative Spending Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px]">
            {/* Daily Expenditure Overview */}
            <Card>
              <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
                Daily Expenditure Overview
              </h2>
              <p className="text-[13px] text-[#737373] mb-[16px]">
                Transaction outflow aggregated by calendar day
              </p>

              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dailyExpenditureData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                      dataKey="date"
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
                      }}
                      formatter={(value: any) => [formatINR(Number(value)), 'Daily Spend']}
                    />
                    <Bar dataKey="amount" fill="#171717" radius={[8, 8, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Monthly Cumulative Spending Trend */}
            <Card>
              <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
                Monthly Spending Trend (Cumulative)
              </h2>
              <p className="text-[13px] text-[#737373] mb-[16px]">
                Cumulative expenditure progression toward your {formatINR(monthlyAllowance)} allowance
              </p>

              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={cumulativeTrendData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                      dataKey="date"
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
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e5e5',
                        borderRadius: '18px',
                        fontSize: '13px',
                      }}
                      formatter={(value: any) => [formatINR(Number(value)), 'Cumulative Spend']}
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      stroke="#0a0a0a"
                      strokeWidth={2}
                      fill="#e5e5e5"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
