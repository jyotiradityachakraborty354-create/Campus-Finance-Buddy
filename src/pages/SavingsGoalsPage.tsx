import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ArrowUpRight,
} from 'lucide-react';
import { SavingsGoal } from '../types/finance';
import { formatINR } from '../services/financeEngine';
import { Button, Card, Input } from '../components/ui/primitives';

interface SavingsGoalsPageProps {
  goals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  onUpdateGoal: (goal: SavingsGoal) => void;
  onDeleteGoal: (id: string) => void;
}

export const SavingsGoalsPage: React.FC<SavingsGoalsPageProps> = ({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [savedAmount, setSavedAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);
  const overallRemaining = Math.max(0, totalTarget - totalSaved);
  const overallPct =
    totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  const handleOpenCreate = () => {
    setEditingGoal(null);
    setTitle('');
    setTargetAmount('');
    setSavedAmount('0');
    setDeadline('2026-12-31');
    setNotes('');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setTargetAmount(String(goal.targetAmount));
    setSavedAmount(String(goal.savedAmount));
    setDeadline(goal.deadline || '');
    setNotes(goal.notes || '');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setFormError('Goal title cannot be empty.');
      return;
    }

    const numTarget = Number(targetAmount);
    const numSaved = Number(savedAmount);

    if (!Number.isFinite(numTarget) || numTarget <= 0) {
      setFormError('Target amount must be greater than ₹0.');
      return;
    }

    if (!Number.isFinite(numSaved) || numSaved < 0) {
      setFormError('Saved amount cannot be negative.');
      return;
    }

    if (editingGoal) {
      onUpdateGoal({
        ...editingGoal,
        title: cleanTitle,
        targetAmount: Math.round(numTarget),
        savedAmount: Math.round(numSaved),
        deadline: deadline || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      onAddGoal({
        title: cleanTitle,
        targetAmount: Math.round(numTarget),
        savedAmount: Math.round(numSaved),
        deadline: deadline || undefined,
        notes: notes.trim() || undefined,
      });
    }

    setIsFormOpen(false);
    setEditingGoal(null);
  };

  const handleQuickDeposit = (goal: SavingsGoal, increment: number) => {
    const nextSaved = Math.min(goal.targetAmount, Math.max(0, goal.savedAmount + increment));
    onUpdateGoal({
      ...goal,
      savedAmount: nextSaved,
    });
  };

  return (
    <div className="space-y-[28px]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-[16px]">
        <div>
          <p className="text-[12px] uppercase tracking-[0.05em] text-[#737373] font-medium">
            Capital Accumulation
          </p>
          <h1 className="display-heading mt-[4px]">Savings Goals</h1>
          <p className="text-[14px] text-[#737373] mt-[6px]">
            Track milestone targets, update saved balances, and channel your monthly budget surplus into concrete student goals.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleOpenCreate}>
          <Plus className="w-[15px] h-[15px]" />
          <span>New Savings Goal</span>
        </Button>
      </div>

      {/* Summary Stat Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
        <Card>
          <span className="text-[12px] uppercase tracking-[0.05em] text-[#737373] font-medium">
            Total Target Capital
          </span>
          <div className="metric-value mt-[8px]">{formatINR(totalTarget)}</div>
          <p className="text-[13px] text-[#737373] mt-[4px]">
            Across {goals.length} active savings goals
          </p>
        </Card>

        <Card>
          <span className="text-[12px] uppercase tracking-[0.05em] text-[#737373] font-medium">
            Total Saved So Far
          </span>
          <div className="metric-value mt-[8px]">{formatINR(totalSaved)}</div>
          <p className="text-[13px] text-[#737373] mt-[4px]">
            Accumulated student reserves
          </p>
        </Card>

        <Card>
          <span className="text-[12px] uppercase tracking-[0.05em] text-[#737373] font-medium">
            Remaining to Save
          </span>
          <div className="metric-value mt-[8px]">{formatINR(overallRemaining)}</div>
          <p className="text-[13px] text-[#737373] mt-[4px]">
            Needed to complete all goals
          </p>
        </Card>

        <Card>
          <span className="text-[12px] uppercase tracking-[0.05em] text-[#737373] font-medium">
            Overall Completion
          </span>
          <div className="metric-value mt-[8px]">{overallPct}%</div>
          <div className="w-full h-[6px] bg-[#f5f5f5] rounded-[18px] overflow-hidden mt-[10px]">
            <div
              className="h-full bg-[#0a0a0a] rounded-[18px]"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Create / Edit Goal Form */}
      {isFormOpen && (
        <Card className="border-[#0a0a0a]">
          <div className="flex items-center justify-between mb-[16px]">
            <div>
              <h2 className="text-[18px] font-semibold text-[#0a0a0a]">
                {editingGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
              </h2>
              <p className="text-[13px] text-[#737373]">
                Set your target amount and current saved balance in INR (₹).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              aria-label="Close goal form"
              className="w-[32px] h-[32px] rounded-[18px] bg-[#f5f5f5] flex items-center justify-center text-[#0a0a0a] hover:bg-[#e5e5e5] cursor-pointer"
            >
              <X className="w-[16px] h-[16px]" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-[16px]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-[12px]">
              <div>
                <label
                  htmlFor="goal-title"
                  className="block text-[12px] font-medium text-[#0a0a0a] mb-[6px]"
                >
                  Goal Title *
                </label>
                <Input
                  id="goal-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Semester Emergency Fund"
                />
              </div>

              <div>
                <label
                  htmlFor="goal-target"
                  className="block text-[12px] font-medium text-[#0a0a0a] mb-[6px]"
                >
                  Target Amount (INR ₹) *
                </label>
                <Input
                  id="goal-target"
                  type="number"
                  min={1}
                  step={1}
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="font-mono"
                />
              </div>

              <div>
                <label
                  htmlFor="goal-saved"
                  className="block text-[12px] font-medium text-[#0a0a0a] mb-[6px]"
                >
                  Amount Saved (INR ₹) *
                </label>
                <Input
                  id="goal-saved"
                  type="number"
                  min={0}
                  step={1}
                  value={savedAmount}
                  onChange={(e) => setSavedAmount(e.target.value)}
                  placeholder="e.g. 1500"
                  className="font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-[12px]">
              <div>
                <label
                  htmlFor="goal-deadline"
                  className="block text-[12px] font-medium text-[#0a0a0a] mb-[6px]"
                >
                  Target Date (Optional)
                </label>
                <Input
                  id="goal-deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="goal-notes"
                  className="block text-[12px] font-medium text-[#0a0a0a] mb-[6px]"
                >
                  Notes (Optional)
                </label>
                <Input
                  id="goal-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Purpose or monthly contribution plan"
                />
              </div>
            </div>

            {formError && (
              <p className="text-[13px] text-[#e7000b] font-medium">{formError}</p>
            )}

            <div className="flex items-center justify-end gap-[8px]">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <Card className="py-[48px] text-center space-y-[12px]">
          <p className="text-[16px] font-medium text-[#0a0a0a]">
            No savings goals created yet
          </p>
          <p className="text-[13px] text-[#737373]">
            Start building your emergency buffer or saving for academic hardware.
          </p>
          <Button variant="primary" size="sm" onClick={handleOpenCreate}>
            <Plus className="w-[14px] h-[14px]" />
            <span>Create First Goal</span>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
          {goals.map((goal) => {
            const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
            const pct =
              goal.targetAmount > 0
                ? Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100))
                : 0;

            return (
              <Card key={goal.id} className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-[12px]">
                    <div>
                      <h3 className="text-[18px] font-semibold text-[#0a0a0a]">
                        {goal.title}
                      </h3>
                      {goal.notes && (
                        <p className="text-[12px] text-[#737373] mt-[2px]">
                          {goal.notes}
                        </p>
                      )}
                    </div>
                    <span className="font-mono text-[13px] font-semibold text-[#0a0a0a] tabular-nums">
                      {pct}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-[8px] bg-[#f5f5f5] rounded-[18px] overflow-hidden my-[16px]">
                    <div
                      className="h-full bg-[#0a0a0a] rounded-[18px] transition-all duration-200"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-[8px] text-[13px] pt-[4px]">
                    <div>
                      <span className="text-[11px] uppercase text-[#737373] block">
                        Saved
                      </span>
                      <span className="font-mono font-semibold text-[#0a0a0a] tabular-nums">
                        {formatINR(goal.savedAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] uppercase text-[#737373] block">
                        Target
                      </span>
                      <span className="font-mono font-medium text-[#0a0a0a] tabular-nums">
                        {formatINR(goal.targetAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] uppercase text-[#737373] block">
                        Remaining
                      </span>
                      <span className="font-mono text-[#737373] tabular-nums">
                        {formatINR(remaining)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Progress & Edit/Delete Controls */}
                <div className="mt-[20px] pt-[14px] border-t border-[#e5e5e5] flex items-center justify-between gap-[8px]">
                  <div className="flex items-center gap-[6px]">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={goal.savedAmount >= goal.targetAmount}
                      onClick={() => handleQuickDeposit(goal, 250)}
                      aria-label={`Add 250 INR to ${goal.title}`}
                    >
                      <ArrowUpRight className="w-[12px] h-[12px]" />
                      <span>+₹250</span>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={goal.savedAmount >= goal.targetAmount}
                      onClick={() => handleQuickDeposit(goal, 500)}
                      aria-label={`Add 500 INR to ${goal.title}`}
                    >
                      <ArrowUpRight className="w-[12px] h-[12px]" />
                      <span>+₹500</span>
                    </Button>
                  </div>

                  <div className="flex items-center gap-[6px]">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(goal)}
                      aria-label={`Edit ${goal.title}`}
                    >
                      <Pencil className="w-[12px] h-[12px]" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteGoal(goal.id)}
                      aria-label={`Delete ${goal.title}`}
                    >
                      <Trash2 className="w-[12px] h-[12px]" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
