import React, { useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Bot,
  Calculator,
  Target,
  Settings,
  Plus,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { NavigationSection } from '../types/finance';
import { Button } from '../components/ui/primitives';
import { formatINR } from '../services/financeEngine';

interface AppShellProps {
  activeSection: NavigationSection;
  onSelectSection: (section: NavigationSection) => void;
  onQuickAddExpense: () => void;
  monthlyAllowance: number;
  remainingBalance: number;
  children: React.ReactNode;
}

const NAV_ITEMS: {
  id: NavigationSection;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'overview', label: 'Overview', shortLabel: 'Overview', icon: LayoutDashboard },
  { id: 'expenses', label: 'Expenses', shortLabel: 'Expenses', icon: Receipt },
  { id: 'analytics', label: 'Analytics', shortLabel: 'Analytics', icon: PieChart },
  { id: 'assistant', label: 'AI Finance Assistant', shortLabel: 'AI Assistant', icon: Bot },
  { id: 'planner', label: 'AI Budget Planner', shortLabel: 'Budget Planner', icon: Calculator },
  { id: 'goals', label: 'Savings Goals', shortLabel: 'Goals', icon: Target },
  { id: 'settings', label: 'Settings', shortLabel: 'Settings', icon: Settings },
];

export const AppShell: React.FC<AppShellProps> = ({
  activeSection,
  onSelectSection,
  onQuickAddExpense,
  monthlyAllowance,
  remainingBalance,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeNav = NAV_ITEMS.find((item) => item.id === activeSection) || NAV_ITEMS[0];

  const handleNavClick = (section: NavigationSection) => {
    onSelectSection(section);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#0a0a0a] flex flex-col lg:flex-row">
      {/* Desktop Sidebar (#fafafa surface as specified in DESIGN.md) */}
      <aside
        aria-label="Primary Sidebar Navigation"
        className="hidden lg:flex lg:flex-col lg:w-[264px] lg:shrink-0 bg-[#fafafa] border-r border-[#e5e5e5] min-h-screen sticky top-0 h-screen justify-between p-[20px]"
      >
        <div className="space-y-[24px]">
          {/* Brand Lockup */}
          <div className="px-[8px] pt-[4px]">
            <div className="flex items-center justify-between">
              <span className="text-[16px] font-semibold tracking-[-0.03em] text-[#0a0a0a]">
                Campus Finance Buddy
              </span>
            </div>
            <p className="text-[12px] text-[#737373] mt-[2px]">
              Your Money. Your Decisions. Your Future.
            </p>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Main sections" className="space-y-[4px]">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center gap-[10px] px-[14px] py-[9px] rounded-[18px] text-[14px] font-medium transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#0a0a0a] text-[#fafafa]'
                      : 'text-[#171717] hover:bg-[#f5f5f5]'
                  }`}
                >
                  <Icon
                    className={`w-[16px] h-[16px] shrink-0 ${
                      isActive ? 'text-[#fafafa]' : 'text-[#737373]'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Compact Allowance Summary inside Sidebar */}
        <div className="pt-[16px] border-t border-[#e5e5e5] space-y-[12px]">
          <div className="px-[8px] space-y-[4px]">
            <div className="flex items-center justify-between text-[12px] text-[#737373]">
              <span>Monthly Allowance</span>
              <span className="font-mono text-[#0a0a0a] tabular-nums">
                {formatINR(monthlyAllowance)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[12px] text-[#737373]">
              <span>Remaining Balance</span>
              <span
                className={`font-mono font-medium tabular-nums ${
                  remainingBalance < 0 ? 'text-[#e7000b]' : 'text-[#0a0a0a]'
                }`}
              >
                {formatINR(remainingBalance)}
              </span>
            </div>
          </div>
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={onQuickAddExpense}
          >
            <Plus className="w-[15px] h-[15px]" />
            <span>Add Expense</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar Contract (Single-row 3-zone header) */}
        <header className="sticky top-0 z-30 bg-[#fafafa]/95 backdrop-blur-sm border-b border-[#e5e5e5] px-[16px] sm:px-[24px] lg:px-[32px] h-[60px] flex items-center justify-between gap-[16px]">
          {/* Zone 1: Breadcrumb / Mobile Brand */}
          <div className="flex items-center gap-[8px] min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="lg:hidden inline-flex items-center justify-center w-[36px] h-[36px] rounded-[18px] bg-[#f5f5f5] text-[#0a0a0a] hover:bg-[#e5e5e5] cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="w-[18px] h-[18px]" />
              ) : (
                <Menu className="w-[18px] h-[18px]" />
              )}
            </button>
            <div className="flex items-center gap-[6px] text-[14px] truncate">
              <span className="text-[#737373] hidden sm:inline">Campus Finance Buddy</span>
              <ChevronRight className="w-[14px] h-[14px] text-[#737373] hidden sm:inline shrink-0" />
              <span className="font-medium text-[#0a0a0a] truncate">{activeNav.label}</span>
            </div>
          </div>

          {/* Zone 2: Quick Section Switcher on Tablet/Mobile */}
          <nav
            aria-label="Quick navigation"
            className="hidden md:flex lg:hidden items-center gap-[12px] text-[13px] text-[#737373]"
          >
            {NAV_ITEMS.slice(0, 5).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`whitespace-nowrap shrink-0 cursor-pointer hover:text-[#0a0a0a] ${
                  activeSection === item.id ? 'text-[#0a0a0a] font-medium underline underline-offset-4' : ''
                }`}
              >
                {item.shortLabel}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-[8px] shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={onQuickAddExpense}
              aria-label="Quick Add Expense"
            >
              <Plus className="w-[14px] h-[14px]" />
              <span>Add Expense</span>
            </Button>
          </div>
        </header>

        {/* Mobile Slide-down Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#fafafa] border-b border-[#e5e5e5] px-[16px] py-[12px] space-y-[4px]">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-[10px] px-[14px] py-[10px] rounded-[18px] text-[14px] font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#0a0a0a] text-[#fafafa]'
                      : 'text-[#171717] hover:bg-[#f5f5f5]'
                  }`}
                >
                  <Icon className="w-[16px] h-[16px] shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Page Container (max-w-[1280px] per DESIGN.md) */}
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-[16px] sm:px-[24px] lg:px-[32px] py-[24px] sm:py-[32px]">
          {children}
        </main>
      </div>
    </div>
  );
};
