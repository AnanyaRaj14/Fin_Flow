'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Target, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { goalsApi } from '@/services/api';
import { formatCurrency, formatDate, formatDateInput, cn } from '@/lib/utils';
import { toast } from '@/components/ui/toast';

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#ec4899','#14b8a6'];

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm();
  const selectedColor = watch('color', '#6366f1');

  useEffect(() => {
    goalsApi.getAll().then(({ data }) => { setGoals(data.goals); setLoading(false); })
      .catch(() => { toast.error('Failed to load goals.'); setLoading(false); });
  }, []);

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', targetAmount: '', savedAmount: '', deadline: '', color: '#6366f1' });
    setOpen(true);
  };

  const openEdit = (g) => {
    setEditing(g);
    reset({
      name: g.name, targetAmount: g.targetAmount, savedAmount: g.savedAmount,
      deadline: g.deadline ? formatDateInput(g.deadline) : '',
      color: g.color,
    });
    setOpen(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing) {
        const { data: res } = await goalsApi.update(editing.id, data);
        setGoals((p) => p.map((g) => g.id === editing.id ? res.goal : g));
        toast.success('Goal updated.');
      } else {
        const { data: res } = await goalsApi.create(data);
        setGoals((p) => [...p, res.goal]);
        toast.success('Goal created.');
      }
      setOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving goal.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await goalsApi.delete(confirmDelete.id);
      setGoals((p) => p.filter((g) => g.id !== confirmDelete.id));
      toast.success('Goal deleted.');
    } catch { toast.error('Failed to delete.'); }
    finally { setConfirmDelete(null); }
  };

  return (
    <DashboardLayout title="Goals">
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-1">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Savings Goals</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{goals.filter((g) => !g.isCompleted).length} active target milestones</p>
          </div>
          <ShimmerButton
            onClick={openCreate}
            className="h-8 px-3.5 text-xs font-medium gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Goal</span>
          </ShimmerButton>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-muted-foreground" /></div>
        ) : goals.length === 0 ? (
          <SpotlightCard className="text-center py-16 text-muted-foreground border-border/70 dark:border-white/[0.08] dark:bg-[#121215]/80">
            <Target className="w-10 h-10 mx-auto mb-3 opacity-25" />
            <p className="text-sm font-medium text-foreground">No goals defined</p>
            <p className="text-xs text-muted-foreground mt-0.5 mb-4">Create a savings milestone to track asset accumulation progress.</p>
            <ShimmerButton
              onClick={openCreate}
              className="h-8 px-4 text-xs font-medium gap-1.5 mx-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Goal</span>
            </ShimmerButton>
          </SpotlightCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal, i) => {
              const pct = goal.targetAmount > 0 ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100) : 0;
              return (
                <motion.div key={goal.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <SpotlightCard
                    radius={300}
                    spotlightColor={`${goal.color || '#6366f1'}20`}
                    className={cn(
                      'p-5 border-border/70 dark:border-white/[0.08] dark:bg-[#121215]/80 relative overflow-hidden',
                      goal.isCompleted && 'border-emerald-500/40 dark:border-emerald-500/30'
                    )}
                  >
                    <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: goal.color }} />
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-xs text-foreground truncate">{goal.name}</p>
                          {goal.isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                        </div>
                        {goal.deadline && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">Target: {formatDate(goal.deadline)}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => openEdit(goal)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => setConfirmDelete(goal)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-baseline text-xs font-mono tabular-nums">
                        <span className="font-bold text-base text-foreground">
                          {formatCurrency(goal.savedAmount)}
                        </span>
                        <span className="text-muted-foreground">of {formatCurrency(goal.targetAmount)}</span>
                      </div>
                      <Progress
                        value={pct}
                        className="h-1.5 rounded-full dark:bg-white/[0.06]"
                        indicatorClassName={goal.isCompleted ? 'bg-emerald-500' : 'bg-foreground dark:bg-white'}
                      />
                      <p className="text-[11px] font-mono tabular-nums text-muted-foreground text-right">{Math.round(pct)}% saved</p>
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
          <DialogHeader><DialogTitle>{editing ? 'Edit Goal' : 'New Savings Goal'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Goal Name</Label>
              <Input placeholder="e.g. Emergency Fund" {...register('name', { required: 'Name is required' })} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Target Amount</Label>
                <Input type="number" step="0.01" min="1" placeholder="5000" {...register('targetAmount', { required: 'Required', min: 1 })} />
              </div>
              <div className="space-y-1.5">
                <Label>Saved So Far</Label>
                <Input type="number" step="0.01" min="0" placeholder="0" {...register('savedAmount')} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Deadline (optional)</Label>
              <Input type="date" {...register('deadline')} />
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setValue('color', c)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${selectedColor === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
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

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete Goal"
        description={`"${confirmDelete?.name}" will be permanently deleted.`}
        confirmLabel="Delete Goal"
      />
    </DashboardLayout>
  );
}
