import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, User, Mail, Shield, Eye, EyeOff, Loader2 } from 'lucide-react';

// ─── Schema ───────────────────────────────────────────────────────────────────
const changePasswordSchema = z
  .object({
    currentPassword:  z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/[0-9]/, 'Must contain a number')
      .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

// ─── Role badge colours ───────────────────────────────────────────────────────
const ROLE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  Admin:          { bg: 'bg-ip-primary/10',   text: 'text-ip-primary',    label: 'Admin' },
  ProjectManager: { bg: 'bg-ip-tertiary/10',  text: 'text-ip-tertiary',   label: 'Project Manager' },
  Collaborator:   { bg: 'bg-ip-secondary-container', text: 'text-ip-on-secondary-container', label: 'Collaborator' },
};

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-ip-surface-container-lowest border border-ip-outline-variant rounded-ip-lg overflow-hidden shadow-[0_2px_8px_rgba(70,72,212,0.04)]">
      <div className="px-6 py-4 border-b border-ip-outline-variant">
        <h2 className="text-sm font-bold text-ip-on-surface">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user } = useAuth();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const roleStyle = ROLE_STYLES[user?.role ?? 'Collaborator'];

  const onSubmit = async (data: ChangePasswordValues) => {
    setIsSubmitting(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully');
      reset();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-jakarta space-y-5 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold text-ip-on-surface tracking-tight">Profile</h1>
        <p className="text-sm text-ip-on-surface-variant mt-1">Manage your account settings.</p>
      </div>

      {/* Profile info */}
      <Section title="Account Information">
        <div className="flex items-center gap-5 mb-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-ip-on-primary text-2xl font-bold bg-gradient-to-br from-ip-primary to-ip-primary-container shadow-[0_4px_16px_rgba(70,72,212,0.25)]">
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </div>
          </div>
          <div>
            <p className="text-lg font-bold text-ip-on-surface">{user?.name}</p>
            <p className="text-sm text-ip-on-surface-variant">@{user?.username}</p>
            <span className={`inline-flex items-center gap-1 mt-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${roleStyle.bg} ${roleStyle.text}`}>
              <Shield size={10} />
              {roleStyle.label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-ip-on-surface">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ip-outline" />
              <Input
                value={user?.name ?? ''}
                readOnly
                className="pl-10 h-10 bg-ip-surface-container-low border-ip-outline-variant text-ip-on-surface text-sm rounded-ip-base cursor-not-allowed opacity-60"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-ip-on-surface">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ip-outline" />
              <Input
                value={user?.email ?? ''}
                readOnly
                className="pl-10 h-10 bg-ip-surface-container-low border-ip-outline-variant text-ip-on-surface text-sm rounded-ip-base cursor-not-allowed opacity-60"
              />
            </div>
          </div>
        </div>

        <p className="text-xs text-ip-on-surface-variant mt-3 opacity-60">
          To update your name or email, contact your administrator.
        </p>
      </Section>

      {/* Change password */}
      <Section title="Change Password">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

          {/* Current */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-ip-on-surface">
              Current Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ip-outline" />
              <Input
                type={showCurrent ? 'text' : 'password'}
                placeholder="Enter current password"
                className="pl-10 pr-10 h-10 bg-ip-surface-container-low border-ip-outline-variant text-ip-on-surface text-sm rounded-ip-base focus-visible:ring-2 focus-visible:ring-ip-primary/30 focus-visible:border-ip-primary transition-all"
                {...register('currentPassword')}
              />
              <button type="button" onClick={() => setShowCurrent((v) => !v)} tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ip-outline hover:text-ip-on-surface-variant transition-colors">
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs font-medium text-ip-error">· {errors.currentPassword.message}</p>
            )}
          </div>

          {/* New */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-ip-on-surface">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ip-outline" />
              <Input
                type={showNew ? 'text' : 'password'}
                placeholder="Create a strong password"
                className="pl-10 pr-10 h-10 bg-ip-surface-container-low border-ip-outline-variant text-ip-on-surface text-sm rounded-ip-base focus-visible:ring-2 focus-visible:ring-ip-primary/30 focus-visible:border-ip-primary transition-all"
                {...register('newPassword')}
              />
              <button type="button" onClick={() => setShowNew((v) => !v)} tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ip-outline hover:text-ip-on-surface-variant transition-colors">
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs font-medium text-ip-error">· {errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-ip-on-surface">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ip-outline" />
              <Input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter new password"
                className="pl-10 pr-10 h-10 bg-ip-surface-container-low border-ip-outline-variant text-ip-on-surface text-sm rounded-ip-base focus-visible:ring-2 focus-visible:ring-ip-primary/30 focus-visible:border-ip-primary transition-all"
                {...register('confirmPassword')}
              />
              <button type="button" onClick={() => setShowConfirm((v) => !v)} tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ip-outline hover:text-ip-on-surface-variant transition-colors">
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs font-medium text-ip-error">· {errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-10 px-6 bg-ip-primary hover:bg-ip-on-primary-fixed-variant text-ip-on-primary font-semibold text-sm rounded-ip-base shadow-[0_2px_8px_rgba(70,72,212,0.25)] hover:shadow-[0_4px_16px_rgba(70,72,212,0.35)] transition-all"
          >
            {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</> : 'Change Password'}
          </Button>
        </form>
      </Section>
    </div>
  );
}
