import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, User, Loader2, ChevronLeftIcon, Grid2x2PlusIcon } from 'lucide-react';
import { motion } from 'framer-motion';

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2 bg-white text-slate-950 font-jakarta">
      <div className="bg-slate-50 relative hidden h-full flex-col overflow-hidden border-r border-slate-200 p-10 lg:flex">
        <div className="from-white absolute inset-0 z-10 bg-gradient-to-t to-transparent" />
        <div className="z-10 flex items-center gap-2">
          <Grid2x2PlusIcon className="size-6 text-slate-900" />
          <p className="text-xl font-bold tracking-tight">OnIts</p>
        </div>
        <div className="z-10 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-xl font-medium">
              &ldquo;This Platform has helped me to manage tasks and serve my
              team faster than ever before.&rdquo;
            </p>
            <footer className="text-sm font-semibold text-slate-600">
              ~ System Administrator
            </footer>
          </blockquote>
        </div>
        <div className="absolute inset-0 z-0">
          <LightBackgroundAnimation />
        </div>
      </div>
      <div className="relative flex min-h-screen flex-col justify-center p-4 bg-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        >
          <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,rgba(70,72,212,0.06)_0,rgba(70,72,212,0.02)_50%,rgba(70,72,212,0.01)_80%)] absolute top-0 right-0 h-[320px] w-[140px] -translate-y-[87.5px] rounded-full" />
          <div className="bg-[radial-gradient(50%_50%_at_50%_50%,rgba(70,72,212,0.04)_0,rgba(70,72,212,0.01)_80%,transparent_100%)] absolute top-0 right-0 h-[320px] w-[60px] translate-x-[5%] -translate-y-1/2 rounded-full" />
        </div>
        
        <Button variant="ghost" className="absolute top-7 left-5" asChild>
          <Link to="/">
            <ChevronLeftIcon className='size-4 mr-2' />
            Home
          </Link>
        </Button>
        
        <div className="mx-auto space-y-6 w-full max-w-[400px]">
          <div className="flex items-center gap-2 lg:hidden mb-4">
            <Grid2x2PlusIcon className="size-6 text-slate-900" />
            <p className="text-xl font-bold tracking-tight">OnIts</p>
          </div>
          
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight">
              Sign In
            </h1>
            <p className="text-slate-500 text-sm">
              Login to access your tasks and projects.
            </p>
          </div>
          


          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-slate-500 text-sm mb-2 text-center lg:text-left">
                Enter your email address to sign in
              </p>
              <div className="relative">
                <Input
                  id="identifier"
                  placeholder="you@onits.app or johndoe"
                  className={`peer pl-9 bg-white border-slate-200 ${errors.identifier ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  type="text"
                  autoComplete="username"
                  {...register('identifier')}
                />
                <div className="text-slate-400 pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
                  <User className="size-4" aria-hidden="true" />
                </div>
              </div>
              {errors.identifier && (
                <p className="text-xs font-medium text-red-500 mt-1">
                  {errors.identifier.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="relative">
                <Input
                  id="password"
                  placeholder="Password"
                  className={`peer pl-9 bg-white border-slate-200 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  type="password"
                  autoComplete="current-password"
                  {...register('password')}
                />
                <div className="text-slate-400 pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
                  <Lock className="size-4" aria-hidden="true" />
                </div>
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mt-4">
                {serverError}
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full mt-4 bg-slate-900 text-white hover:bg-slate-800">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          
          <p className="text-slate-500 mt-8 text-sm text-center">
            By clicking continue, you agree to our{' '}
            <a href="#" className="hover:text-slate-900 underline underline-offset-4">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="hover:text-slate-900 underline underline-offset-4">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}

function LightBackgroundAnimation() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Ambient Animated Blobs */}
      <motion.div
        animate={{
          x: [0, 80, 0],
          y: [0, -80, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-500/20 blur-[80px]"
      />
      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, 80, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-[10%] -right-[10%] w-[70%] h-[70%] rounded-full bg-indigo-500/20 blur-[80px]"
      />
      <motion.div
        animate={{
          x: [0, 40, -40, 0],
          y: [0, 60, -20, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] left-[30%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[80px]"
      />
      
      {/* Technical Dot Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-80" 
        style={{
          backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
          maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)'
        }}
      />
    </div>
  );
}


