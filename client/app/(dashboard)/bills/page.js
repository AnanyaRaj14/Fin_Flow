'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, CheckCircle2, Circle, Loader2, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { billsApi } from '@/services/api';
import { formatCurrency, getDaysUntilDue, cn } from '@/lib/utils';
import { toast } from '@/components/ui/toast';

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6'];

export default function BillsPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm();
  const selectedColor = watch('color', '#6366f1');

  useEffect(() => {
    billsApi.getAll().then(({ data }) => { setBills(data.bills); setLoading(false); })
      .catch(() => { toast.error('Failed to load bills.'); setLoading(false); });
  }, []);

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', amount: '', dueDate: 1, color: '#6366f1', isRecurring: true });
    setOpen(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    reset({ name: b.name, amount: b.amount, dueDate: b.dueDate, color: b.color, isRecurring: b.isRecurring });
    setOpen(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing) {
        const { data: res } = await billsApi.update(editing.id, data);
        setBills((p) => p.map((b) => b.id === editing.id ? res.bill : b));
        toast.success('Bill updated.');
      } else {
        const { data: res } = await billsApi.create(data);
        setBills((p) => [...p, res.bill]);
        toast.success('Bill created.');
      }
      setOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving bill.');
    } finally { setSaving(false); }
  };

  const handleToggle = async (bill) => {
    try {
      const { data } = await billsApi.togglePaid(bill.id);
      setBills((p) => p.map((b) => b.id === bill.id ? data.bill : b));
      toast.success(data.bill.isPaid ? 'Marked as paid.' : 'Marked as unpaid.');
    } catch { toast.error('Failed to update.'); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await billsApi.delete(confirmDelete.id);
      setBills((p) => p.filter((b) => b.id !== confirmDelete.id));
      toast.success('Bill deleted.');
    } catch { toast.error('Failed to delete.'); }
    finally { setConfirmDelete(null); }
  };

  const unpaid = bills.filter((b) => !b.isPaid);
  const paid = bills.filter((b) => b.isPaid);
  const totalDue = unpaid.reduce((s, b) => s + b.amount, 0);

  return (
    <DashboardLayout title="Bills">
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-1">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Bills</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {unpaid.length} upcoming commitments · <span className="font-mono font-medium text-foreground tabular-nums">{formatCurrency(totalDue)}</span> due
            </p>
          </div>
          <ShimmerButton
            onClick={openCreate}
            shimmerColor="#ffffff"
            shimmerSize="0.08em"
            shimmerDuration="3.5s"
            borderRadius="10px"
            className="h-8 px-4 text-xs font-medium gap-1.5 dark:bg-zinc-900"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Bill</span>
          </ShimmerButton>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-muted-foreground" /></div>
        ) : bills.length === 0 ? (
          <SpotlightCard className="text-center py-16 text-muted-foreground border-border/70 dark:border-white/[0.08] dark:bg-[#121215]/80">
            <Receipt className="w-10 h-10 mx-auto mb-3 opacity-25" />
            <p className="text-sm font-medium text-foreground">No recurring bills scheduled</p>
            <p className="text-xs text-muted-foreground mt-0.5 mb-4">Track rent, utilities, and subscription due dates automatically.</p>
            <ShimmerButton
              onClick={openCreate}
              shimmerColor="#ffffff"
              shimmerSize="0.08em"
              shimmerDuration="3.5s"
              borderRadius="10px"
              className="h-8 px-4 text-xs font-medium gap-1.5 dark:bg-zinc-900 mx-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Bill</span>
            </ShimmerButton>
          </SpotlightCard>
        ) : (
          <div className="space-y-4">
            {unpaid.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Unpaid ({unpaid.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {unpaid.map((bill, i) => (
                    <BillCard key={bill.id} bill={bill} index={i} onToggle={handleToggle} onEdit={openEdit} onDelete={(b) => setConfirmDelete(b)} />
                  ))}
                </div>
              </div>
            )}
            {paid.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Paid ({paid.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {paid.map((bill, i) => (
                    <BillCard key={bill.id} bill={bill} index={i} onToggle={handleToggle} onEdit={openEdit} onDelete={(b) => setConfirmDelete(b)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Bill' : 'Add Bill'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Bill Name</Label>
              <Input placeholder="e.g. Netflix" {...register('name', { required: 'Name is required' })} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Amount</Label>
                <Input type="number" step="0.01" min="0.01" placeholder="0.00" {...register('amount', { required: 'Required', min: 0.01 })} />
              </div>
              <div className="space-y-1.5">
                <Label>Due Day (1-31)</Label>
                <Input type="number" min="1" max="31" placeholder="15" {...register('dueDate', { required: 'Required', min: 1, max: 31 })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex gap-2">
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
        title="Delete Bill"
        description={`"${confirmDelete?.name}" will be permanently deleted.`}
        confirmLabel="Delete Bill"
      />
    </DashboardLayout>
  );
}

function BillCard({ bill, index, onToggle, onEdit, onDelete }) {
  const daysLeft = getDaysUntilDue(bill.dueDate);
  const urgent = !bill.isPaid && daysLeft <= 3;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <SpotlightCard
        radius={280}
        spotlightColor={`${bill.color || '#6366f1'}20`}
        className={cn(
          'p-4 border-border/70 dark:border-white/[0.08] dark:bg-[#121215]/80',
          bill.isPaid && 'opacity-60',
          urgent && 'border-amber-500/40 dark:border-amber-500/30'
        )}
      >
        <div className="flex items-center gap-3">
          <button onClick={() => onToggle(bill)} className="shrink-0 cursor-pointer">
            {bill.isPaid
              ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              : <Circle className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
            }
          </button>
          <div className="w-1 h-8 rounded-full shrink-0" style={{ background: bill.color }} />
          <div className="flex-1 min-w-0">
            <p className={cn('font-semibold text-xs text-foreground truncate', bill.isPaid && 'line-through text-muted-foreground')}>{bill.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {bill.isPaid ? 'Settled' : `Due on day ${bill.dueDate} · ${daysLeft}d left`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="font-semibold text-xs font-mono tabular-nums text-foreground">{formatCurrency(bill.amount)}</p>
              {urgent && <Badge variant="warning" className="text-[10px] px-1.5 py-0">Due soon</Badge>}
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => onEdit(bill)}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => onDelete(bill)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}
