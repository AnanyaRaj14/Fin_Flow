'use client';

import { useState } from 'react';
import { Download, FileText, Table, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
        <div>
          <h2 className="text-xl font-bold">Reports</h2>
          <p className="text-muted-foreground text-sm">Download your financial reports as PDF or CSV.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generate Report</CardTitle>
            <CardDescription>Select a period and generate your report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {reportType === 'monthly' && (
                <div className="space-y-1.5">
                  <Label>Month</Label>
                  <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Year</Label>
                <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[2024, 2025, 2026, 2027].map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={generateReport} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Generate
            </Button>
          </CardContent>
        </Card>

        {reportData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Income',   value: reportData.summary.income,   color: 'text-emerald-600' },
                { label: 'Expenses', value: reportData.summary.expenses, color: 'text-red-600' },
                { label: 'Savings',  value: reportData.summary.savings,  color: 'text-primary' },
              ].map((item) => (
                <Card key={item.label}>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className={`text-xl font-bold mt-1 ${item.color}`}>{formatCurrency(item.value)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Download buttons */}
            <div className="flex gap-3">
              <Button onClick={downloadPDF} variant="outline">
                <FileText className="w-4 h-4" /> Download PDF
              </Button>
              <Button onClick={downloadCSV} variant="outline">
                <Table className="w-4 h-4" /> Download CSV
              </Button>
            </div>

            {/* Transaction preview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Transactions ({reportData.transactions.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        {['Date','Title','Type','Category','Amount'].map((h) => (
                          <th key={h} className="text-left px-4 py-2 font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.transactions.slice(0, 50).map((tx) => (
                        <tr key={tx.id} className="border-b hover:bg-accent/30">
                          <td className="px-4 py-2 text-muted-foreground">{formatDate(tx.date)}</td>
                          <td className="px-4 py-2 font-medium">{tx.title}</td>
                          <td className="px-4 py-2">
                            <span className={`capitalize text-xs font-medium ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-muted-foreground">{tx.category?.name}</td>
                          <td className={`px-4 py-2 font-semibold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {reportData.transactions.length > 50 && (
                    <p className="text-center text-xs text-muted-foreground py-3">
                      Showing 50 of {reportData.transactions.length}. Download for full report.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
