import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, User, Loader2, Zap } from 'lucide-react';

const loginSchema = z.object({
  identifier: z.string().min(1, { message: 'Email or username is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      await login(data.identifier, data.password);
      navigate('/dashboard');
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data
      ) {
        setServerError(String((err.response.data as { message: string }).message));
      } else {
        setServerError('Invalid email or password. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ip-surface">
        <Loader2 className="w-6 h-6 text-ip-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ip-surface p-6 relative overflow-hidden font-jakarta">
      {/* Ambient background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ip-primary/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-ip-tertiary/6 rounded-full blur-[100px] pointer-events-none" />

      {/* Card */}
      <div className="w-full max-w-[440px] bg-ip-surface-container-lowest rounded-ip-xl border border-ip-outline-variant shadow-[0_4px_24px_rgba(70,72,212,0.08)] relative z-10 overflow-hidden">

        {/* Top accent bar */}
        <div className="h-1 rounded-t-ip-xl bg-gradient-to-r from-ip-primary via-ip-primary-container to-ip-tertiary" />

        <div className="p-8">
          {/* Branding */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-12 h-12 rounded-ip-lg bg-gradient-to-br from-ip-primary to-ip-primary-container flex items-center justify-center mb-4 shadow-[0_4px_12px_rgba(70,72,212,0.3)]">
              <Zap className="w-6 h-6 text-ip-on-primary" strokeWidth={2.5} />
            </div>
            <h1 className="text-[28px] font-bold leading-tight tracking-tight text-ip-on-surface">
              OnIts
            </h1>
            <p className="text-ip-label-md text-sm font-medium text-ip-on-surface-variant mt-1 uppercase tracking-widest">
              Task Management System
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

            {/* Identifier field */}
            <div className="space-y-1.5">
              <label
                htmlFor="identifier"
                className="block text-[11px] font-semibold uppercase tracking-widest text-ip-on-surface"
              >
                Email or Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ip-outline" />
                <Input
                  id="identifier"
                  type="text"
                  placeholder="you@onits.app or johndoe"
                  autoComplete="username"
                  aria-describedby={errors.identifier ? 'identifier-error' : undefined}
                  className="
                    pl-10 h-10
                    bg-ip-surface-container-low
                    border-ip-outline-variant
                    text-ip-on-surface text-sm
                    placeholder:text-ip-on-surface-variant/40
                    rounded-ip-base
                    focus-visible:ring-2 focus-visible:ring-ip-primary/30 focus-visible:border-ip-primary
                    transition-all duration-150
                  "
                  {...register('identifier')}
                />
              </div>
              {errors.identifier && (
                <p id="identifier-error" className="text-xs font-medium text-ip-error flex items-center gap-1">
                  <span>·</span> {errors.identifier.message}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-[11px] font-semibold uppercase tracking-widest text-ip-on-surface"
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs font-medium text-ip-primary hover:text-ip-on-primary-fixed-variant transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ip-outline" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  className="
                    pl-10 h-10
                    bg-ip-surface-container-low
                    border-ip-outline-variant
                    text-ip-on-surface text-sm
                    placeholder:text-ip-on-surface-variant/40
                    rounded-ip-base
                    focus-visible:ring-2 focus-visible:ring-ip-primary/30 focus-visible:border-ip-primary
                    transition-all duration-150
                  "
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p id="password-error" className="text-xs font-medium text-ip-error flex items-center gap-1">
                  <span>·</span> {errors.password.message}
                </p>
              )}
            </div>

            {/* Server error banner */}
            {serverError && (
              <div className="text-sm text-ip-on-error-container bg-ip-error-container border border-ip-error/20 rounded-ip-base px-3 py-2.5 leading-snug">
                {serverError}
              </div>
            )}

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
                  Signing in…
                </>
              ) : (
                'Sign in to OnIts'
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-ip-label-md text-[11px] font-medium text-ip-on-surface-variant text-center mt-6">
            © 2026 OnIts · Contact your administrator for access
          </p>
        </div>
      </div>
    </div>
  );
}
