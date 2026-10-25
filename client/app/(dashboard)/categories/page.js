'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Tag, Loader2, Lock } from 'lucide-react';
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Categories</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {defaults.length} system presets · {custom.length} custom tags
            </p>
          </div>
          <ShimmerButton
            onClick={openCreate}
            className="h-8 px-3.5 text-xs font-medium gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Category</span>
          </ShimmerButton>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Custom categories */}
            <SpotlightCard radius={380} className="p-4 sm:p-5 border-border/70 dark:border-white/[0.08] dark:bg-[#121215]/80">
              <div className="pb-3 border-b border-border/40 dark:border-white/[0.05] mb-4">
                <h3 className="text-sm font-semibold tracking-tight text-foreground">Custom Taxonomies</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Tailored categories created for your accounting</p>
              </div>
              {custom.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Tag className="w-8 h-8 mx-auto mb-2 opacity-25" />
                  <p className="text-xs font-medium text-foreground">No custom categories yet</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Create a specialized tag to organize transactions your way.</p>
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
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/60 dark:border-white/[0.06] bg-card/40 hover:bg-accent/40 dark:hover:bg-white/[0.03] transition-colors group">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                          style={{ background: cat.color + '15', borderColor: cat.color + '30' }}
                        >
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{cat.name}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">{cat.type}</p>
                        </div>
                        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md" onClick={() => openEdit(cat)} title="Edit category">
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md text-destructive hover:bg-destructive/10" onClick={() => setConfirmDelete(cat)} title="Delete category">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </SpotlightCard>

            {/* Default categories */}
            <SpotlightCard radius={380} className="p-4 sm:p-5 border-border/70 dark:border-white/[0.08] dark:bg-[#121215]/80">
              <div className="pb-3 border-b border-border/40 dark:border-white/[0.05] mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>System Presets</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Standard baseline financial categories</p>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">{defaults.length} presets</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {defaults.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border/40 dark:border-white/[0.04] bg-muted/20"
                  >
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                    <span className="text-xs font-medium text-foreground truncate">{cat.name}</span>
                    <span className="ml-auto text-[9px] font-mono uppercase text-muted-foreground">
                      {cat.type === 'both' ? 'all' : cat.type}
                    </span>
                  </div>
                ))}
              </div>
            </SpotlightCard>
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
              <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <ShimmerButton type="submit" className="flex-1 h-9 rounded-xl font-medium" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{editing ? 'Update Category' : 'Create Category'}</span>
              </ShimmerButton>
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
