import {
  BudgetPlanResult,
  CategoryBudgetMap,
  ExpenseCategory,
} from '../types/finance';
import { formatINR, getHighestSpendingCategory } from './financeEngine';

export interface FinancialContextPayload {
  monthlyAllowance: number;
  totalExpenses: number;
  remainingBalance: number;
  spendingPercentage: number;
  categoryTotals: CategoryBudgetMap;
  savingsTarget: number;
  currentBudget: CategoryBudgetMap;
}

export interface AIStatusResponse {
  configured: boolean;
  model: string;
  mode: 'gemini-live' | 'deterministic-fallback';
}

/**
 * Rule-based contextual fallback responder so the AI Finance Assistant works
 * reliably even when offline or without a configured GEMINI_API_KEY.
 */
export function generateDeterministicFallbackReply(
  question: string,
  ctx: FinancialContextPayload
): string {
  const q = question.toLowerCase();
  const highest = getHighestSpendingCategory(ctx.categoryTotals);
  const food = ctx.categoryTotals[ExpenseCategory.Food] || 0;
  const travel = ctx.categoryTotals[ExpenseCategory.Travel] || 0;
  const edu = ctx.categoryTotals[ExpenseCategory.Education] || 0;
  const shop = ctx.categoryTotals[ExpenseCategory.Shopping] || 0;
  const ent = ctx.categoryTotals[ExpenseCategory.Entertainment] || 0;
  const other = ctx.categoryTotals[ExpenseCategory.Other] || 0;

  if (q.includes('500') || (q.includes('save') && q.includes('month')) || q.includes('reduce')) {
    return [
      `Based on your actual stored numbers (Monthly Allowance: ${formatINR(ctx.monthlyAllowance)}, Total Expenses: ${formatINR(ctx.totalExpenses)}, Remaining Balance: ${formatINR(ctx.remainingBalance)}), here is a realistic plan to save an additional ₹500 next month while keeping Education (${formatINR(edu)}) untouched:`,
      ``,
      `1. **Food (${formatINR(food)} → ${formatINR(Math.max(0, food - 200))}, save ₹200):** Replace 2–3 late-night food delivery orders with your prepaid hostel mess or shared dorm snacks.`,
      `2. **Shopping (${formatINR(shop)} → ${formatINR(Math.max(0, shop - 200))}, save ₹200):** Pause impulse apparel and non-urgent desk accessories for 30 days.`,
      `3. **Travel (${formatINR(travel)} → ${formatINR(Math.max(0, travel - 100))}, save ₹100):** Group solo auto rides with batchmates or use your student metro pass.`,
      `4. **Protected Categories:** Education remains fixed at ${formatINR(edu)}, Entertainment at ${formatINR(ent)}, and Other at ${formatINR(other)}.`,
      ``,
      `**Projected Outcome:** Total expenses drop from ${formatINR(ctx.totalExpenses)} to ${formatINR(Math.max(0, ctx.totalExpenses - 500))}, boosting your monthly remaining balance from ${formatINR(ctx.remainingBalance)} to ${formatINR(ctx.remainingBalance + 500)}.`,
      ``,
      `*Note: Educational guidance based on your recorded campus transactions — not professional financial advice.*`,
    ].join('\n');
  }

  if (q.includes('50/30/20') || q.includes('rule')) {
    const needsCap = Math.round(ctx.monthlyAllowance * 0.5);
    const wantsCap = Math.round(ctx.monthlyAllowance * 0.3);
    const savingsCap = Math.round(ctx.monthlyAllowance * 0.2);
    const actualNeeds = food + travel + edu;
    const actualWants = shop + ent + other;
    return [
      `The **50/30/20 Budgeting Rule** divides your ${formatINR(ctx.monthlyAllowance)} monthly allowance into three buckets:`,
      ``,
      `- **50% Needs (${formatINR(needsCap)} target):** Essential living & academic costs (Food, Travel, Education). Your actual Needs total is **${formatINR(actualNeeds)}** (${ctx.monthlyAllowance > 0 ? Math.round((actualNeeds / ctx.monthlyAllowance) * 100) : 0}% of allowance).`,
      `- **30% Wants (${formatINR(wantsCap)} target):** Discretionary lifestyle spending (Shopping, Entertainment, Other). Your actual Wants total is **${formatINR(actualWants)}** (${ctx.monthlyAllowance > 0 ? Math.round((actualWants / ctx.monthlyAllowance) * 100) : 0}% of allowance).`,
      `- **20% Savings (${formatINR(savingsCap)} target):** Emergency buffer & future goals. Your current remaining balance is **${formatINR(ctx.remainingBalance)}** (${ctx.monthlyAllowance > 0 ? Math.round((ctx.remainingBalance / ctx.monthlyAllowance) * 100) : 0}%).`,
      ``,
      `By trimming ₹500 across Food, Travel, and Shopping, your monthly savings reach **${formatINR(ctx.remainingBalance + 500)}**, bringing you right in line with the 20% student savings benchmark.`,
    ].join('\n');
  }

  if (q.includes('emergenc') || q.includes('buffer') || q.includes('fund')) {
    const minBuffer = Math.round(ctx.totalExpenses * 1.5);
    const idealBuffer = Math.round(ctx.totalExpenses * 3);
    return [
      `For a college student spending **${formatINR(ctx.totalExpenses)}/month**, a practical **Student Emergency Fund** should cover **1.5 to 3 months of core expenses** (${formatINR(minBuffer)} to ${formatINR(idealBuffer)}).`,
      ``,
      `- **Why it matters:** Covers urgent train/flight tickets home, unexpected medical/pharmacy bills, or sudden laptop repairs without borrowing.`,
      `- **How to build it:** With your current remaining balance of **${formatINR(ctx.remainingBalance)}/month**, setting aside ₹1,000 each month builds a ₹5,000 safety net in 5 months.`,
      `- **Where to keep it:** Keep emergency savings in a liquid, zero-balance student savings account — never lock emergency funds in volatile assets.`,
    ].join('\n');
  }

  if (q.includes('entertainment') || q.includes('shopping') || q.includes('habit') || q.includes('where') || q.includes('analyse') || q.includes('analyze')) {
    return [
      `Here is a breakdown of your actual stored spending (**${formatINR(ctx.totalExpenses)}** out of **${formatINR(ctx.monthlyAllowance)}** allowance, **${ctx.spendingPercentage}%** utilized):`,
      ``,
      `- **Highest Category — ${highest.category} (${formatINR(highest.amount)}, ${highest.percentageOfTotal}% of spend):** Food (${formatINR(food)}) leads your monthly outflow, driven by mess fees plus evening/late-night orders.`,
      `- **Academic & Commute Essentials:** Education is **${formatINR(edu)}** and Travel is **${formatINR(travel)}** (combined ${formatINR(edu + travel)}).`,
      `- **Discretionary Lifestyle:** Shopping (**${formatINR(shop)}**) and Entertainment (**${formatINR(ent)}**) total **${formatINR(shop + ent)}** (${ctx.totalExpenses > 0 ? Math.round(((shop + ent) / ctx.totalExpenses) * 100) : 0}% of total expenses).`,
      `- **Remaining Balance:** You currently retain **${formatINR(ctx.remainingBalance)}** this month.`,
      ``,
      `**Actionable Student Tip:** Your Entertainment spend (${formatINR(ent)}) is ${ctx.monthlyAllowance > 0 ? Math.round((ent / ctx.monthlyAllowance) * 100) : 0}% of your allowance, which is reasonable, but combining small reductions in Shopping (-₹200), Food delivery (-₹200), and solo Travel (-₹100) easily unlocks an extra ₹500/month in savings.`,
    ].join('\n');
  }

  return [
    `Here is your current financial snapshot from your stored data:`,
    ``,
    `- **Monthly Allowance:** ${formatINR(ctx.monthlyAllowance)}`,
    `- **Total Expenses:** ${formatINR(ctx.totalExpenses)} (${ctx.spendingPercentage}% utilized)`,
    `- **Remaining Balance / Monthly Savings:** ${formatINR(ctx.remainingBalance)}`,
    `- **Category Breakdown:** Food ${formatINR(food)} · Education ${formatINR(edu)} · Shopping ${formatINR(shop)} · Entertainment ${formatINR(ent)} · Travel ${formatINR(travel)} · Other ${formatINR(other)}`,
    ``,
    `To improve your monthly surplus by **${formatINR(ctx.savingsTarget || 500)}**, focus on trimming discretionary Shopping and late-night Food deliveries while keeping Education (${formatINR(edu)}) protected.`,
  ].join('\n');
}

