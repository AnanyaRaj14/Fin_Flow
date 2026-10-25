'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Pencil, Trash2, Loader2, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TransactionForm from '@/components/transactions/TransactionForm';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { transactionsApi, categoriesApi, accountsApi } from '@/services/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/toast';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // Filters
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [filterType, setFilterType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Dialog
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (filterCategory) params.categoryId = filterCategory;
      if (filterAccount) params.accountId = filterAccount;
      if (filterType) params.type = filterType;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const { data } = await transactionsApi.getAll(params);
      setTransactions(data.transactions);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Failed to load transactions.'); }
    finally { setLoading(false); }
  }, [page, search, filterCategory, filterAccount, filterType, startDate, endDate]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  useEffect(() => {
    Promise.all([categoriesApi.getAll(), accountsApi.getAll()]).then(([c, a]) => {
      setCategories(c.data.categories);
      setAccounts(a.data.accounts);
    });
  }, []);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [search, filterCategory, filterAccount, filterType, startDate, endDate]);

  const openCreate = () => { setEditing(null); setOpen(true); };
  const openEdit = (tx) => { setEditing(tx); setOpen(true); };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editing) {
        const { data } = await transactionsApi.update(editing.id, formData);
        setTransactions((p) => p.map((t) => (t.id === editing.id ? data.transaction : t)));
        toast.success('Transaction updated.');
      } else {
        await transactionsApi.create(formData);
        toast.success('Transaction added.');
        fetchTransactions();
      }
      setOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving transaction.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await transactionsApi.delete(confirmDelete.id);
      setTransactions((p) => p.filter((t) => t.id !== confirmDelete.id));
      toast.success('Transaction deleted.');
    } catch { toast.error('Failed to delete.'); }
    finally { setConfirmDelete(null); }
  };

  const clearFilters = () => {
    setSearch(''); setFilterCategory(''); setFilterAccount('');
    setFilterType(''); setStartDate(''); setEndDate('');
  };

  const hasFilters = search || filterCategory || filterAccount || filterType || startDate || endDate;

  return (
    <DashboardLayout title="Transactions">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pb-1">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Transactions</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{total} recorded ledger entries</p>
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
            <span>Add Transaction</span>
          </ShimmerButton>
        </div>

        {/* Filters */}
        <SpotlightCard radius={350} className="p-4 border-border/70 dark:border-white/[0.08] dark:bg-[#121215]/80 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Search ledger by title..." className="pl-9 h-9 text-xs dark:bg-white/[0.03] dark:border-white/10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0 text-xs text-muted-foreground hover:text-foreground">
                Clear filters
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-8 text-xs dark:bg-white/[0.03] dark:border-white/10"><SelectValue placeholder="All types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="h-8 text-xs dark:bg-white/[0.03] dark:border-white/10"><SelectValue placeholder="All categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filterAccount} onValueChange={setFilterAccount}>
              <SelectTrigger className="h-8 text-xs dark:bg-white/[0.03] dark:border-white/10"><SelectValue placeholder="All accounts" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All accounts</SelectItem>
                {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-8 text-xs dark:bg-white/[0.03] dark:border-white/10" />
            </div>
          </div>
        </SpotlightCard>

        {/* Transaction list */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-muted-foreground" /></div>
        ) : transactions.length === 0 ? (
          <SpotlightCard className="text-center py-16 text-muted-foreground border-border/70 dark:border-white/[0.08] dark:bg-[#121215]/80">
            <ArrowLeftRight className="w-10 h-10 mx-auto mb-3 opacity-25" />
            <p className="text-sm font-medium text-foreground">No transactions found</p>
            <p className="text-xs text-muted-foreground mt-0.5">Try adjusting filters or record a new transaction.</p>
          </SpotlightCard>
        ) : (
          <SpotlightCard radius={450} className="p-0 border-border/70 dark:border-white/[0.08] dark:bg-[#121215]/80 overflow-hidden">
            <div className="divide-y divide-border/40 dark:divide-white/[0.04]">
              <AnimatePresence>
                {transactions.map((tx) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-accent/30 dark:hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border',
                      tx.type === 'income'
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    )}>
                      {tx.type === 'income'
                        ? <ArrowDownLeft className="w-4 h-4" />
                        : <ArrowUpRight className="w-4 h-4" />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-foreground truncate">{tx.title}</p>
                        {tx.receiptUrl && <ImageIcon className="w-3 h-3 text-muted-foreground shrink-0" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {tx.category?.name || 'General'} · {tx.account?.name || 'Cash'} · {formatDate(tx.date)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-accent dark:bg-white/[0.04] border border-border/40 dark:border-white/[0.06] text-muted-foreground">
                        {tx.paymentMethod || 'Manual'}
                      </span>
                      <span className={cn(
                        'text-xs font-mono font-medium tabular-nums w-24 text-right shrink-0',
                        tx.type === 'income' ? 'text-emerald-500' : 'text-foreground'
                      )}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => openEdit(tx)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => setConfirmDelete(tx)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </SpotlightCard>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
            <span className="text-sm text-muted-foreground">Page {page} of {pages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>Next</Button>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
          </DialogHeader>
          <TransactionForm onSubmit={handleSave} defaultValues={editing} saving={saving} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        description={`"${confirmDelete?.title}" will be permanently deleted and the account balance will be reversed.`}
        confirmLabel="Delete Transaction"
      />
    </DashboardLayout>
  );
}


