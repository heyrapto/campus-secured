'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, ArrowLeft } from 'lucide-react';
import AuthInput from '@/components/auth/AuthInput';
import { validateEmail, validateLoginPassword } from '@/lib/validation';

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Realtime validation
  const emailValidation = validateEmail(email);
  const passwordValidation = validateLoginPassword(password);
  const isFormValid = emailValidation.isValid && passwordValidation.isValid;

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ email: true, password: true });

    if (!isFormValid) {
      setError('Please resolve all validation errors before logging in.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', { redirect: false, email, password });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-8">
      {/* Top Bar */}
      <header className="w-full max-w-5xl mx-auto flex justify-between items-center py-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-[var(--cs-teal)]/10 flex items-center justify-center group-hover:bg-[var(--cs-teal)]/20 transition-all duration-300">
            <Shield className="w-4 h-4 text-[var(--cs-teal)]" />
          </div>
          <span
            className="text-sm font-light text-[var(--cs-text)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Campus Shield
          </span>
        </Link>

        <Link
          href="/"
          className="cs-btn-ghost text-xs px-3 py-1.5 min-h-0 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-md mx-auto my-8">
        <div className="cs-panel p-8 sm:p-10 shadow-2xl relative">
          {/* Header */}
          <div className="border-b border-[var(--cs-border)] pb-5 mb-6 space-y-1">
            <div className="flex items-center justify-between">
              <h1
                className="text-2xl font-bold text-[var(--cs-text)] tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                SECURE LOGIN
              </h1>
              <span className="cs-pill-teal">CERS v2.0</span>
            </div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--cs-muted)] font-mono">
              Identity Verification & Access
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="border border-[var(--cs-red)] bg-[var(--cs-red)]/10 text-[var(--cs-red-bright)] p-3 mb-6 text-xs font-mono flex items-start gap-2">
              <span className="font-bold text-[10px] tracking-wider uppercase shrink-0 mt-0.5">[ERROR]</span>
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <AuthInput
              label="Email Identity"
              id="page-login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              onBlur={() => handleBlur('email')}
              isTouched={touched.email}
              isValid={emailValidation.isValid}
              error={touched.email ? emailValidation.error : undefined}
              placeholder="student@futminna.edu.ng"
              hint="Enter your registered campus or personal email"
            />

            <AuthInput
              label="Password"
              id="page-login-password"
              isPassword
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              onBlur={() => handleBlur('password')}
              isTouched={touched.password}
              isValid={passwordValidation.isValid}
              error={touched.password ? passwordValidation.error : undefined}
              placeholder="••••••••"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full cs-btn-primary mt-6 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  AUTHENTICATING...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  LOG IN
                </span>
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="mt-8 pt-6 border-t border-[var(--cs-border)] text-center">
            <p className="text-xs text-[var(--cs-muted)] font-mono">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-[var(--cs-teal)] hover:text-[var(--cs-teal-bright)] font-bold uppercase tracking-wider ml-1 underline transition-colors"
              >
                Register Cadet
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer telemetry */}
      <footer className="w-full max-w-5xl mx-auto py-4 text-center text-xs font-mono text-[var(--cs-muted)]">
        <span>system.status: <span className="text-[var(--cs-teal)]">operational</span> · 256-bit encrypted</span>
      </footer>
    </div>
  );
}