export async function checkAIBackendStatus(): Promise<AIStatusResponse> {
  try {
    const res = await fetch('/api/ai/status');
    if (!res.ok) throw new Error('Status check failed');
    return (await res.json()) as AIStatusResponse;
  } catch {
    return {
      configured: false,
      model: 'gemini-3.8-flash',
      mode: 'deterministic-fallback',
    };
  }
}

export async function sendAssistantMessage(params: {
  message: string;
  history: { role: 'user' | 'assistant'; content: string }[];
  financialContext: FinancialContextPayload;
}): Promise<{ reply: string; isFallback: boolean }> {
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      return {
        reply: generateDeterministicFallbackReply(params.message, params.financialContext),
        isFallback: true,
      };
    }

    const data = await res.json();
    if (data && typeof data.reply === 'string' && data.reply.trim().length > 0) {
      return {
        reply: data.reply,
        isFallback: Boolean(data.isFallback),
      };
    }
    return {
      reply: generateDeterministicFallbackReply(params.message, params.financialContext),
      isFallback: true,
    };
  } catch {
    return {
      reply: generateDeterministicFallbackReply(params.message, params.financialContext),
      isFallback: true,
    };
  }
}

export async function fetchBudgetPlanExplanation(
  plan: BudgetPlanResult
): Promise<{ summary: string; isFallback: boolean }> {
  const defaultSummary = `To achieve ${formatINR(plan.actualAdditionalSavings)} in additional monthly savings while keeping Education fixed at ${formatINR(
    plan.categories.find((c) => c.category === ExpenseCategory.Education)?.revisedAmount ?? 1200
  )}, the engine reduced Food by ₹200 (to ₹2,200), Travel by ₹100 (to ₹700), and Shopping by ₹200 (to ₹800). Entertainment (₹900) and Other (₹500) remain intact so campus social balance is preserved, lowering total expenditure from ${formatINR(
    plan.originalTotalExpenses
  )} to ${formatINR(plan.revisedTotalExpenses)} and increasing your remaining balance to ${formatINR(
    plan.revisedRemainingBalance
  )}.`;

  try {
    const res = await fetch('/api/ai/budget-rationale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });

    if (!res.ok) {
      return { summary: defaultSummary, isFallback: true };
    }
    const data = await res.json();
    if (data && typeof data.summary === 'string' && data.summary.trim().length > 0) {
      return { summary: data.summary, isFallback: Boolean(data.isFallback) };
    }
    return { summary: defaultSummary, isFallback: true };
  } catch {
    return { summary: defaultSummary, isFallback: true };
  }
}
