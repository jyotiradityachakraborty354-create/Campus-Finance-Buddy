import React, { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ArrowUpDown,
  X,
} from 'lucide-react';
import {
  EXPENSE_CATEGORIES,
  ExpenseCategory,
  Transaction,
} from '../types/finance';
import {
  calculateCategoryTotals,
  calculateTotalExpenses,
  formatINR,
} from '../services/financeEngine';
import { Button, Card, Input, Select } from '../components/ui/primitives';

interface ExpensesPageProps {
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onUpdateTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  openModalTrigger?: number;
}

export const ExpensesPage: React.FC<ExpensesPageProps> = ({
  transactions,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  openModalTrigger,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.Food);
  const [date, setDate] = useState('2026-10-28');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  React.useEffect(() => {
    if (openModalTrigger && openModalTrigger > 0) {
      handleOpenCreate();
    }
  }, [openModalTrigger]);

  const handleOpenCreate = () => {
    setEditingTx(null);
    setDescription('');
    setAmount('');
    setCategory(ExpenseCategory.Food);
    setDate('2026-10-28');
    setNotes('');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setDescription(tx.description);
    setAmount(String(tx.amount));
    setCategory(tx.category);
    setDate(tx.date);
    setNotes(tx.notes || '');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      setFormError('Description is required and cannot be empty.');
      return;
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFormError('Amount must be a positive number in INR (greater than ₹0).');
      return;
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setFormError('Please select a valid transaction date.');
      return;
    }

    const payload = {
      description: trimmedDesc,
      amount: Math.round(numericAmount),
      category,
      date,
      notes: notes.trim() ? notes.trim() : undefined,
    };

    if (editingTx) {
      onUpdateTransaction({
        id: editingTx.id,
        ...payload,
      });
    } else {
      onAddTransaction(payload);
    }

    setIsFormOpen(false);
    setEditingTx(null);
  };

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        if (selectedCategory !== 'ALL' && tx.category !== selectedCategory) {
          return false;
        }
        if (startDate && tx.date < startDate) {
          return false;
        }
        if (endDate && tx.date > endDate) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchDesc = tx.description.toLowerCase().includes(q);
          const matchNotes = (tx.notes || '').toLowerCase().includes(q);
          const matchCat = tx.category.toLowerCase().includes(q);
          if (!matchDesc && !matchNotes && !matchCat) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return b.date.localeCompare(a.date);
        if (sortBy === 'date-asc') return a.date.localeCompare(b.date);
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, selectedCategory, startDate, endDate, searchQuery, sortBy]);

  const filteredTotal = calculateTotalExpenses(filteredTransactions);
  const categoryTotals = calculateCategoryTotals(transactions);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setStartDate('');
    setEndDate('');
    setSortBy('date-desc');
  };

  return (
    <div className="space-y-[28px]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-[16px]">
        <div>
          <p className="text-[12px] uppercase tracking-[0.05em] text-[#737373] font-medium">
            Transaction Ledger
          </p>
          <h1 className="display-heading mt-[4px]">Expenses</h1>
          <p className="text-[14px] text-[#737373] mt-[6px]">
            Record, edit, filter, and audit every rupee spent across your 6 campus categories.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenCreate}>
          <Plus className="w-[15px] h-[15px]" />
          <span>New Expense</span>
        </Button>
      </div>

      {/* Category Filter Bar (Interactive Filter Controls) */}
      <div className="flex flex-wrap items-center gap-[8px]">
        <button
          type="button"
          onClick={() => setSelectedCategory('ALL')}
          className={`h-[34px] px-[14px] rounded-[18px] text-[13px] font-medium transition-colors cursor-pointer ${
            selectedCategory === 'ALL'
              ? 'bg-[#0a0a0a] text-[#fafafa]'
              : 'bg-[#ffffff] text-[#0a0a0a] border border-[#e5e5e5] hover:bg-[#fafafa]'
          }`}
        >
          All Categories ({formatINR(calculateTotalExpenses(transactions))})
        </button>
        {EXPENSE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`h-[34px] px-[14px] rounded-[18px] text-[13px] font-medium transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#0a0a0a] text-[#fafafa]'
                : 'bg-[#ffffff] text-[#0a0a0a] border border-[#e5e5e5] hover:bg-[#fafafa]'
            }`}
          >
            {cat} · {formatINR(categoryTotals[cat] || 0)}
          </button>
        ))}
      </div>

      {/* Search, Date Range, and Sort Controls */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-[12px] items-end">
          <div className="lg:col-span-4">
            <label
              htmlFor="expense-search"
              className="block text-[12px] text-[#737373] mb-[6px]"
            >
              Search description or notes
            </label>
            <div className="relative">
              <Search className="w-[15px] h-[15px] text-[#737373] absolute left-[12px] top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                id="expense-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search e.g. mess, metro, textbook..."
                className="pl-[36px]"
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <label
              htmlFor="filter-start-date"
              className="block text-[12px] text-[#737373] mb-[6px]"
            >
              From Date
            </label>
            <Input
              id="filter-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="lg:col-span-2">
            <label
              htmlFor="filter-end-date"
              className="block text-[12px] text-[#737373] mb-[6px]"
            >
              To Date
            </label>
            <Input
              id="filter-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="lg:col-span-3">
            <label
              htmlFor="sort-expenses"
              className="block text-[12px] text-[#737373] mb-[6px]"
            >
              Sort By
            </label>
            <div className="relative">
              <ArrowUpDown className="w-[14px] h-[14px] text-[#737373] absolute left-[12px] top-1/2 -translate-y-1/2 pointer-events-none" />
              <Select
                id="sort-expenses"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="pl-[34px]"
              >
                <option value="date-desc">Date (Newest first)</option>
                <option value="date-asc">Date (Oldest first)</option>
                <option value="amount-desc">Amount (Highest first)</option>
                <option value="amount-asc">Amount (Lowest first)</option>
              </Select>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Button
              variant="secondary"
              size="md"
              onClick={clearFilters}
              className="w-full"
              aria-label="Reset expense filters"
            >
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Add / Edit Expense Form Modal / Panel */}
      {isFormOpen && (
        <Card className="border-[#0a0a0a]">
          <div className="flex items-center justify-between mb-[16px]">
            <div>
              <h2 className="text-[18px] font-semibold text-[#0a0a0a]">
                {editingTx ? 'Edit Expense Entry' : 'Record New Expense'}
              </h2>
              <p className="text-[13px] text-[#737373]">
                All fields are validated before updating your LocalStorage ledger.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              aria-label="Close expense form"
              className="w-[32px] h-[32px] rounded-[18px] bg-[#f5f5f5] flex items-center justify-center text-[#0a0a0a] hover:bg-[#e5e5e5] cursor-pointer"
            >
              <X className="w-[16px] h-[16px]" />
            </button>
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-[16px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[12px]">
              <div className="sm:col-span-2">
                <label
                  htmlFor="tx-description"
                  className="block text-[12px] font-medium text-[#0a0a0a] mb-[6px]"
                >
                  Description *
                </label>
                <Input
                  id="tx-description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Semester Lab Record Printing"
                />
              </div>

              <div>
                <label
                  htmlFor="tx-amount"
                  className="block text-[12px] font-medium text-[#0a0a0a] mb-[6px]"
                >
                  Amount (INR ₹) *
                </label>
                <Input
                  id="tx-amount"
                  type="number"
                  min={1}
                  step={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 250"
                  className="font-mono"
                />
              </div>

              <div>
                <label
                  htmlFor="tx-category"
                  className="block text-[12px] font-medium text-[#0a0a0a] mb-[6px]"
                >
                  Category *
                </label>
                <Select
                  id="tx-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-[12px]">
              <div>
                <label
                  htmlFor="tx-date"
                  className="block text-[12px] font-medium text-[#0a0a0a] mb-[6px]"
                >
                  Transaction Date *
                </label>
                <Input
                  id="tx-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="tx-notes"
                  className="block text-[12px] font-medium text-[#0a0a0a] mb-[6px]"
                >
                  Notes (Optional)
                </label>
                <Input
                  id="tx-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional context, payment mode, or group split details"
                />
              </div>
            </div>

            {formError && (
              <p className="text-[13px] text-[#e7000b] font-medium" role="alert">
                {formError}
              </p>
            )}

            <div className="flex items-center justify-end gap-[8px] pt-[8px]">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingTx ? 'Save Changes' : 'Save Expense'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Transactions List (Desktop Table + Mobile Responsive Cards) */}
      <Card>
        <div className="flex items-center justify-between mb-[16px]">
          <div className="text-[14px] text-[#737373]">
            Showing <span className="font-medium text-[#0a0a0a]">{filteredTransactions.length}</span>{' '}
            of {transactions.length} transactions
          </div>
          <div className="text-[14px] font-mono">
            Filtered Total:{' '}
            <span className="font-semibold text-[#0a0a0a] tabular-nums">
              {formatINR(filteredTotal)}
            </span>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-[40px] text-center space-y-[12px]">
            <p className="text-[15px] font-medium text-[#0a0a0a]">
              No matching expenses found
            </p>
            <p className="text-[13px] text-[#737373]">
              Try clearing your search filters or log a new campus transaction.
            </p>
            <div className="flex items-center justify-center gap-[8px]">
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
              <Button variant="primary" size="sm" onClick={handleOpenCreate}>
                <Plus className="w-[14px] h-[14px]" />
                <span>Add Expense</span>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e5e5e5] text-[12px] uppercase tracking-[0.05em] text-[#737373]">
                    <th className="py-[10px] pr-[12px] font-medium">Description</th>
                    <th className="py-[10px] px-[12px] font-medium">Category</th>
                    <th className="py-[10px] px-[12px] font-medium">Date</th>
                    <th className="py-[10px] px-[12px] text-right font-medium">Amount</th>
                    <th className="py-[10px] pl-[12px] text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5] text-[14px]">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#fafafa] transition-colors">
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
                      <td className="py-[12px] px-[12px] text-right font-mono font-medium text-[#0a0a0a] tabular-nums">
                        {formatINR(tx.amount)}
                      </td>
                      <td className="py-[12px] pl-[12px] text-right">
                        <div className="inline-flex items-center gap-[6px]">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenEdit(tx)}
                            aria-label={`Edit ${tx.description}`}
                          >
                            <Pencil className="w-[13px] h-[13px]" />
                            <span>Edit</span>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDeleteTransaction(tx.id)}
                            aria-label={`Delete ${tx.description}`}
                          >
                            <Trash2 className="w-[13px] h-[13px]" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Transaction Stack */}
            <div className="md:hidden divide-y divide-[#e5e5e5]">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="py-[14px] space-y-[8px]">
                  <div className="flex items-start justify-between gap-[12px]">
                    <div>
                      <div className="font-medium text-[#0a0a0a]">{tx.description}</div>
                      <div className="text-[12px] text-[#737373] mt-[2px]">
                        {tx.category} · <span className="font-mono">{tx.date}</span>
                      </div>
                      {tx.notes && (
                        <div className="text-[12px] text-[#737373] mt-[2px]">{tx.notes}</div>
                      )}
                    </div>
                    <div className="font-mono font-semibold text-[#0a0a0a] tabular-nums">
                      {formatINR(tx.amount)}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-[8px]">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenEdit(tx)}
                      aria-label={`Edit ${tx.description}`}
                    >
                      <Pencil className="w-[13px] h-[13px]" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteTransaction(tx.id)}
                      aria-label={`Delete ${tx.description}`}
                    >
                      <Trash2 className="w-[13px] h-[13px]" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
