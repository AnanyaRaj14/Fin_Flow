'use client';

import { useEffect, useState } from 'react';
import { Loader2, Upload, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { authApi, settingsApi } from '@/services/api';
import { getInitials } from '@/lib/utils';
import { toast } from '@/components/ui/toast';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [currency, setCurrency] = useState('INR');
  const [savingSettings, setSavingSettings] = useState(false);

  const profileForm = useForm({ defaultValues: { name: user?.name || '' } });
  const passwordForm = useForm();

  useEffect(() => {
    if (user) profileForm.reset({ name: user.name });
    // Load saved settings
    settingsApi.get().then(({ data }) => {
      if (data.settings?.currency) setCurrency(data.settings.currency);
      if (data.settings?.theme) setTheme(data.settings.theme);
    }).catch(() => {});
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
    } finally { setSavingProfile(false); }
  };

  const savePassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      return toast.error('New passwords do not match.');
    }
    setSavingPassword(true);
    try {
      await authApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed.');
      passwordForm.reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally { setSavingPassword(false); }
  };

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-2xl space-y-6">
        <h2 className="text-xl font-bold">Settings</h2>

        {/* Profile */}
        <Card>
          <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={avatarPreview || user?.avatar} />
                <AvatarFallback className="text-lg">{getInitials(user?.name)}</AvatarFallback>
              </Avatar>
              <div>
                <label className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span><Upload className="w-4 h-4" /> Change Photo</span>
                  </Button>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 2MB</p>
              </div>
            </div>

            <form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input {...profileForm.register('name', { required: 'Name is required' })} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={user?.email || ''} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
              </div>
              <Button type="submit" disabled={savingProfile}>
                {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" /> Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader><CardTitle className="text-base">Appearance</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Theme</Label>
              <Select value={theme} onValueChange={(val) => {
                setTheme(val);
                settingsApi.update({ theme: val, currency }).catch(() => {});
              }}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={async (val) => {
                setCurrency(val);
                setSavingSettings(true);
                try {
                  await settingsApi.update({ theme, currency: val });
                  toast.success('Currency updated. Refresh to see changes.');
                } catch { toast.error('Failed to save currency.'); }
                finally { setSavingSettings(false); }
              }}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">🇮🇳 INR — Indian Rupee</SelectItem>
                  <SelectItem value="USD">🇺🇸 USD — US Dollar</SelectItem>
                  <SelectItem value="EUR">🇪🇺 EUR — Euro</SelectItem>
                  <SelectItem value="GBP">🇬🇧 GBP — British Pound</SelectItem>
                  <SelectItem value="JPY">🇯🇵 JPY — Japanese Yen</SelectItem>
                  <SelectItem value="AUD">🇦🇺 AUD — Australian Dollar</SelectItem>
                  <SelectItem value="CAD">🇨🇦 CAD — Canadian Dollar</SelectItem>
                  <SelectItem value="SGD">🇸🇬 SGD — Singapore Dollar</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Affects all currency displays across the app.</p>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(savePassword)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Current Password</Label>
                <Input type="password" placeholder="••••••••" {...passwordForm.register('currentPassword', { required: 'Required' })} />
              </div>
              <div className="space-y-1.5">
                <Label>New Password</Label>
                <Input type="password" placeholder="Min 8 characters" {...passwordForm.register('newPassword', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })} />
              </div>
              <div className="space-y-1.5">
                <Label>Confirm New Password</Label>
                <Input type="password" placeholder="Repeat new password" {...passwordForm.register('confirmPassword', { required: 'Required' })} />
              </div>
              <Button type="submit" disabled={savingPassword}>
                {savingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader><CardTitle className="text-base">Account Info</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Member since: <span className="text-foreground font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span></p>
            <p>Email verified: <span className={`font-medium ${user?.isVerified ? 'text-emerald-600' : 'text-red-600'}`}>{user?.isVerified ? 'Yes' : 'No'}</span></p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
