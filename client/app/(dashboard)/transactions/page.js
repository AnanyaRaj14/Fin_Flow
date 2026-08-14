'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Pencil, Trash2, Loader2, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TransactionForm from '@/components/transactions/TransactionForm';
import { Card, CardContent } from '@/components/ui/card';
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
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Transactions</h2>
            <p className="text-muted-foreground text-sm">{total} total transactions</p>
          </div>
          <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Transaction</Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search transactions..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0 text-muted-foreground">
                  Clear
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger><SelectValue placeholder="All categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={filterAccount} onValueChange={setFilterAccount}>
                <SelectTrigger><SelectValue placeholder="All accounts" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All accounts</SelectItem>
                  {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="text-xs" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction list */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <ArrowLeftRight className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No transactions found</p>
            <p className="text-sm">Try adjusting filters or add a new transaction.</p>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                <AnimatePresence>
                  {transactions.map((tx) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-accent/30 transition-colors group"
                    >
                      <div className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                        tx.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'
                      )}>
                        {tx.type === 'income'
                          ? <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          : <ArrowUpRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                        }
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{tx.title}</p>
                          {tx.receiptUrl && <ImageIcon className="w-3 h-3 text-muted-foreground shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {tx.category?.name} · {tx.account?.name} · {formatDate(tx.date)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge variant={tx.type === 'income' ? 'income' : 'expense'}>
                          {tx.paymentMethod}
                        </Badge>
                        <span className={cn(
                          'text-sm font-semibold w-24 text-right shrink-0',
                          tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                        )}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(tx)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setConfirmDelete(tx)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
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


