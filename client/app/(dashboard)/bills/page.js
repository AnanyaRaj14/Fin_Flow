'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, CheckCircle2, Circle, Loader2, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { billsApi } from '@/services/api';
import { formatCurrency, getDaysUntilDue } from '@/lib/utils';
import { toast } from '@/components/ui/toast';

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6'];

export default function BillsPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

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

  const handleDelete = async (id) => {
    if (!confirm('Delete this bill?')) return;
    try {
      await billsApi.delete(id);
      setBills((p) => p.filter((b) => b.id !== id));
      toast.success('Bill deleted.');
    } catch { toast.error('Failed to delete.'); }
  };

  const unpaid = bills.filter((b) => !b.isPaid);
  const paid = bills.filter((b) => b.isPaid);
  const totalDue = unpaid.reduce((s, b) => s + b.amount, 0);

  return (
    <DashboardLayout title="Bills">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Bills</h2>
            <p className="text-muted-foreground text-sm">
              {unpaid.length} unpaid · {formatCurrency(totalDue)} due
            </p>
          </div>
          <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Bill</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : bills.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No bills yet</p>
            <p className="text-sm mb-4">Track your recurring bills here.</p>
            <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Bill</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {unpaid.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Unpaid ({unpaid.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {unpaid.map((bill, i) => (
                    <BillCard key={bill.id} bill={bill} index={i} onToggle={handleToggle} onEdit={openEdit} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            )}
            {paid.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Paid ({paid.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {paid.map((bill, i) => (
                    <BillCard key={bill.id} bill={bill} index={i} onToggle={handleToggle} onEdit={openEdit} onDelete={handleDelete} />
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
    </DashboardLayout>
  );
}

function BillCard({ bill, index, onToggle, onEdit, onDelete }) {
  const daysLeft = getDaysUntilDue(bill.dueDate);
  const urgent = !bill.isPaid && daysLeft <= 3;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Card className={`${bill.isPaid ? 'opacity-60' : ''} ${urgent ? 'border-amber-400 dark:border-amber-600' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <button onClick={() => onToggle(bill)} className="shrink-0">
              {bill.isPaid
                ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                : <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
              }
            </button>
            <div className="w-1 h-10 rounded-full shrink-0" style={{ background: bill.color }} />
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-sm ${bill.isPaid ? 'line-through text-muted-foreground' : ''}`}>{bill.name}</p>
              <p className="text-xs text-muted-foreground">
                {bill.isPaid ? 'Paid' : `Due on day ${bill.dueDate} · ${daysLeft}d left`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="font-semibold text-sm">{formatCurrency(bill.amount)}</p>
                {urgent && <Badge variant="warning" className="text-xs">Due soon</Badge>}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(bill)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(bill.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
