import React, { useEffect, useState } from 'react';
import {
  RotateCcw,
  Check,
  Database,
  Cpu,
  Shield,
} from 'lucide-react';
import { formatINR } from '../services/financeEngine';
import { AIStatusResponse, checkAIBackendStatus } from '../services/gemini';
import { Button, Card, Input } from '../components/ui/primitives';

interface SettingsPageProps {
  monthlyAllowance: number;
  transactionCount: number;
  goalCount: number;
  onUpdateAllowance: (amount: number) => void;
  onResetDemoData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  monthlyAllowance,
  transactionCount,
  goalCount,
  onUpdateAllowance,
  onResetDemoData,
}) => {
  const [allowanceInput, setAllowanceInput] = useState(String(monthlyAllowance));
  const [allowanceSaved, setAllowanceSaved] = useState(false);
  const [allowanceError, setAllowanceError] = useState('');
  const [resetConfirmed, setResetConfirmed] = useState(false);
  const [aiStatus, setAiStatus] = useState<AIStatusResponse>({
    configured: false,
    model: 'gemini-3.8-flash',
    mode: 'deterministic-fallback',
  });

  useEffect(() => {
    setAllowanceInput(String(monthlyAllowance));
  }, [monthlyAllowance]);

  useEffect(() => {
    checkAIBackendStatus().then(setAiStatus);
  }, []);

  const handleSaveAllowance = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(allowanceInput);
    if (!Number.isFinite(num) || num <= 0) {
      setAllowanceError('Monthly allowance must be a positive number in INR.');
      return;
    }
    setAllowanceError('');
    onUpdateAllowance(Math.round(num));
    setAllowanceSaved(true);
    setTimeout(() => setAllowanceSaved(false), 2500);
  };

  const handleResetDemo = () => {
    onResetDemoData();
    setResetConfirmed(true);
    setTimeout(() => setResetConfirmed(false), 3000);
  };

  return (
    <div className="space-y-[28px]">
      {/* Page Header */}
      <div>
        <p className="text-[12px] uppercase tracking-[0.05em] text-[#737373] font-medium">
          System Configuration & Portability
        </p>
        <h1 className="display-heading mt-[4px]">Settings</h1>
        <p className="text-[14px] text-[#737373] mt-[6px]">
          Configure your monthly allowance, reset official hackathon demo data, and inspect local storage and server-side AI architecture.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px]">
        {/* 1. Monthly Allowance & Currency */}
        <Card className="flex flex-col justify-between">
          <form onSubmit={handleSaveAllowance} className="space-y-[16px]">
            <div>
              <h2 className="text-[18px] font-semibold text-[#0a0a0a]">
                Monthly Allowance & Currency
              </h2>
              <p className="text-[13px] text-[#737373]">
                Adjust your monthly student allowance. All dashboard metrics, utilization percentages, and budget plans recalculate immediately.
              </p>
            </div>

            <div>
              <label
                htmlFor="settings-allowance"
                className="block text-[12px] font-medium text-[#0a0a0a] mb-[6px]"
              >
                Monthly Allowance (INR ₹)
              </label>
              <div className="flex items-center gap-[8px]">
                <Input
                  id="settings-allowance"
                  type="number"
                  min={1}
                  step={100}
                  value={allowanceInput}
                  onChange={(e) => setAllowanceInput(e.target.value)}
                  className="font-mono"
                />
                <Button type="submit" variant="primary" size="md">
                  <Check className="w-[14px] h-[14px]" />
                  <span>{allowanceSaved ? 'Saved' : 'Save Allowance'}</span>
                </Button>
              </div>
              {allowanceError && (
                <p className="text-[12px] text-[#e7000b] mt-[6px]">{allowanceError}</p>
              )}
            </div>

            <div className="pt-[12px] border-t border-[#e5e5e5] flex items-center justify-between text-[13px]">
              <span className="text-[#737373]">Active Display Currency</span>
              <span className="font-mono font-medium text-[#0a0a0a]">
                INR (₹) · Indian Number Formatting (e.g. {formatINR(monthlyAllowance)})
              </span>
            </div>
          </form>
        </Card>

        {/* 2. Official Hackathon Demo Dataset Reset */}
        <Card className="flex flex-col justify-between">
          <div className="space-y-[12px]">
            <h2 className="text-[18px] font-semibold text-[#0a0a0a]">
              Official Hackathon Demo Data
            </h2>
            <p className="text-[13px] text-[#737373]">
              Restore the exact official hackathon dataset at any time for live judging demonstrations:
            </p>
            <div className="bg-[#fafafa] border border-[#e5e5e5] rounded-[18px] p-[14px] text-[13px] space-y-[4px] font-mono tabular-nums">
              <div>Monthly Allowance: ₹8,000 · Total Expenses: ₹6,800 · Balance: ₹1,200 (85%)</div>
              <div className="text-[12px] text-[#737373]">
                Food: ₹2,400 · Travel: ₹800 · Education: ₹1,200 · Shopping: ₹1,000 · Entertainment: ₹900 · Other: ₹500
              </div>
            </div>
          </div>

          <div className="mt-[16px] pt-[14px] border-t border-[#e5e5e5] flex items-center justify-between gap-[12px]">
            <span className="text-[12px] text-[#737373]">
              {resetConfirmed
                ? 'Official ₹8,000 / ₹6,800 dataset restored.'
                : 'Resets transactions, allowance, and goals to default.'}
            </span>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleResetDemo}
              data-testid="reset-demo-data-btn"
            >
              <RotateCcw className="w-[14px] h-[14px]" />
              <span>{resetConfirmed ? 'Demo Data Restored' : 'Reset Demo Data'}</span>
            </Button>
          </div>
        </Card>

        {/* 3. LocalStorage Data Persistence Diagnostics */}
        <Card>
          <div className="flex items-start gap-[10px] mb-[12px]">
            <Database className="w-[18px] h-[18px] text-[#0a0a0a] shrink-0 mt-[2px]" />
            <div>
              <h2 className="text-[18px] font-semibold text-[#0a0a0a]">
                Data Persistence & Privacy
              </h2>
              <p className="text-[13px] text-[#737373]">
                Zero external database or mandatory sign-in required. All records persist locally in your browser&apos;s LocalStorage.
              </p>
            </div>
          </div>

          <div className="space-y-[8px] text-[13px] pt-[8px] border-t border-[#e5e5e5]">
            <div className="flex items-center justify-between">
              <span className="text-[#737373]">Stored Transactions</span>
              <span className="font-mono font-medium text-[#0a0a0a] tabular-nums">
                {transactionCount} records (`cfb_transactions_v1`)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#737373]">Stored Savings Goals</span>
              <span className="font-mono font-medium text-[#0a0a0a] tabular-nums">
                {goalCount} goals (`cfb_savings_goals_v1`)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#737373]">Preferences & Budgets</span>
              <span className="font-mono font-medium text-[#0a0a0a]">
                Active (`cfb_preferences_v1`)
              </span>
            </div>
          </div>
        </Card>

        {/* 4. AI Integration Status & Server-Side Configuration Guidance */}
        <Card>
          <div className="flex items-start gap-[10px] mb-[12px]">
            <Cpu className="w-[18px] h-[18px] text-[#0a0a0a] shrink-0 mt-[2px]" />
            <div>
              <h2 className="text-[18px] font-semibold text-[#0a0a0a]">
                Gemini AI Integration Status
              </h2>
              <p className="text-[13px] text-[#737373]">
                Server-side proxy architecture keeps credentials strictly out of client-side JavaScript.
              </p>
            </div>
          </div>

          <div className="space-y-[8px] text-[13px] pt-[8px] border-t border-[#e5e5e5]">
            <div className="flex items-center justify-between">
              <span className="text-[#737373]">Active Mode</span>
              <span className="font-mono font-medium text-[#0a0a0a]">
                {aiStatus.configured
                  ? 'Server-Side Gemini API Connected'
                  : 'Deterministic Rule-Based Fallback'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#737373]">Configured Model</span>
              <span className="font-mono text-[#0a0a0a]">{aiStatus.model}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#737373]">Server Endpoint</span>
              <span className="font-mono text-[#0a0a0a]">POST /api/ai/chat</span>
            </div>
          </div>

          <div className="mt-[14px] pt-[12px] border-t border-[#e5e5e5] flex items-start gap-[8px] text-[12px] text-[#737373]">
            <Shield className="w-[15px] h-[15px] text-[#0a0a0a] shrink-0 mt-[2px]" />
            <span>
              Configure <code className="font-mono text-[#0a0a0a]">GEMINI_API_KEY</code> in your server environment variables (or Cloudflare Worker secrets). If omitted, the application automatically runs its deterministic financial analyzer without interruption.
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};
