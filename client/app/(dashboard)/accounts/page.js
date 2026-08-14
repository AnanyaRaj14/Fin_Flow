'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Wallet, CreditCard, Banknote, Building2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { accountsApi } from '@/services/api';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/toast';

const ACCOUNT_TYPES = [
  { value: 'bank',   label: 'Bank Account', icon: Building2 },
  { value: 'cash',   label: 'Cash',         icon: Banknote },
  { value: 'wallet', label: 'Wallet',       icon: Wallet },
  { value: 'credit', label: 'Credit Card',  icon: CreditCard },
];

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#ec4899','#14b8a6'];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // holds account to delete

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    defaultValues: { name: '', type: 'bank', balance: '', color: '#6366f1' },
  });

  const selectedColor = watch('color');
  const selectedType = watch('type');

  const fetchAccounts = async () => {
    try {
      const { data } = await accountsApi.getAll();
      setAccounts(data.accounts);
    } catch { toast.error('Failed to load accounts.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', type: 'bank', balance: '', color: '#6366f1' });
    setOpen(true);
  };

  const openEdit = (account) => {
    setEditing(account);
    reset({ name: account.name, type: account.type, balance: account.balance, color: account.color });
    setOpen(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing) {
        const { data: res } = await accountsApi.update(editing.id, data);
        setAccounts((prev) => prev.map((a) => (a.id === editing.id ? res.account : a)));
        toast.success('Account updated.');
      } else {
        const { data: res } = await accountsApi.create(data);
        setAccounts((prev) => [...prev, res.account]);
        toast.success('Account created.');
      }
      setOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving account.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await accountsApi.delete(confirmDelete.id);
      setAccounts((prev) => prev.filter((a) => a.id !== confirmDelete.id));
      toast.success('Account deleted.');
    } catch { toast.error('Failed to delete.'); }
    finally { setConfirmDelete(null); }
  };

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <DashboardLayout title="Accounts">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Accounts</h2>
            <p className="text-muted-foreground text-sm">
              Total balance: <span className="font-semibold text-foreground">{formatCurrency(totalBalance)}</span>
            </p>
          </div>
          <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Account</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Wallet className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No accounts yet</p>
            <p className="text-sm">Add your first account to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {accounts.map((account, i) => {
              const typeInfo = ACCOUNT_TYPES.find((t) => t.value === account.type);
              const Icon = typeInfo?.icon || Wallet;
              return (
                <motion.div key={account.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
                    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: account.color }} />
                    <CardContent className="p-5 pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: account.color + '20' }}>
                          <Icon className="w-5 h-5" style={{ color: account.color }} />
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(account)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setConfirmDelete(account)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <p className="font-semibold">{account.name}</p>
                      <p className="text-xs text-muted-foreground mb-2">{typeInfo?.label}</p>
                      <p className="text-2xl font-bold" style={{ color: account.color }}>{formatCurrency(account.balance)}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Account' : 'Add Account'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Account Name</Label>
              <Input placeholder="e.g. Main Checking" {...register('name', { required: 'Name is required' })} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={selectedType} onValueChange={(v) => setValue('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {!editing && (
              <div className="space-y-1.5">
                <Label>Opening Balance</Label>
                <Input type="number" step="0.01" placeholder="0.00" {...register('balance')} />
              </div>
            )}
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
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete Account"
        description={`"${confirmDelete?.name}" and all its transactions will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete Account"
      />
    </DashboardLayout>
  );
}
