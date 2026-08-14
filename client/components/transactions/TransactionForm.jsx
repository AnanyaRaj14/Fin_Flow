'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { categoriesApi, accountsApi } from '@/services/api';
import { formatDateInput } from '@/lib/utils';

const PAYMENT_METHODS = ['card', 'cash', 'transfer', 'upi', 'cheque'];

export default function TransactionForm({ onSubmit, defaultValues, saving }) {
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [receipt, setReceipt] = useState(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      amount: '',
      type: 'expense',
      date: formatDateInput(new Date()),
      categoryId: '',
      accountId: '',
      paymentMethod: 'card',
      notes: '',
      ...defaultValues,
      date: defaultValues?.date ? formatDateInput(new Date(defaultValues.date)) : formatDateInput(new Date()),
    },
  });

  const txType = watch('type');
  const selectedCategory = watch('categoryId');
  const selectedAccount = watch('accountId');
  const selectedPayment = watch('paymentMethod');

  useEffect(() => {
    Promise.all([categoriesApi.getAll(), accountsApi.getAll()]).then(([c, a]) => {
      setCategories(c.data.categories);
      setAccounts(a.data.accounts);
    });
  }, []);

  const handleFormSubmit = (data) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => { if (v !== '' && v !== undefined) fd.append(k, v); });
    if (receipt) fd.append('receipt', receipt);
    onSubmit(fd);
  };

  const filteredCategories = categories.filter(
    (c) => c.type === txType || c.type === 'both'
  );

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Type toggle */}
      <div className="grid grid-cols-2 gap-2">
        {['expense', 'income'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setValue('type', t); setValue('categoryId', ''); }}
            className={`py-2 rounded-lg text-sm font-medium capitalize transition-colors border ${
              txType === t
                ? t === 'income' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-red-500 text-white border-red-500'
                : 'border-input bg-background text-muted-foreground hover:bg-accent'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label>Title</Label>
          <Input placeholder="e.g. Netflix Subscription" {...register('title', { required: 'Title is required' })} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Amount</Label>
          <Input type="number" step="0.01" min="0.01" placeholder="0.00" {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be positive' } })} />
          {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Date</Label>
          <Input type="date" {...register('date', { required: 'Date is required' })} />
          {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={selectedCategory} onValueChange={(v) => setValue('categoryId', v)}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              {filteredCategories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {!selectedCategory && <p className="text-xs text-muted-foreground">Required</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Account</Label>
          <Select value={selectedAccount} onValueChange={(v) => setValue('accountId', v)}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label>Payment Method</Label>
          <Select value={selectedPayment} onValueChange={(v) => setValue('paymentMethod', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m} className="capitalize">{m.toUpperCase()}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label>Notes (optional)</Label>
          <Textarea placeholder="Any additional notes..." rows={2} {...register('notes')} />
        </div>

        {/* Receipt upload */}
        <div className="col-span-2 space-y-1.5">
          <Label>Receipt (optional)</Label>
          {receipt ? (
            <div className="flex items-center gap-2 p-2 border rounded-lg text-sm">
              <span className="flex-1 truncate">{receipt.name}</span>
              <button type="button" onClick={() => setReceipt(null)}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-accent/50 transition-colors">
              <Upload className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Click to upload receipt</span>
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setReceipt(e.target.files?.[0] || null)} />
            </label>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1" disabled={saving || !selectedCategory || !selectedAccount}>
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Transaction
        </Button>
      </div>
    </form>
  );
}
