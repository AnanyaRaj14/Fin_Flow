'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Wallet, CreditCard, Banknote, Building2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { ShimmerButton } from '@/components/ui/shimmer-button';
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
      const payload = {
        ...data,
        balance: data.balance !== '' && data.balance !== undefined ? parseFloat(data.balance) : 0,
      };
      if (editing) {
        const { data: res } = await accountsApi.update(editing.id, payload);
        setAccounts((prev) => prev.map((a) => (a.id === editing.id ? res.account : a)));
        toast.success('Account updated.');
      } else {
        const { data: res } = await accountsApi.create(payload);
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40 dark:border-white/[0.04]">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Accounts</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">Total Liquid Portfolio</span>
              <span className="text-xs text-muted-foreground/60">·</span>
              <span className="text-xs font-semibold font-mono tracking-tight text-foreground">
                {formatCurrency(totalBalance)}
              </span>
            </div>
          </div>
          <ShimmerButton
            onClick={openCreate}
            className="h-8 px-3.5 text-xs font-medium gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Account</span>
          </ShimmerButton>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-muted-foreground" /></div>
        ) : accounts.length === 0 ? (
          <SpotlightCard className="text-center py-16 text-muted-foreground border-border/70 dark:border-white/[0.08] dark:bg-[#121215]/80">
            <Wallet className="w-10 h-10 mx-auto mb-3 opacity-25" />
            <p className="text-sm font-medium text-foreground">No accounts configured</p>
            <p className="text-xs text-muted-foreground mt-0.5">Connect your first bank, card, or cash wallet to start tracking.</p>
          </SpotlightCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {accounts.map((account, i) => {
              const typeInfo = ACCOUNT_TYPES.find((t) => t.value === account.type);
              const Icon = typeInfo?.icon || Wallet;
              return (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <SpotlightCard
                    radius={320}
                    spotlightColor={`${account.color || '#6366f1'}22`}
                    className="group p-5 border-border/60 dark:border-white/[0.07] dark:bg-[#121215]/80 hover:border-border dark:hover:border-white/[0.14] transition-all duration-300 relative rounded-2xl shadow-xs hover:shadow-lg"
                  >
                    {/* Top Row: Icon Pill & Subtle Hover Actions */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-9 h-9 rounded-xl bg-accent/40 dark:bg-white/[0.03] border border-border/50 dark:border-white/[0.06] flex items-center justify-center text-foreground transition-colors group-hover:border-foreground/20">
                        <Icon className="w-4 h-4 text-foreground/80 group-hover:text-foreground transition-colors" />
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/60"
                          onClick={() => openEdit(account)}
                          title="Edit account"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setConfirmDelete(account)}
                          title="Delete account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Account Info */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: account.color || '#6366f1' }}
                        />
                        <p className="text-[11px] font-medium text-muted-foreground capitalize">
                          {typeInfo?.label || 'Account'}
                        </p>
                      </div>
                      <p className="font-semibold text-sm text-foreground tracking-tight truncate">
                        {account.name}
                      </p>
                    </div>

                    {/* Balance */}
                    <div className="mt-4 pt-3 border-t border-border/30 dark:border-white/[0.04]">
                      <p className="text-xl sm:text-2xl font-semibold font-mono tabular-nums tracking-tight text-foreground">
                        {formatCurrency(account.balance)}
                      </p>
                    </div>
                  </SpotlightCard>
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
            <div className="space-y-1.5">
              <Label>{editing ? 'Account Balance' : 'Opening Balance'}</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('balance', { required: 'Balance is required' })}
              />
              {errors.balance && <p className="text-xs text-destructive">{errors.balance.message}</p>}
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
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setOpen(false)}>Cancel</Button>
              <ShimmerButton type="submit" className="flex-1 h-9 rounded-xl font-medium" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{editing ? 'Update Account' : 'Create Account'}</span>
              </ShimmerButton>
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
