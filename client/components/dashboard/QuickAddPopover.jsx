'use client';

import { useState, useEffect } from 'react';
import {
  Plus, ArrowDownLeft, ArrowUpRight, Check, Loader2,
  Sparkles, DollarSign, Tag, Calendar
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { transactionsApi, categoriesApi, accountsApi } from '@/services/api';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

export default function QuickAddPopover({
  trigger,
  onSuccess,
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('expense'); // 'income' | 'expense'
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      Promise.all([categoriesApi.getAll(), accountsApi.getAll()])
        .then(([catRes, accRes]) => {
          setCategories(catRes.data.categories || []);
          setAccounts(accRes.data.accounts || []);
          if (catRes.data.categories?.length && !categoryId) {
            setCategoryId(catRes.data.categories[0].id);
          }
          if (accRes.data.accounts?.length && !accountId) {
            setAccountId(accRes.data.accounts[0].id);
          }
        })
        .catch(() => {});
    }
  }, [open]);

  const quickAmounts = type === 'expense' ? [100, 250, 500, 1000, 2500] : [1000, 5000, 10000, 25000, 50000];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      return toast.error('Please enter a valid amount.');
    }
    if (!title.trim()) {
      return toast.error('Please enter a title.');
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('amount', amount);
      formData.append('type', type);
      formData.append('date', new Date().toISOString().split('T')[0]);
      if (categoryId) formData.append('categoryId', categoryId);
      if (accountId) formData.append('accountId', accountId);

      await transactionsApi.create(formData);
      toast.success(`${type === 'income' ? 'Income' : 'Expense'} recorded.`);
      setOpen(false);
      setAmount('');
      setTitle('');
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record entry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {trigger || (
          <Button size="sm" className="h-8.5 rounded-xl font-semibold gap-1.5 shadow-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>Quick Entry</span>
          </Button>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border/80 dark:border-white/10 bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150 focus:outline-none dark:bg-[#1C1C1C]">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/40 dark:border-white/[0.06]">
            <div>
              <Dialog.Title className="text-base font-bold tracking-tight text-foreground">
                Quick Financial Entry
              </Dialog.Title>
              <Dialog.Description className="text-xs text-muted-foreground mt-0.5">
                Record income or expense with instant passbook sync
              </Dialog.Description>
            </div>

            {/* Type Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-muted/60 dark:bg-white/[0.05] border border-border/40 dark:border-white/[0.04]">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1',
                  type === 'expense'
                    ? 'bg-rose-500/15 text-rose-500 shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <ArrowUpRight className="w-3 h-3" />
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1',
                  type === 'income'
                    ? 'bg-emerald-500/15 text-emerald-500 shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <ArrowDownLeft className="w-3 h-3" />
                Income
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount input with Currency Symbol */}
            <div>
              <Label className="text-xs font-semibold text-muted-foreground">Amount (₹)</Label>
              <div className="relative mt-1">
                <Input
                  type="number"
                  step="0.01"
                  autoFocus
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-12 text-2xl font-bold font-mono tracking-tight pl-8 rounded-2xl dark:bg-white/[0.03] dark:border-white/10"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">
                  ₹
                </span>
              </div>

              {/* Quick Amount Suggestion Chips */}
              <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(q.toString())}
                    className="px-2 py-1 rounded-lg text-[11px] font-mono font-medium bg-accent/60 dark:bg-white/[0.04] border border-border/40 hover:border-border text-muted-foreground hover:text-foreground transition-all shrink-0"
                  >
                    +₹{q}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground">Description</Label>
              <Input
                placeholder={type === 'expense' ? 'e.g. Grocery store, Coffee, Uber' : 'e.g. Salary, Freelance project'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-9.5 text-xs rounded-xl dark:bg-white/[0.03] dark:border-white/10"
              />
            </div>

            {/* Category & Account Selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground">Category</Label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-9.5 text-xs rounded-xl px-3 bg-background dark:bg-[#1E1E1E] border border-border/80 dark:border-white/10 text-foreground"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground">Account</Label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full h-9.5 text-xs rounded-xl px-3 bg-background dark:bg-[#1E1E1E] border border-border/80 dark:border-white/10 text-foreground"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/40 dark:border-white/[0.06]">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="h-9 rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-9 px-5 rounded-xl font-semibold gap-1.5 shadow-xs"
                disabled={submitting}
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Save Entry</span>
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
