import React, { useEffect, useRef, useState } from 'react';
import {
  Send,
  Trash2,
  Bot,
  User,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import {
  CategoryBudgetMap,
  ChatMessage,
  EXPENSE_CATEGORIES,
} from '../types/finance';
import {
  calculateRemainingBalance,
  calculateSpendingPercentage,
  formatINR,
} from '../services/financeEngine';
import {
  AIStatusResponse,
  checkAIBackendStatus,
  FinancialContextPayload,
  sendAssistantMessage,
} from '../services/gemini';
import { Button, Card, Input } from '../components/ui/primitives';

interface AssistantPageProps {
  messages: ChatMessage[];
  onUpdateMessages: (messages: ChatMessage[]) => void;
  onClearConversation: () => void;
  monthlyAllowance: number;
  totalExpenses: number;
  categoryTotals: CategoryBudgetMap;
  currentBudget: CategoryBudgetMap;
  savingsTarget: number;
}

const SUGGESTED_QUESTIONS = [
  'How can I save ₹500 this month?',
  'Analyse my spending habits.',
  'Which expenses should I reduce?',
  'Explain the 50/30/20 budgeting rule.',
  'How much should I keep for emergencies?',
];

export const AssistantPage: React.FC<AssistantPageProps> = ({
  messages,
  onUpdateMessages,
  onClearConversation,
  monthlyAllowance,
  totalExpenses,
  categoryTotals,
  currentBudget,
  savingsTarget,
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [aiStatus, setAiStatus] = useState<AIStatusResponse>({
    configured: false,
    model: 'gemini-3.8-flash',
    mode: 'deterministic-fallback',
  });

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAIBackendStatus().then(setAiStatus);
  }, []);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const remainingBalance = calculateRemainingBalance(monthlyAllowance, totalExpenses);
  const spendingPercentage = calculateSpendingPercentage(totalExpenses, monthlyAllowance);

  const financialContext: FinancialContextPayload = {
    monthlyAllowance,
    totalExpenses,
    remainingBalance,
    spendingPercentage,
    categoryTotals,
    savingsTarget,
    currentBudget,
  };

  const handleSendMessage = async (promptText?: string) => {
    const text = (promptText ?? input).trim();
    if (!text || isLoading) return;

    setErrorMessage('');
    if (!promptText) {
      setInput('');
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMsg];
    onUpdateMessages(nextMessages);
    setIsLoading(true);

    try {
      const response = await sendAssistantMessage({
        message: text,
        history: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        financialContext,
      });

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toISOString(),
        isFallback: response.isFallback,
      };

      onUpdateMessages([...nextMessages, assistantMsg]);
    } catch {
      setErrorMessage('Could not reach the assistant service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <div className="space-y-[24px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-[16px]">
        <div>
          <p className="text-[12px] uppercase tracking-[0.05em] text-[#737373] font-medium">
            Contextual Financial Intelligence
          </p>
          <h1 className="display-heading mt-[4px]">AI Finance Assistant</h1>
          <p className="text-[14px] text-[#737373] mt-[6px]">
            Grounded in your actual stored transactions ({formatINR(totalExpenses)} spent of{' '}
            {formatINR(monthlyAllowance)} allowance).
          </p>
        </div>

        <div className="flex items-center gap-[8px]">
          <span className="text-[12px] text-[#737373] px-[10px] py-[4px] rounded-[18px] bg-[#ffffff] border border-[#e5e5e5]">
            {aiStatus.configured
              ? `Gemini Flash Live (${aiStatus.model})`
              : 'Rule-Based Contextual Engine Active'}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearConversation}
            aria-label="Clear conversation history"
          >
            <Trash2 className="w-[13px] h-[13px]" />
            <span>Clear Chat</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[20px]">
        {/* Left/Main Conversational Panel */}
        <Card className="lg:col-span-8 flex flex-col justify-between min-h-[560px]">
          {/* Suggested Questions Strip */}
          <div className="pb-[14px] border-b border-[#e5e5e5]">
            <p className="text-[12px] text-[#737373] mb-[8px]">
              Suggested Questions (click to ask):
            </p>
            <div className="flex flex-wrap gap-[6px]">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSendMessage(q)}
                  className="text-[12px] font-medium px-[12px] py-[6px] rounded-[18px] bg-[#f5f5f5] text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-[#fafafa] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Message Stream */}
          <div
            className="flex-1 overflow-y-auto py-[16px] space-y-[16px] max-h-[420px] pr-[4px]"
            aria-live="polite"
          >
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-[10px] ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!isUser && (
                    <div className="w-[30px] h-[30px] rounded-[18px] bg-[#0a0a0a] text-[#fafafa] flex items-center justify-center shrink-0 mt-[2px]">
                      <Bot className="w-[15px] h-[15px]" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-[18px] px-[16px] py-[12px] text-[14px] leading-[1.5] ${
                      isUser
                        ? 'bg-[#0a0a0a] text-[#fafafa]'
                        : 'bg-[#fafafa] text-[#0a0a0a] border border-[#e5e5e5]'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.content}</div>
                    {msg.isFallback && !isUser && (
                      <div className="mt-[8px] pt-[6px] border-t border-[#e5e5e5] text-[11px] text-[#737373]">
                        Computed using local deterministic spending analyzer
                      </div>
                    )}
                  </div>
                  {isUser && (
                    <div className="w-[30px] h-[30px] rounded-[18px] bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5] flex items-center justify-center shrink-0 mt-[2px]">
                      <User className="w-[15px] h-[15px]" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-[10px] text-[13px] text-[#737373]">
                <div className="w-[30px] h-[30px] rounded-[18px] bg-[#0a0a0a] text-[#fafafa] flex items-center justify-center">
                  <Loader2 className="w-[15px] h-[15px] animate-spin" />
                </div>
                <span>Analyzing your stored financial context...</span>
              </div>
            )}

            {errorMessage && (
              <div className="text-[13px] text-[#e7000b] font-medium">{errorMessage}</div>
            )}

            <div ref={endOfMessagesRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleFormSubmit}
            className="pt-[14px] border-t border-[#e5e5e5] flex items-center gap-[8px]"
          >
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your spending, savings plan, or financial concepts..."
              aria-label="Message AI Finance Assistant"
              disabled={isLoading}
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              <Send className="w-[14px] h-[14px]" />
              <span>Send</span>
            </Button>
          </form>
        </Card>

        {/* Right Context Panel: Live Financial Context Passed to Assistant */}
        <div className="lg:col-span-4 space-y-[16px]">
          <Card>
            <h2 className="text-[16px] font-semibold text-[#0a0a0a]">
              Active Context Payload
            </h2>
            <p className="text-[12px] text-[#737373] mt-[2px]">
              Exact deterministic figures injected into every assistant query:
            </p>

            <div className="mt-[14px] space-y-[8px] text-[13px]">
              <div className="flex items-center justify-between py-[4px] border-b border-[#e5e5e5]">
                <span className="text-[#737373]">Monthly Allowance</span>
                <span className="font-mono font-medium text-[#0a0a0a] tabular-nums">
                  {formatINR(monthlyAllowance)}
                </span>
              </div>
              <div className="flex items-center justify-between py-[4px] border-b border-[#e5e5e5]">
                <span className="text-[#737373]">Total Expenses</span>
                <span className="font-mono font-medium text-[#0a0a0a] tabular-nums">
                  {formatINR(totalExpenses)} ({spendingPercentage}%)
                </span>
              </div>
              <div className="flex items-center justify-between py-[4px] border-b border-[#e5e5e5]">
                <span className="text-[#737373]">Remaining Balance</span>
                <span className="font-mono font-medium text-[#0a0a0a] tabular-nums">
                  {formatINR(remainingBalance)}
                </span>
              </div>
              <div className="flex items-center justify-between py-[4px] border-b border-[#e5e5e5]">
                <span className="text-[#737373]">Savings Target</span>
                <span className="font-mono font-medium text-[#0a0a0a] tabular-nums">
                  +{formatINR(savingsTarget)}
                </span>
              </div>
            </div>

            <div className="mt-[14px]">
              <p className="text-[12px] uppercase tracking-[0.05em] text-[#737373] font-medium mb-[8px]">
                Category Breakdown
              </p>
              <div className="space-y-[6px] text-[13px]">
                {EXPENSE_CATEGORIES.map((cat) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-[#737373]">{cat}</span>
                    <span className="font-mono text-[#0a0a0a] tabular-nums">
                      {formatINR(categoryTotals[cat] || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card variant="subtle">
            <div className="flex items-start gap-[10px]">
              <ShieldCheck className="w-[18px] h-[18px] text-[#0a0a0a] shrink-0 mt-[2px]" />
              <div className="space-y-[6px] text-[12px] text-[#737373]">
                <p className="font-semibold text-[#0a0a0a]">AI Financial Safety Boundary</p>
                <p>
                  Campus Finance Buddy never asks for bank passwords, OTPs, or UPI PINs, does not connect to live bank accounts, and never uses an LLM to override deterministic TypeScript arithmetic.
                </p>
                <p>
                  Responses are educational guidance for college students, not licensed investment advice.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
