'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { budgetsApi, categoriesApi } from '@/services/api';
import { formatCurrency } from '@/lib/utils';
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

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm();
  const selectedCategory = watch('categoryId');

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const { data } = await budgetsApi.getAll({ month, year });
      setBudgets(data.budgets);
    } catch { toast.error('Failed to load budgets.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBudgets(); }, [month, year]);

  useEffect(() => {
    categoriesApi.getAll().then(({ data }) => {
      setCategories(data.categories.filter((c) => c.type === 'expense' || c.type === 'both'));
    });
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

  const handleDelete = async (id) => {
    if (!confirm('Delete this budget?')) return;
    try {
      await budgetsApi.delete(id);
      setBudgets((p) => p.filter((b) => b.id !== id));
      toast.success('Budget deleted.');
    } catch { toast.error('Failed to delete.'); }
  };

  const totalBudgeted = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  return (
    <DashboardLayout title="Budgets">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Budget Planner</h2>
            <p className="text-muted-foreground text-sm">
              {formatCurrency(totalSpent)} spent of {formatCurrency(totalBudgeted)} budgeted
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[year - 1, year, year + 1].map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add</Button>
          </div>
        </div>

        {/* Summary bar */}
        {budgets.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Budget</span>
                <span className="text-sm text-muted-foreground">
                  {totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0}%
                </span>
              </div>
              <Progress
                value={totalBudgeted > 0 ? Math.min((totalSpent / totalBudgeted) * 100, 100) : 0}
                indicatorClassName={totalSpent > totalBudgeted ? 'bg-destructive' : 'bg-primary'}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{formatCurrency(totalSpent)} spent</span>
                <span>{formatCurrency(Math.max(0, totalBudgeted - totalSpent))} remaining</span>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="font-medium">No budgets for {MONTHS[month - 1]} {year}</p>
            <p className="text-sm mb-4">Set category budgets to track your spending.</p>
            <Button onClick={openCreate}><Plus className="w-4 h-4" /> Create Budget</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map((budget, i) => {
              const pct = budget.amount > 0 ? Math.min((budget.spent / budget.amount) * 100, 100) : 0;
              const over = budget.spent > budget.amount;
              return (
                <motion.div key={budget.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className={over ? 'border-destructive/50' : ''}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: budget.category?.color + '20' }}>
                            <div className="w-3 h-3 rounded-full" style={{ background: budget.category?.color }} />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{budget.category?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                            </p>
                          </div>
                          {over && <AlertTriangle className="w-4 h-4 text-destructive" />}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(budget)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(budget.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <Progress
                        value={pct}
                        indicatorClassName={over ? 'bg-destructive' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}
                      />
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-muted-foreground">{Math.round(pct)}% used</span>
                        <span className={over ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                          {over ? `${formatCurrency(budget.spent - budget.amount)} over` : `${formatCurrency(budget.amount - budget.spent)} left`}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
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
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
