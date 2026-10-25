'use client';

import { useEffect, useState } from 'react';
import { Loader2, Upload, Check, Moon, Sun } from 'lucide-react';
import { useForm } from 'react-hook-form';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { authApi, settingsApi } from '@/services/api';
import { getInitials, setActiveCurrency, cn } from '@/lib/utils';
import { toast } from '@/components/ui/toast';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [currency, setCurrency] = useState('USD');

  const profileForm = useForm({ defaultValues: { name: user?.name || '' } });
  const passwordForm = useForm();

  useEffect(() => {
    if (user) profileForm.reset({ name: user.name });
    settingsApi.get().then(({ data }) => {
      if (data.settings?.currency) {
        setCurrency(data.settings.currency);
        setActiveCurrency(data.settings.currency);
      }
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
      toast.success('Profile updated.');
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
      toast.success('Password changed.');
      passwordForm.reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleCurrencyChange = async (val) => {
    setCurrency(val);
    setActiveCurrency(val);
    try {
      await settingsApi.update({ theme, currency: val });
      toast.success(`Currency changed to ${val}.`);
    } catch {
      toast.error('Failed to update currency.');
    }
  };

  return (
    <DashboardLayout title="Settings">
      <div className="space-y-6 max-w-3xl mx-auto pb-12">
        {/* Page Header */}
        <div className="pb-4 border-b border-border/40 dark:border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Settings</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Manage your profile, appearance, and security.</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn('w-1.5 h-1.5 rounded-full', user?.isVerified ? 'bg-emerald-500' : 'bg-muted-foreground/60')} />
            <span>{user?.isVerified ? 'Verified' : 'Pending verification'}</span>
          </div>
        </div>

        {/* Profile Card */}
        <SpotlightCard radius={400} spotlightColor="rgba(99, 102, 241, 0.12)" className="border-border/60 dark:border-white/[0.06] p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">Profile</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Your personal information and avatar</p>
          </div>

          {/* Avatar Row */}
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14 border border-border/80 dark:border-white/10">
              <AvatarImage src={avatarPreview || user?.avatar} />
              <AvatarFallback className="text-base font-semibold bg-accent text-foreground">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <label className="cursor-pointer inline-block">
                <Button type="button" variant="outline" size="sm" className="h-8 px-3 rounded-lg text-xs font-medium dark:bg-white/[0.02]" asChild>
                  <span>
                    <Upload className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                    <span>Change avatar</span>
                  </span>
                </Button>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
              <p className="text-[11px] text-muted-foreground mt-1">JPG, PNG, or WEBP up to 5MB</p>
            </div>
          </div>

          <form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Full Name</Label>
                <Input
                  className="h-9 rounded-lg text-xs dark:bg-white/[0.02] dark:border-white/10"
                  placeholder="Your name"
                  {...profileForm.register('name', { required: 'Name is required' })}
                />
                {profileForm.formState.errors.name && (
                  <p className="text-xs text-destructive">{profileForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Email</Label>
                <Input
                  value={user?.email || ''}
                  disabled
                  className="h-9 rounded-lg text-xs bg-muted/40 dark:bg-white/[0.02] dark:border-white/10 cursor-not-allowed opacity-80"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <ShimmerButton type="submit" disabled={savingProfile} className="h-8 px-4 text-xs font-medium rounded-xl">
                {savingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Profile</span>
              </ShimmerButton>
            </div>
          </form>
        </SpotlightCard>

        {/* Preferences Card */}
        <SpotlightCard radius={400} spotlightColor="rgba(99, 102, 241, 0.12)" className="border-border/60 dark:border-white/[0.06] p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">Preferences</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Application theme and localization</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Theme */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-foreground">Theme</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTheme('dark');
                    settingsApi.update({ theme: 'dark', currency }).catch(() => {});
                  }}
                  className={cn(
                    'flex items-center justify-between p-2.5 rounded-lg border text-xs font-medium transition-colors',
                    theme === 'dark'
                      ? 'border-foreground/30 bg-accent/60 dark:bg-white/[0.08] text-foreground'
                      : 'border-border/60 dark:border-white/[0.06] text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Moon className="w-3.5 h-3.5" />
                    Dark
                  </span>
                  {theme === 'dark' && <Check className="w-3.5 h-3.5 text-foreground" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTheme('light');
                    settingsApi.update({ theme: 'light', currency }).catch(() => {});
                  }}
                  className={cn(
                    'flex items-center justify-between p-2.5 rounded-lg border text-xs font-medium transition-colors',
                    theme === 'light'
                      ? 'border-foreground/30 bg-accent/60 text-foreground'
                      : 'border-border/60 dark:border-white/[0.06] text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Sun className="w-3.5 h-3.5" />
                    Light
                  </span>
                  {theme === 'light' && <Check className="w-3.5 h-3.5 text-foreground" />}
                </button>
              </div>
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-foreground">Currency</Label>
              <Select value={currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="h-9 rounded-lg text-xs dark:bg-white/[0.02] dark:border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="INR">INR — Indian Rupee (₹)</SelectItem>
                  <SelectItem value="USD">USD — US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">EUR — Euro (€)</SelectItem>
                  <SelectItem value="GBP">GBP — British Pound (£)</SelectItem>
                  <SelectItem value="JPY">JPY — Japanese Yen (¥)</SelectItem>
                  <SelectItem value="AUD">AUD — Australian Dollar (A$)</SelectItem>
                  <SelectItem value="CAD">CAD — Canadian Dollar (C$)</SelectItem>
                  <SelectItem value="SGD">SGD — Singapore Dollar (S$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SpotlightCard>

        {/* Security Card */}
        <SpotlightCard radius={400} spotlightColor="rgba(99, 102, 241, 0.12)" className="border-border/60 dark:border-white/[0.06] p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">Security</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Update your password</p>
          </div>

          <form onSubmit={passwordForm.handleSubmit(savePassword)} className="space-y-4">
            <div className="space-y-1.5 max-w-sm">
              <Label className="text-xs font-medium text-foreground">Current Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="h-9 rounded-lg text-xs dark:bg-white/[0.02] dark:border-white/10"
                {...passwordForm.register('currentPassword', { required: 'Current password is required' })}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-xs text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">New Password</Label>
                <Input
                  type="password"
                  placeholder="Min 8 characters"
                  className="h-9 rounded-lg text-xs dark:bg-white/[0.02] dark:border-white/10"
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
                <Label className="text-xs font-medium text-foreground">Confirm New Password</Label>
                <Input
                  type="password"
                  placeholder="Repeat password"
                  className="h-9 rounded-lg text-xs dark:bg-white/[0.02] dark:border-white/10"
                  {...passwordForm.register('confirmPassword', { required: 'Please confirm password' })}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" size="sm" variant="outline" disabled={savingPassword} className="h-8 px-4 text-xs font-medium rounded-lg dark:bg-white/[0.02]">
                {savingPassword && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                Update Password
              </Button>
            </div>
          </form>
        </SpotlightCard>

        {/* Account Details Footer */}
        <SpotlightCard radius={350} spotlightColor="rgba(99, 102, 241, 0.1)" className="border-border/60 dark:border-white/[0.06] p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">Account Status: </span>
              <span className="font-medium text-foreground">Active</span>
            </div>
            <div>
              <span className="text-muted-foreground">Member Since: </span>
              <span className="font-mono text-muted-foreground">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'August 2026'}
              </span>
            </div>
          </div>
        </SpotlightCard>

      </div>
    </DashboardLayout>
  );
}
