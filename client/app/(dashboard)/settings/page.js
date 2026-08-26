'use client';

import { useEffect, useState } from 'react';
import {
  Loader2, Upload, Save, ShieldCheck, ShieldAlert, Key, User,
  Globe, Moon, Sun, Bell, Database, Download, Check, Sparkles,
  Lock, Mail, Calendar, LogOut
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { authApi, settingsApi } from '@/services/api';
import { getInitials } from '@/lib/utils';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [currency, setCurrency] = useState('INR');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  const profileForm = useForm({ defaultValues: { name: user?.name || '' } });
  const passwordForm = useForm();

  useEffect(() => {
    if (user) profileForm.reset({ name: user.name });
    // Load saved settings currency without overriding current client theme
    settingsApi.get().then(({ data }) => {
      if (data.settings?.currency) setCurrency(data.settings.currency);
    }).catch(() => {});
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('File size must be under 5MB.');
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const saveProfile = async (data) => {
    setSavingProfile(true);
    try {
      const fd = new FormData();
      fd.append('name', data.name);
      if (avatarFile) fd.append('avatar', avatarFile);
      const { data: res } = await authApi.updateProfile(fd);
      updateUser(res.user);
      toast.success('Profile updated successfully.');
      setAvatarFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      return toast.error('New passwords do not match.');
    }
    setSavingPassword(true);
    try {
      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully.');
      passwordForm.reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleCurrencyChange = async (val) => {
    setCurrency(val);
    setSavingSettings(true);
    try {
      await settingsApi.update({ theme, currency: val });
      toast.success(`Currency changed to ${val}.`);
    } catch {
      toast.error('Failed to update currency.');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <DashboardLayout title="Settings & Preferences">
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40 dark:border-white/[0.04]">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Account & Preferences
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Manage your personal profile, security credentials, visual theme, and system localization.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{user?.isVerified ? 'Verified Account' : 'Pending Verification'}</span>
            </span>
          </div>
        </div>

        {/* 2-Column Wide Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ==================================================== */}
          {/* LEFT COLUMN: Profile & Security Management (7 Cols) */}
          {/* ==================================================== */}
          <div className="lg:col-span-7 space-y-6">

            {/* Profile Card */}
            <Card className="border border-border/80 dark:border-white/[0.08] dark:bg-card/85 backdrop-blur-md">
              <CardHeader className="pb-4 border-b border-border/40 dark:border-white/[0.04]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold tracking-tight">Personal Identity</CardTitle>
                    <CardDescription className="text-xs">Your public profile name and avatar</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Avatar Uploader */}
                <div className="flex items-center gap-5 p-4 rounded-2xl bg-accent/30 dark:bg-white/[0.02] border border-border/50 dark:border-white/[0.05]">
                  <div className="relative group">
                    <Avatar className="w-20 h-20 border-2 border-border/80 dark:border-white/10 ring-4 ring-primary/10 shadow-md">
                      <AvatarImage src={avatarPreview || user?.avatar} />
                      <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="space-y-1.5">
                    <label className="cursor-pointer inline-block">
                      <Button type="button" variant="outline" size="sm" className="h-8.5 rounded-xl text-xs gap-1.5 font-medium dark:bg-white/[0.04]" asChild>
                        <span>
                          <Upload className="w-3.5 h-3.5 text-primary" />
                          <span>Upload Photo</span>
                        </span>
                      </Button>
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      PNG, JPG, or WEBP up to 5MB. Stored securely on AWS S3.
                    </p>
                  </div>
                </div>

                {/* Form fields */}
                <form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Full Name</Label>
                    <Input
                      className="h-10 rounded-xl text-xs dark:bg-white/[0.03] dark:border-white/10"
                      placeholder="Your full name"
                      {...profileForm.register('name', { required: 'Full name is required' })}
                    />
                    {profileForm.formState.errors.name && (
                      <p className="text-xs text-destructive">{profileForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Email Address</Label>
                    <div className="relative">
                      <Input
                        value={user?.email || ''}
                        disabled
                        className="h-10 rounded-xl pl-9 text-xs bg-muted/60 dark:bg-white/[0.02] border-dashed cursor-not-allowed opacity-90"
                      />
                      <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Email address is linked to your account authentication and cannot be changed.
                    </p>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" size="sm" className="h-9 px-5 rounded-xl font-semibold gap-2" disabled={savingProfile}>
                      {savingProfile ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>Save Profile Changes</span>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Security & Password Card */}
            <Card className="border border-border/80 dark:border-white/[0.08] dark:bg-card/85 backdrop-blur-md">
              <CardHeader className="pb-4 border-b border-border/40 dark:border-white/[0.04]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold tracking-tight">Security & Credentials</CardTitle>
                    <CardDescription className="text-xs">Update your password and login credentials</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={passwordForm.handleSubmit(savePassword)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Current Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="h-10 rounded-xl text-xs dark:bg-white/[0.03] dark:border-white/10"
                      {...passwordForm.register('currentPassword', { required: 'Current password is required' })}
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-xs text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">New Password</Label>
                      <Input
                        type="password"
                        placeholder="Min 8 characters"
                        className="h-10 rounded-xl text-xs dark:bg-white/[0.03] dark:border-white/10"
                        {...passwordForm.register('newPassword', {
                          required: 'New password is required',
                          minLength: { value: 8, message: 'Minimum 8 characters' }
                        })}
                      />
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">Confirm New Password</Label>
                      <Input
                        type="password"
                        placeholder="Repeat new password"
                        className="h-10 rounded-xl text-xs dark:bg-white/[0.03] dark:border-white/10"
                        {...passwordForm.register('confirmPassword', { required: 'Please confirm password' })}
                      />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" variant="outline" size="sm" className="h-9 px-5 rounded-xl font-semibold gap-2 dark:bg-white/[0.03]" disabled={savingPassword}>
                      {savingPassword ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-primary" />
                      )}
                      <span>Update Password</span>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

          </div>

          {/* ======================================================= */}
          {/* RIGHT COLUMN: Preferences, Overview & Utilities (5 Cols)*/}
          {/* ======================================================= */}
          <div className="lg:col-span-5 space-y-6">

            {/* Appearance & Theme Selector */}
            <Card className="border border-border/80 dark:border-white/[0.08] dark:bg-card/85 backdrop-blur-md">
              <CardHeader className="pb-3 border-b border-border/40 dark:border-white/[0.04]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold tracking-tight">Visual Theme</CardTitle>
                    <CardDescription className="text-xs">Customize application display mode</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-2 gap-3">
                  {/* Dark Mode Tile */}
                  <button
                    type="button"
                    onClick={() => {
                      setTheme('dark');
                      settingsApi.update({ theme: 'dark', currency }).catch(() => {});
                    }}
                    className={cn(
                      'p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group',
                      theme === 'dark'
                        ? 'border-primary bg-primary/10 shadow-xs ring-2 ring-primary/20'
                        : 'border-border/60 hover:border-border dark:border-white/[0.06] bg-card'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Moon className={cn('w-4 h-4', theme === 'dark' ? 'text-primary' : 'text-muted-foreground')} />
                      {theme === 'dark' && <Check className="w-3.5 h-3.5 text-primary" />}
                    </div>
                    <p className="text-xs font-semibold text-foreground">Dark Obsidian</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Sleek high-contrast</p>
                  </button>

                  {/* Light Mode Tile */}
                  <button
                    type="button"
                    onClick={() => {
                      setTheme('light');
                      settingsApi.update({ theme: 'light', currency }).catch(() => {});
                    }}
                    className={cn(
                      'p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group',
                      theme === 'light'
                        ? 'border-primary bg-primary/10 shadow-xs ring-2 ring-primary/20'
                        : 'border-border/60 hover:border-border dark:border-white/[0.06] bg-card'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Sun className={cn('w-4 h-4', theme === 'light' ? 'text-primary' : 'text-muted-foreground')} />
                      {theme === 'light' && <Check className="w-3.5 h-3.5 text-primary" />}
                    </div>
                    <p className="text-xs font-semibold text-foreground">Clean Light</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Minimal daytime look</p>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Currency & Localization */}
            <Card className="border border-border/80 dark:border-white/[0.08] dark:bg-card/85 backdrop-blur-md">
              <CardHeader className="pb-3 border-b border-border/40 dark:border-white/[0.04]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold tracking-tight">Localization & Currency</CardTitle>
                    <CardDescription className="text-xs">Primary currency symbol for financial amounts</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Default Currency</Label>
                  <Select value={currency} onValueChange={handleCurrencyChange}>
                    <SelectTrigger className="h-10 rounded-xl text-xs dark:bg-white/[0.03] dark:border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="INR">🇮🇳 INR — Indian Rupee (₹)</SelectItem>
                      <SelectItem value="USD">🇺🇸 USD — US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">🇪🇺 EUR — Euro (€)</SelectItem>
                      <SelectItem value="GBP">🇬🇧 GBP — British Pound (£)</SelectItem>
                      <SelectItem value="JPY">🇯🇵 JPY — Japanese Yen (¥)</SelectItem>
                      <SelectItem value="AUD">🇦🇺 AUD — Australian Dollar (A$)</SelectItem>
                      <SelectItem value="CAD">🇨🇦 CAD — Canadian Dollar (C$)</SelectItem>
                      <SelectItem value="SGD">🇸🇬 SGD — Singapore Dollar (S$)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    All balances, transaction figures, and reports will adapt automatically.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Account Metadata & Status */}
            <Card className="border border-border/80 dark:border-white/[0.08] dark:bg-card/85 backdrop-blur-md">
              <CardHeader className="pb-3 border-b border-border/40 dark:border-white/[0.04]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold tracking-tight">Account Overview</CardTitle>
                    <CardDescription className="text-xs">Membership details and data state</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-border/40 dark:border-white/[0.04]">
                  <span className="text-muted-foreground">Account Status</span>
                  <span className="font-semibold text-emerald-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Active (Tier Pro)
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-border/40 dark:border-white/[0.04]">
                  <span className="text-muted-foreground">Member Since</span>
                  <span className="font-mono font-medium text-foreground">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'August 2026'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-border/40 dark:border-white/[0.04]">
                  <span className="text-muted-foreground">Storage Engine</span>
                  <span className="text-foreground font-medium">AWS S3 (Encrypted)</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-muted-foreground">Database Pool</span>
                  <span className="text-foreground font-medium">Supabase PostgreSQL 17</span>
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
