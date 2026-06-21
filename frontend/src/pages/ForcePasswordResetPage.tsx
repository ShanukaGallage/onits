import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, ShieldCheck, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ── Validation schema (mirrors backend) ───────────────────────────────────────
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/[0-9]/, 'Must contain a number')
      .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

// ── Password strength helper ───────────────────────────────────────────────────
function getStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Weak', color: 'bg-ip-error' };
  if (score === 3) return { score, label: 'Fair', color: 'bg-amber-400' };
  if (score === 4) return { score, label: 'Good', color: 'bg-emerald-400' };
  return { score, label: 'Strong', color: 'bg-emerald-500' };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ForcePasswordResetPage() {
  const { user, mutateUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPasswordValue, setNewPasswordValue] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) });

  if (user && !user.isFirstLogin) {
    navigate('/', { replace: true });
    return null;
  }

  const onSubmit = async (data: PasswordFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      mutateUser(res.data);
      toast.success('Password updated successfully');
      navigate('/', { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const strength = getStrength(newPasswordValue);
  const requirements = [
    { label: 'At least 8 characters', met: newPasswordValue.length >= 8 },
    { label: 'Uppercase letter (A–Z)', met: /[A-Z]/.test(newPasswordValue) },
    { label: 'Lowercase letter (a–z)', met: /[a-z]/.test(newPasswordValue) },
    { label: 'Number (0–9)', met: /[0-9]/.test(newPasswordValue) },
    { label: 'Special character (!@#…)', met: /[^A-Za-z0-9]/.test(newPasswordValue) },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-ip-surface p-6 relative overflow-hidden font-jakarta">
      {/* Ambient blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ip-primary/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-ip-tertiary/6 rounded-full blur-[100px] pointer-events-none" />

      {/* Card */}
      <div className="w-full max-w-[440px] bg-ip-surface-container-lowest rounded-ip-xl border border-ip-outline-variant shadow-[0_4px_24px_rgba(70,72,212,0.08)] relative z-10 overflow-hidden">

        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-ip-primary via-ip-primary-container to-ip-tertiary" />

        <div className="p-8">
          {/* Branding */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-12 h-12 rounded-ip-lg bg-gradient-to-br from-ip-primary to-ip-primary-container flex items-center justify-center mb-4 shadow-[0_4px_12px_rgba(70,72,212,0.3)]">
              <ShieldCheck className="w-6 h-6 text-ip-on-primary" strokeWidth={2.5} />
            </div>
            <h1 className="text-[22px] font-bold leading-tight tracking-tight text-ip-on-surface">
              Action Required
            </h1>
            <p className="text-[13px] text-ip-on-surface-variant mt-1.5 leading-snug max-w-[280px]">
              For your protection, please set a new password before accessing the system.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

            {/* Current / Temporary password */}
            <div className="space-y-1.5">
              <label
                htmlFor="currentPassword"
                className="block text-[11px] font-semibold uppercase tracking-widest text-ip-on-surface"
              >
                Temporary Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ip-outline" />
                <Input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Enter temporary password"
                  autoComplete="current-password"
                  className="
                    pl-10 pr-10 h-10
                    bg-ip-surface-container-low border-ip-outline-variant
                    text-ip-on-surface text-sm placeholder:text-ip-on-surface-variant/40
                    rounded-ip-base
                    focus-visible:ring-2 focus-visible:ring-ip-primary/30 focus-visible:border-ip-primary
                    transition-all duration-150
                  "
                  {...register('currentPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ip-outline hover:text-ip-on-surface-variant transition-colors"
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-xs font-medium text-ip-error flex items-center gap-1">
                  <span>·</span> {errors.currentPassword.message}
                </p>
              )}
            </div>

            {/* New password + strength */}
            <div className="space-y-1.5">
              <label
                htmlFor="newPassword"
                className="block text-[11px] font-semibold uppercase tracking-widest text-ip-on-surface"
              >
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ip-outline" />
                <Input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  className="
                    pl-10 pr-10 h-10
                    bg-ip-surface-container-low border-ip-outline-variant
                    text-ip-on-surface text-sm placeholder:text-ip-on-surface-variant/40
                    rounded-ip-base
                    focus-visible:ring-2 focus-visible:ring-ip-primary/30 focus-visible:border-ip-primary
                    transition-all duration-150
                  "
                  {...register('newPassword', {
                    onChange: (e) => setNewPasswordValue(e.target.value),
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ip-outline hover:text-ip-on-surface-variant transition-colors"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs font-medium text-ip-error flex items-center gap-1">
                  <span>·</span> {errors.newPassword.message}
                </p>
              )}

              {/* Strength meter */}
              {newPasswordValue && (
                <div className="pt-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-ip-on-surface-variant">
                      Strength
                    </span>
                    <span className={`text-[11px] font-semibold ${
                      strength.label === 'Weak' ? 'text-ip-error' :
                      strength.label === 'Fair' ? 'text-amber-500' : 'text-emerald-600'
                    }`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.score ? strength.color : 'bg-ip-surface-container-highest'
                        }`}
                      />
                    ))}
                  </div>
                  {/* Requirements checklist */}
                  <ul className="space-y-1 pt-1">
                    {requirements.map((r) => (
                      <li key={r.label} className="flex items-center gap-2 text-[12px]">
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                          r.met ? 'bg-emerald-500' : 'bg-ip-surface-container-highest'
                        }`}>
                          {r.met && (
                            <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 8 8">
                              <path d="M1.5 4l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span className={r.met ? 'text-ip-on-surface' : 'text-ip-on-surface-variant'}>
                          {r.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-[11px] font-semibold uppercase tracking-widest text-ip-on-surface"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ip-outline" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  className="
                    pl-10 pr-10 h-10
                    bg-ip-surface-container-low border-ip-outline-variant
                    text-ip-on-surface text-sm placeholder:text-ip-on-surface-variant/40
                    rounded-ip-base
                    focus-visible:ring-2 focus-visible:ring-ip-primary/30 focus-visible:border-ip-primary
                    transition-all duration-150
                  "
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ip-outline hover:text-ip-on-surface-variant transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs font-medium text-ip-error flex items-center gap-1">
                  <span>·</span> {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="
                w-full h-10 mt-1
                bg-ip-primary hover:bg-ip-on-primary-fixed-variant
                text-ip-on-primary font-semibold text-sm
                rounded-ip-base
                shadow-[0_2px_8px_rgba(70,72,212,0.25)] hover:shadow-[0_4px_16px_rgba(70,72,212,0.35)]
                transition-all duration-200
                focus-visible:ring-2 focus-visible:ring-ip-primary/40 focus-visible:ring-offset-2
              "
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating…
                </>
              ) : (
                'Set New Password & Continue'
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-[11px] font-medium text-ip-on-surface-variant text-center mt-6">
            © 2026 OnIts · Contact your administrator for help
          </p>
        </div>
      </div>
    </div>
  );
}
