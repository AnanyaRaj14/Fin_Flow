'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, CheckCircle2, Circle, Loader2, Receipt, FileText } from 'lucide-react';
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
import { formatCurrency, formatPdfCurrency, getDaysUntilDue, cn } from '@/lib/utils';
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

  const [exporting, setExporting] = useState(false);

  const downloadPDF = async () => {
    if (bills.length === 0) {
      toast.error('No bills available to export.');
      return;
    }
    setExporting(true);
    try {
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
      doc.text('RECURRING BILLS STATEMENT', 196, 18, { align: 'right' });

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
      doc.text(`Generated: ${nowStr}`, 196, 23, { align: 'right' });

      // Divider line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(14, 27, 196, 27);

      // Summary KPI Stat Cards
      // Box 1: Total Commitments
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 31, 57, 15, 1.5, 1.5, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('TOTAL COMMITMENTS', 18, 36);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${bills.length} Scheduled`, 18, 42.5);

      // Box 2: Outstanding Due
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(75, 31, 57, 15, 1.5, 1.5, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('OUTSTANDING DUE', 79, 36);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(225, 29, 72);
      doc.text(formatPdfCurrency(totalDue), 79, 42.5);

      // Box 3: Fulfillment Status
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(136, 31, 60, 15, 1.5, 1.5, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('FULFILLMENT STATUS', 140, 36);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${unpaid.length} Due  ·  ${paid.length} Paid`, 140, 42.5);

      // Data Table
      autoTable(doc, {
        startY: 50,
        head: [['Bill Name', 'Category', 'Due Day', 'Frequency', 'Status', 'Amount']],
        body: bills.map((b) => [
          b.name,
          b.category || 'General',
          `Day ${b.dueDate}`,
          b.isRecurring ? 'Monthly' : 'One-time',
          b.isPaid ? 'PAID' : 'DUE / UNPAID',
          formatPdfCurrency(b.amount),
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
          0: { cellWidth: 50 },
          1: { cellWidth: 32 },
          2: { cellWidth: 20 },
          3: { cellWidth: 24 },
          4: { cellWidth: 26 },
          5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
        },
        didDrawPage: (data) => {
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height || pageSize.getHeight();
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(148, 163, 184);
          doc.text(
            'FinFlow Financial Platform • Official Commitments Statement',
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

      doc.save(`finflow-bills-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Bills PDF statement downloaded.');
    } catch {
      toast.error('Failed to export PDF.');
    } finally {
      setExporting(false);
    }
  };

  const unpaid = bills.filter((b) => !b.isPaid);
  const paid = bills.filter((b) => b.isPaid);
  const totalDue = unpaid.reduce((s, b) => s + b.amount, 0);

  return (
    <DashboardLayout title="Bills">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between pb-3 border-b border-border/40 dark:border-white/[0.04]">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Bills</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {unpaid.length} upcoming commitments · <span className="font-mono font-medium text-foreground tabular-nums">{formatCurrency(totalDue)}</span> due
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadPDF}
              disabled={exporting || bills.length === 0}
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
              <span>Add Bill</span>
            </ShimmerButton>
          </div>
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
              className="h-8 px-4 text-xs font-medium gap-1.5 mx-auto"
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
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setOpen(false)}>Cancel</Button>
              <ShimmerButton type="submit" className="flex-1 h-9 rounded-xl font-medium" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{editing ? 'Update Bill' : 'Create Bill'}</span>
              </ShimmerButton>
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
