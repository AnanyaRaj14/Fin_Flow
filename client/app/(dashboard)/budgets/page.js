'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { budgetsApi, categoriesApi } from '@/services/api';
import { formatCurrency, cn } from '@/lib/utils';
import { toast } from '@/components/ui/toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function BudgetsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm();
  const selectedCategory = watch('categoryId');

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const { data } = await budgetsApi.getAll({ month, year });
      setBudgets(data?.budgets || []);
    } catch { toast.error('Failed to load budgets.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBudgets(); }, [month, year]);

  useEffect(() => {
    categoriesApi.getAll().then(({ data }) => {
      setCategories((data?.categories || []).filter((c) => c.type === 'expense' || c.type === 'both'));
    }).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditing(null);
    reset({ categoryId: '', amount: '' });
    setOpen(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    reset({ categoryId: b.categoryId, amount: b.amount });
    setOpen(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing) {
        const { data: res } = await budgetsApi.update(editing.id, { amount: data.amount });
        setBudgets((p) => p.map((b) => (b.id === editing.id ? res.budget : b)));
        toast.success('Budget updated.');
      } else {
        const { data: res } = await budgetsApi.create({ ...data, month, year });
        setBudgets((p) => {
          const idx = p.findIndex((b) => b.id === res.budget.id);
          return idx >= 0 ? p.map((b) => b.id === res.budget.id ? res.budget : b) : [...p, res.budget];
        });
        toast.success('Budget created.');
      }
      setOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving budget.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await budgetsApi.delete(confirmDelete.id);
      setBudgets((p) => p.filter((c) => c.id !== confirmDelete.id));
      toast.success('Budget deleted.');
    } catch { toast.error('Failed to delete.'); }
    finally { setConfirmDelete(null); }
  };

  const safeBudgets = Array.isArray(budgets) ? budgets : [];
  const totalBudgeted = safeBudgets.reduce((s, b) => s + (Number(b.amount) || 0), 0);
  const totalSpent = safeBudgets.reduce((s, b) => s + (Number(b.spent) || 0), 0);

  return (
    <DashboardLayout title="Budgets">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pb-1">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Budget Planner</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              <span className="font-mono tabular-nums">{formatCurrency(totalSpent)}</span> spent of <span className="font-mono tabular-nums">{formatCurrency(totalBudgeted)}</span> allocated
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger className="w-24 h-8 text-xs dark:bg-white/[0.03] dark:border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-24 h-8 text-xs dark:bg-white/[0.03] dark:border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[year - 1, year, year + 1].map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            <ShimmerButton
              onClick={openCreate}
              className="h-8 px-3.5 text-xs font-medium gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Budget</span>
            </ShimmerButton>
          </div>
        </div>

        {/* Summary bar */}
        {budgets.length > 0 && (
          <SpotlightCard radius={350} className="p-4 border-border/70 dark:border-white/[0.08] dark:bg-[#121215]/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-foreground">Overall Allocation</span>
              <span className="text-xs font-mono font-medium text-muted-foreground tabular-nums">
                {totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0}% consumed
              </span>
            </div>
            <Progress
              value={totalBudgeted > 0 ? Math.min((totalSpent / totalBudgeted) * 100, 100) : 0}
              className="h-2 rounded-full dark:bg-white/[0.06]"
              indicatorClassName={totalSpent > totalBudgeted ? 'bg-rose-500' : 'bg-foreground dark:bg-white'}
            />
            <div className="flex justify-between text-[11px] text-muted-foreground mt-2">
              <span className="font-mono tabular-nums">{formatCurrency(totalSpent)} spent</span>
              <span className="font-mono tabular-nums">{formatCurrency(Math.max(0, totalBudgeted - totalSpent))} remaining</span>
            </div>
          </SpotlightCard>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-muted-foreground" /></div>
        ) : budgets.length === 0 ? (
          <SpotlightCard className="text-center py-16 text-muted-foreground border-border/70 dark:border-white/[0.08] dark:bg-[#121215]/80">
            <p className="font-medium text-sm text-foreground">No budgets for {MONTHS[month - 1]} {year}</p>
            <p className="text-xs text-muted-foreground mt-0.5 mb-4">Set category limits to track and control expenses.</p>
            <ShimmerButton
              onClick={openCreate}
              className="h-8 px-4 text-xs font-medium gap-1.5 mx-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Budget</span>
            </ShimmerButton>
          </SpotlightCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map((budget, i) => {
              const pct = budget.amount > 0 ? Math.min((budget.spent / budget.amount) * 100, 100) : 0;
              const over = budget.spent > budget.amount;
              return (
                <motion.div key={budget.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <SpotlightCard
                    radius={300}
                    spotlightColor={over ? 'rgba(244, 63, 94, 0.2)' : `${budget.category?.color || '#6366f1'}22`}
                    className={cn(
                      'p-5 border-border/70 dark:border-white/[0.08] dark:bg-[#121215]/80',
                      over && 'border-rose-500/40 dark:border-rose-500/30'
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center border" style={{ background: (budget.category?.color || '#6366f1') + '15', borderColor: (budget.category?.color || '#6366f1') + '30' }}>
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: budget.category?.color }} />
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-foreground truncate">{budget.category?.name}</p>
                          <p className="text-[11px] font-mono tabular-nums text-muted-foreground">
                            {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                          </p>
                        </div>
                        {over && <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => openEdit(budget)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => setConfirmDelete(budget)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <Progress
                      value={pct}
                      className="h-1.5 rounded-full dark:bg-white/[0.06]"
                      indicatorClassName={over ? 'bg-rose-500' : 'bg-foreground dark:bg-white'}
                    />
                    <div className="flex justify-between text-[11px] font-mono tabular-nums mt-2">
                      <span className="text-muted-foreground">{Math.round(pct)}% used</span>
                      <span className={over ? 'text-rose-500 font-semibold' : 'text-muted-foreground'}>
                        {over ? `+${formatCurrency(budget.spent - budget.amount)} over` : `${formatCurrency(budget.amount - budget.spent)} left`}
                      </span>
                    </div>
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Budget' : 'Add Budget'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            {!editing && (
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={(v) => setValue('categoryId', v)}>
                  <SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((c) => !budgets.find((b) => b.categoryId === c.id))
                      .map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Budget Amount</Label>
              <Input type="number" step="0.01" min="1" placeholder="0.00" {...register('amount', { required: 'Amount required', min: 1 })} />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setOpen(false)}>Cancel</Button>
              <ShimmerButton type="submit" className="flex-1 h-9 rounded-xl font-medium" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{editing ? 'Update Budget' : 'Create Budget'}</span>
              </ShimmerButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete Budget"
        description={`The budget for "${confirmDelete?.category?.name}" will be permanently deleted.`}
        confirmLabel="Delete Budget"
      />
    </DashboardLayout>
  );
}
