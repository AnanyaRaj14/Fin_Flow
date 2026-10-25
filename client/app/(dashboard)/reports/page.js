'use client';

import { useState } from 'react';
import { Download, FileText, Table, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { dashboardApi } from '@/services/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function ReportsPage() {
  const now = new Date();
  const [reportType, setReportType] = useState('monthly');
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const generateReport = async () => {
    setLoading(true);
    try {
      const params = { type: reportType, year };
      if (reportType === 'monthly') params.month = month;
      const { data } = await dashboardApi.getReport(params);
      setReportData(data);
    } catch {
      toast.error('Failed to generate report.');
    } finally { setLoading(false); }
  };

  const downloadCSV = () => {
    if (!reportData) return;
    const headers = ['Date','Title','Type','Category','Account','Amount','Payment Method','Notes'];
    const rows = reportData.transactions.map((t) => [
      formatDate(t.date), t.title, t.type, t.category?.name, t.account?.name,
      t.amount, t.paymentMethod, t.notes || '',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finflow-${reportType}-${year}${reportType === 'monthly' ? `-${month}` : ''}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded.');
  };

  const downloadPDF = async () => {
    if (!reportData) return;
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const title = reportType === 'monthly'
      ? `FinFlow Report — ${MONTHS[month - 1]} ${year}`
      : `FinFlow Report — ${year}`;

    doc.setFontSize(18);
    doc.setTextColor(99, 102, 241);
    doc.text('FinFlow', 14, 20);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(title, 14, 30);

    // Summary
    doc.setFontSize(10);
    doc.text(`Income: ${formatCurrency(reportData.summary.income)}`, 14, 42);
    doc.text(`Expenses: ${formatCurrency(reportData.summary.expenses)}`, 80, 42);
    doc.text(`Savings: ${formatCurrency(reportData.summary.savings)}`, 150, 42);

    autoTable(doc, {
      startY: 52,
      head: [['Date', 'Title', 'Type', 'Category', 'Amount']],
      body: reportData.transactions.map((t) => [
        formatDate(t.date), t.title, t.type, t.category?.name, formatCurrency(t.amount),
      ]),
      headStyles: { fillColor: [99, 102, 241] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: { fontSize: 9 },
    });

    doc.save(`finflow-${reportType}-${year}${reportType === 'monthly' ? `-${month}` : ''}.pdf`);
    toast.success('PDF downloaded.');
  };

  return (
    <DashboardLayout title="Reports">
      <div className="space-y-6">
        <div className="pb-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Audit & Exports</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Generate formal ledger statements and export structured CSV/PDF reports.</p>
        </div>

        <SpotlightCard radius={400} className="p-5 border-border/70 dark:border-white/[0.08] dark:bg-[#121215]/80 space-y-4">
          <div className="pb-3 border-b border-border/40 dark:border-white/[0.05]">
            <h3 className="text-sm font-semibold tracking-tight text-foreground">Statement Parameters</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Specify accounting cycle and reporting interval</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="h-8 text-xs dark:bg-white/[0.03] dark:border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {reportType === 'monthly' && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Month</Label>
                <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                  <SelectTrigger className="h-8 text-xs dark:bg-white/[0.03] dark:border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Year</Label>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger className="h-8 text-xs dark:bg-white/[0.03] dark:border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026, 2027].map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ShimmerButton
            onClick={generateReport}
            disabled={loading}
            shimmerColor="#ffffff"
            shimmerSize="0.08em"
            shimmerDuration="3.5s"
            borderRadius="10px"
            className="h-8 px-4 text-xs font-medium gap-1.5 dark:bg-zinc-900"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Compile Statement</span>
          </ShimmerButton>
        </SpotlightCard>

        {reportData && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <SpotlightCard radius={280} spotlightColor="rgba(16, 185, 129, 0.15)" className="p-4 text-center border-border/70 dark:border-white/[0.08] dark:bg-[#121215]/80">
                <p className="text-[11px] font-medium tracking-wider uppercase text-muted-foreground">Inflow</p>
                <p className="text-xl font-bold font-mono tabular-nums mt-1 text-emerald-500">{formatCurrency(reportData.summary.income)}</p>
              </SpotlightCard>
              <SpotlightCard radius={280} spotlightColor="rgba(244, 63, 94, 0.15)" className="p-4 text-center border-border/70 dark:border-white/[0.08] dark:bg-[#121215]/80">
                <p className="text-[11px] font-medium tracking-wider uppercase text-muted-foreground">Outflow</p>
                <p className="text-xl font-bold font-mono tabular-nums mt-1 text-rose-500">{formatCurrency(reportData.summary.expenses)}</p>
              </SpotlightCard>
              <SpotlightCard radius={280} spotlightColor="rgba(99, 102, 241, 0.18)" className="p-4 text-center border-border/70 dark:border-white/[0.08] dark:bg-[#121215]/80">
                <p className="text-[11px] font-medium tracking-wider uppercase text-muted-foreground">Net Retained</p>
                <p className="text-xl font-bold font-mono tabular-nums mt-1 text-foreground">{formatCurrency(reportData.summary.savings)}</p>
              </SpotlightCard>
            </div>

            {/* Download buttons */}
            <div className="flex gap-2.5">
              <Button onClick={downloadPDF} variant="outline" size="sm" className="h-8 text-xs font-medium gap-1.5 dark:bg-white/[0.02]">
                <FileText className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </Button>
              <Button onClick={downloadCSV} variant="outline" size="sm" className="h-8 text-xs font-medium gap-1.5 dark:bg-white/[0.02]">
                <Table className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </Button>
            </div>

            {/* Transaction preview */}
            <SpotlightCard radius={400} className="p-0 border-border/70 dark:border-white/[0.08] dark:bg-[#121215]/80 overflow-hidden">
              <div className="p-4 border-b border-border/40 dark:border-white/[0.05] flex items-center justify-between">
                <h3 className="text-xs font-semibold tracking-tight text-foreground">Transaction Audit Log</h3>
                <span className="text-[10px] font-mono text-muted-foreground">{reportData.transactions.length} rows</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/40 dark:border-white/[0.05] bg-muted/20">
                      {['Date','Title','Type','Category','Amount'].map((h) => (
                        <th key={h} className="text-left px-4 py-2 font-medium text-[11px] uppercase tracking-wider text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 dark:divide-white/[0.04]">
                    {reportData.transactions.slice(0, 50).map((tx) => (
                      <tr key={tx.id} className="hover:bg-accent/30 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-2.5 font-mono text-muted-foreground">{formatDate(tx.date)}</td>
                        <td className="px-4 py-2.5 font-medium text-foreground">{tx.title}</td>
                        <td className="px-4 py-2.5">
                          <span className={cn('capitalize text-[10px] font-mono font-medium', tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500')}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">{tx.category?.name || 'General'}</td>
                        <td className={cn('px-4 py-2.5 font-mono font-semibold tabular-nums', tx.type === 'income' ? 'text-emerald-500' : 'text-foreground')}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reportData.transactions.length > 50 && (
                  <p className="text-center text-[11px] text-muted-foreground py-3 border-t border-border/40 dark:border-white/[0.04]">
                    Displaying 50 of {reportData.transactions.length} ledger entries. Export full statement above.
                  </p>
                )}
              </div>
            </SpotlightCard>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
