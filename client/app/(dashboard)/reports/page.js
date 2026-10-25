'use client';

import { useState } from 'react';
import { FileText, Table, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { dashboardApi } from '@/services/api';
import { formatCurrency, formatDate, cn, formatPdfCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function ReportsPage() {
  const now = new Date();
  const [reportType, setReportType] = useState('monthly');
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
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

  const downloadPDF = async () => {
    if (!reportData || !reportData.transactions || reportData.transactions.length === 0) {
      toast.error('No report data available to export.');
      return;
    }
    setExporting(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const periodTitle = reportType === 'monthly'
        ? `${MONTHS[month - 1].toUpperCase()} ${year} AUDIT STATEMENT`
        : `ANNUAL ${year} AUDIT STATEMENT`;

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
      doc.text(periodTitle, 196, 18, { align: 'right' });

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
      doc.text(`Generated: ${nowStr} • ${reportData.transactions.length} records`, 196, 23, { align: 'right' });

      // Divider line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(14, 27, 196, 27);

      // Summary KPI Stat Cards
      // Box 1: Inflow
      const inflow = reportData.summary?.income || 0;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 31, 57, 15, 1.5, 1.5, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('TOTAL INFLOW', 18, 36);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(16, 185, 129);
      doc.text(`+${formatPdfCurrency(inflow)}`, 18, 42.5);

      // Box 2: Outflow
      const outflow = reportData.summary?.expenses || 0;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(75, 31, 57, 15, 1.5, 1.5, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('TOTAL OUTFLOW', 79, 36);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(225, 29, 72);
      doc.text(`-${formatPdfCurrency(outflow)}`, 79, 42.5);

      // Box 3: Net Retained Savings
      const netSavings = reportData.summary?.savings || 0;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(136, 31, 60, 15, 1.5, 1.5, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('NET RETAINED SAVINGS', 140, 36);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(netSavings >= 0 ? 15 : 225, netSavings >= 0 ? 23 : 29, netSavings >= 0 ? 42 : 72);
      doc.text(
        netSavings >= 0 ? `+${formatPdfCurrency(netSavings)}` : `-${formatPdfCurrency(Math.abs(netSavings))}`,
        140,
        42.5
      );

      // Data Table
      autoTable(doc, {
        startY: 50,
        head: [['Date', 'Title', 'Type', 'Category', 'Account', 'Amount']],
        body: reportData.transactions.map((t) => [
          formatDate(t.date),
          t.title || 'Untitled',
          (t.type || 'expense').toUpperCase(),
          t.category?.name || 'General',
          t.account?.name || 'Primary',
          `${t.type === 'income' ? '+' : '-'}${formatPdfCurrency(t.amount)}`,
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
          2: { cellWidth: 22 },
          3: { cellWidth: 32 },
          4: { cellWidth: 28 },
          5: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
        },
        didDrawPage: (data) => {
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height || pageSize.getHeight();
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(148, 163, 184);
          doc.text(
            'FinFlow Financial Platform • Official Audit Statement • Confidential',
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

      doc.save(`finflow-${reportType}-${year}${reportType === 'monthly' ? `-${month}` : ''}.pdf`);
      toast.success('Executive PDF statement downloaded.');
    } catch (err) {
      console.error('PDF generation failed:', err);
      toast.error('Failed to generate PDF statement.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <DashboardLayout title="Reports">
      <div className="space-y-6">
        <div className="pb-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Audit & Exports</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Generate formal ledger statements and export structured PDF reports.</p>
        </div>

        <SpotlightCard radius={400} className="p-4 sm:p-5 border-border/80 dark:border-white/[0.08] dark:bg-[#121215]/80">
          <div className="pb-3.5 border-b border-border/40 dark:border-white/[0.05] mb-4">
            <h3 className="text-sm font-semibold tracking-tight text-foreground">Statement Parameters</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Specify accounting cycle and reporting interval</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="h-9 text-xs rounded-xl bg-background border-border/80 dark:bg-white/[0.03] dark:border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="monthly">Monthly Cycle</SelectItem>
                  <SelectItem value="yearly">Annual Statement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {reportType === 'monthly' && (
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Month</Label>
                <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-background border-border/80 dark:bg-white/[0.03] dark:border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Year</Label>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger className="h-9 text-xs rounded-xl bg-background border-border/80 dark:bg-white/[0.03] dark:border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {[2024, 2025, 2026, 2027].map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:shrink-0 pt-1 sm:pt-0">
              <ShimmerButton
                onClick={generateReport}
                disabled={loading}
                className="w-full sm:w-auto h-9 px-5"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Table className="w-3.5 h-3.5" />}
                <span>Compile Statement</span>
              </ShimmerButton>
            </div>
          </div>
        </SpotlightCard>

        {reportData && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <SpotlightCard radius={280} spotlightColor="rgba(99, 102, 241, 0.14)" className="p-4 text-center border-border/70 dark:border-white/[0.08] dark:bg-[#121215]/80">
                <p className="text-[11px] font-medium tracking-wider uppercase text-muted-foreground">Inflow</p>
                <p className="text-xl font-bold font-mono tabular-nums mt-1 text-indigo-400">{formatCurrency(reportData.summary.income)}</p>
              </SpotlightCard>
              <SpotlightCard radius={280} spotlightColor="rgba(99, 102, 241, 0.08)" className="p-4 text-center border-border/70 dark:border-white/[0.08] dark:bg-[#121215]/80">
                <p className="text-[11px] font-medium tracking-wider uppercase text-muted-foreground">Outflow</p>
                <p className="text-xl font-bold font-mono tabular-nums mt-1 text-muted-foreground">{formatCurrency(reportData.summary.expenses)}</p>
              </SpotlightCard>
              <SpotlightCard radius={280} spotlightColor="rgba(99, 102, 241, 0.18)" className="p-4 text-center border-border/70 dark:border-white/[0.08] dark:bg-[#121215]/80">
                <p className="text-[11px] font-medium tracking-wider uppercase text-muted-foreground">Net Retained</p>
                <p className="text-xl font-bold font-mono tabular-nums mt-1 text-foreground">{formatCurrency(reportData.summary.savings)}</p>
              </SpotlightCard>
            </div>

            {/* Download buttons */}
            <div className="flex gap-2.5">
              <Button
                onClick={downloadPDF}
                disabled={exporting}
                variant="outline"
                size="sm"
                className="h-8 text-xs font-medium gap-1.5 dark:bg-white/[0.02]"
              >
                {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                <span>Export PDF</span>
              </Button>
            </div>

            {/* Transaction preview */}
            <SpotlightCard radius={400} className="p-0 border-border/70 dark:border-white/[0.08] dark:bg-[#121215]/80 overflow-hidden">
              <div className="p-4 border-b border-border/40 dark:border-white/[0.05] flex items-center justify-between">
                <h3 className="text-xs font-semibold tracking-tight text-foreground">Transaction Audit Log</h3>
                <span className="text-[10px] font-mono text-muted-foreground">{reportData.transactions.length} rows</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-xs">
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
                          <span className={cn('capitalize text-[10px] font-mono font-medium', tx.type === 'income' ? 'text-indigo-400' : 'text-muted-foreground')}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">{tx.category?.name || 'General'}</td>
                        <td className={cn('px-4 py-2.5 font-mono font-semibold tabular-nums', tx.type === 'income' ? 'text-indigo-400' : 'text-foreground')}>
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
