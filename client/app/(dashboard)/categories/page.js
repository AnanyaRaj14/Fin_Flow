'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Tag, Loader2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { categoriesApi } from '@/services/api';
import { toast } from '@/components/ui/toast';

const COLORS = [
  '#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6',
  '#8b5cf6','#ec4899','#14b8a6','#f97316','#6b7280',
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    defaultValues: { name: '', type: 'expense', color: '#6366f1' },
  });

  const selectedColor = watch('color');
  const selectedType = watch('type');

  useEffect(() => {
    categoriesApi.getAll()
      .then(({ data }) => { setCategories(data.categories); setLoading(false); })
      .catch(() => { toast.error('Failed to load categories.'); setLoading(false); });
  }, []);

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', type: 'expense', color: '#6366f1' });
    setOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    reset({ name: cat.name, type: cat.type, color: cat.color });
    setOpen(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing) {
        const { data: res } = await categoriesApi.update(editing.id, data);
        setCategories((p) => p.map((c) => c.id === editing.id ? res.category : c));
        toast.success('Category updated.');
      } else {
        const { data: res } = await categoriesApi.create(data);
        setCategories((p) => [...p, res.category]);
        toast.success('Category created.');
      }
      setOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving category.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await categoriesApi.delete(confirmDelete.id);
      setCategories((p) => p.filter((c) => c.id !== confirmDelete.id));
      toast.success('Category deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete.');
    } finally { setConfirmDelete(null); }
  };

  const defaults = categories.filter((c) => c.isDefault);
  const custom = categories.filter((c) => !c.isDefault);

  return (
    <DashboardLayout title="Categories">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Categories</h2>
            <p className="text-muted-foreground text-sm">
              {defaults.length} default · {custom.length} custom
            </p>
          </div>
          <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Category</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Default categories */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  Default Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                  {defaults.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/30"
                    >
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: cat.color }} />
                      <span className="text-sm font-medium truncate">{cat.name}</span>
                      <Badge variant="outline" className="ml-auto text-xs shrink-0">
                        {cat.type === 'both' ? 'all' : cat.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Custom categories */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Custom Categories</CardTitle>
              </CardHeader>
              <CardContent>
                {custom.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Tag className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No custom categories yet.</p>
                    <p className="text-xs mt-1">Create one to organise transactions your way.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {custom.map((cat, i) => (
                      <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border hover:bg-accent/30 transition-colors group">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: cat.color + '20' }}
                          >
                            <div className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{cat.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{cat.type}</p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(cat)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setConfirmDelete(cat)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Category' : 'New Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                placeholder="e.g. Side Hustle"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={selectedType} onValueChange={(v) => setValue('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setValue('color', c)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${selectedColor === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        description={`"${confirmDelete?.name}" will be permanently deleted. Transactions using this category may be affected.`}
        confirmLabel="Delete Category"
      />
    </DashboardLayout>
  );
}
