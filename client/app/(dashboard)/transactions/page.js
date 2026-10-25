'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Pencil, Trash2, Loader2, ImageIcon, FileText } from 'lucide-react';
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
import { formatCurrency, formatPdfCurrency, formatDate } from '@/lib/utils';
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

  const fetchItemsForExport = async () => {
    try {
      const params = { page: 1, limit: 1000 };
      if (search) params.search = search;
      if (filterCategory) params.categoryId = filterCategory;
      if (filterAccount) params.accountId = filterAccount;
      if (filterType) params.type = filterType;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const { data } = await transactionsApi.getAll(params);
      return data.transactions && data.transactions.length > 0 ? data.transactions : transactions;
    } catch {
      return transactions;
    }
  };

  const [exporting, setExporting] = useState(false);

  const downloadPDF = async () => {
    if (transactions.length === 0) {
      toast.error('No transactions available to export.');
      return;
    }
    setExporting(true);
    try {
      const items = await fetchItemsForExport();
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // Brand Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42);
      doc.text('FinFlow', 14, 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('FINANCIAL INTELLIGENCE PLATFORM', 14, 23);

      // Statement Type & Timestamp (Right aligned)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(30, 41, 59);
      doc.text('TRANSACTIONS AUDIT STATEMENT', 196, 18, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      const nowStr = new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      doc.text(`Generated: ${nowStr} • ${items.length} records`, 196, 23, { align: 'right' });

      // Divider line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(14, 27, 196, 27);

      const totalInflow = items.filter((t) => t.type === 'income').reduce((s, t) => s + (Number(t.amount) || 0), 0);
      const totalOutflow = items.filter((t) => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0);
      const netCash = totalInflow - totalOutflow;

      // Summary KPI Stat Cards
      // Box 1: Inflow
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 31, 57, 15, 1.5, 1.5, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('TOTAL INFLOW', 18, 36);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.text(`+${formatPdfCurrency(totalInflow)}`, 18, 42.5);

      // Box 2: Outflow
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(75, 31, 57, 15, 1.5, 1.5, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('TOTAL OUTFLOW', 79, 36);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(225, 29, 72); // rose-600
      doc.text(`-${formatPdfCurrency(totalOutflow)}`, 79, 42.5);

      // Box 3: Net Balance
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(136, 31, 60, 15, 1.5, 1.5, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('NET CASH FLOW', 140, 36);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(netCash >= 0 ? 15 : 225, netCash >= 0 ? 23 : 29, netCash >= 0 ? 42 : 72);
      doc.text(`${netCash >= 0 ? '+' : ''}${formatPdfCurrency(netCash)}`, 140, 42.5);

      // Data Table
      autoTable(doc, {
        startY: 50,
        head: [['Date', 'Title', 'Type', 'Category', 'Account', 'Amount']],
        body: items.map((t) => [
          formatDate(t.date),
          t.title,
          (t.type || '').toUpperCase(),
          t.category?.name || '—',
          t.account?.name || '—',
          (t.type === 'expense' ? '-' : t.type === 'income' ? '+' : '') + formatPdfCurrency(t.amount),
        ]),
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
          cellPadding: 3,
        },
        bodyStyles: {
          textColor: [30, 41, 59],
          fontSize: 8,
          cellPadding: 2.8,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 26 },
          1: { cellWidth: 50 },
          2: { cellWidth: 20 },
          3: { cellWidth: 28 },
          4: { cellWidth: 26 },
          5: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
        },
        didDrawPage: (data) => {
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height || pageSize.getHeight();
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(148, 163, 184);
          doc.text(
            'FinFlow Financial Platform • Official Ledger Audit Statement',
            14,
            pageHeight - 8
          );
          doc.text(
            `Page ${doc.internal.getNumberOfPages()}`,
            196,
            pageHeight - 8,
            { align: 'right' }
          );
        },
      });

      doc.save(`finflow-transactions-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Transactions PDF statement downloaded.');
    } catch {
      toast.error('Failed to export PDF.');
    } finally {
      setExporting(false);
    }
  };

  const hasFilters = search || filterCategory || filterAccount || filterType || startDate || endDate;

  return (
    <DashboardLayout title="Transactions">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between pb-3 border-b border-border/40 dark:border-white/[0.04]">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Transactions</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{total} recorded ledger entries</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadPDF}
              disabled={exporting || transactions.length === 0}
              className="h-8 px-3 text-xs font-medium gap-1.5 rounded-lg border-border/70 dark:border-white/10 hover:bg-muted/50"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5 text-muted-foreground" />}
              <span>Export PDF</span>
            </Button>
            <ShimmerButton
              onClick={openCreate}
              className="h-8 px-3.5 text-xs font-medium gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Transaction</span>
            </ShimmerButton>
          </div>
        </div>

        {/* Filters */}
        <SpotlightCard className="p-4 border-border/70 dark:border-white/[0.08] dark:bg-[#121215]/80 space-y-3.5">
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
          <div className={cn("mt-3 grid gap-2", accounts.length > 1 ? "grid-cols-1 xs:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 xs:grid-cols-2 lg:grid-cols-3")}>
            <Select value={filterType || 'all'} onValueChange={(v) => setFilterType(v === 'all' ? '' : v)}>
              <SelectTrigger className="h-8 text-xs dark:bg-white/[0.03] dark:border-white/10"><SelectValue placeholder="All types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory || 'all'} onValueChange={(v) => setFilterCategory(v === 'all' ? '' : v)}>
              <SelectTrigger className="h-8 text-xs dark:bg-white/[0.03] dark:border-white/10"><SelectValue placeholder="All categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>

            {accounts.length > 1 && (
              <Select value={filterAccount || 'all'} onValueChange={(v) => setFilterAccount(v === 'all' ? '' : v)}>
                <SelectTrigger className="h-8 text-xs dark:bg-white/[0.03] dark:border-white/10"><SelectValue placeholder="All accounts" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All accounts</SelectItem>
                  {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}

            <div className="flex gap-2">
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-8 text-xs dark:bg-white/[0.03] dark:border-white/10 w-full" />
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
                    className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 hover:bg-accent/30 dark:hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border bg-muted/40 dark:bg-white/[0.04] border-border/40 dark:border-white/[0.06] text-muted-foreground group-hover:text-foreground transition-all">
                      {tx.type === 'income'
                        ? <ArrowDownLeft className="w-4 h-4 text-indigo-400" />
                        : <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-foreground truncate">{tx.title}</p>
                        {tx.receiptUrl && <ImageIcon className="w-3 h-3 text-muted-foreground shrink-0" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {tx.category?.name || 'General'} · {formatDate(tx.date)}
                        <span className="sm:hidden"> · {tx.account?.name || tx.paymentMethod || 'Manual'}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <span className="hidden sm:inline-flex text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-accent dark:bg-white/[0.04] border border-border/40 dark:border-white/[0.06] text-muted-foreground">
                        {tx.account?.name || tx.paymentMethod || 'Manual'}
                      </span>
                      <span className={cn(
                        'text-xs font-mono font-medium tabular-nums text-right shrink-0',
                        tx.type === 'income' ? 'text-indigo-400' : 'text-foreground'
                      )}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                      <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => openEdit(tx)} title="Edit transaction">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => setConfirmDelete(tx)} title="Delete transaction">
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


