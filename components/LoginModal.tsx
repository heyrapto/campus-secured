'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { X, Lock, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AuthInput from './auth/AuthInput';
import { validateEmail, validateLoginPassword } from '@/lib/validation';

interface LoginModalProps {
  onClose: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginModal({ onClose, onSwitchToRegister }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Realtime validation checks
  const emailValidation = validateEmail(email);
  const passwordValidation = validateLoginPassword(password);
  const isFormValid = emailValidation.isValid && passwordValidation.isValid;

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all as touched on submit attempt
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
        router.refresh();
        onClose();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
        className="cs-panel w-full max-w-md p-8 relative shadow-2xl"
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b border-[var(--cs-border)] pb-4 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--cs-teal)]" />
              <h2
                className="text-xl font-bold text-[var(--cs-text)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                SECURE LOGIN
              </h2>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--cs-muted)] font-mono">
              Identity Verification
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--cs-muted)] hover:text-white transition-colors p-1"
            aria-label="Close login dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global / Server Error Banner */}
        {error && (
          <div className="border border-[var(--cs-red)] bg-[var(--cs-red)]/10 text-[var(--cs-red-bright)] p-3 mb-6 text-xs font-mono flex items-start gap-2">
            <span className="font-bold text-[10px] tracking-wider uppercase shrink-0 mt-0.5">[ERROR]</span>
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email Field with Realtime Validation */}
          <AuthInput
            label="Email Identity"
            id="login-email"
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
            error={touched.email ? emailValidation.message : undefined}
            successMessage={emailValidation.isCampus ? 'Verified institutional email' : 'Valid email format'}
            placeholder="student@futminna.edu.ng"
            hint="Enter your registered campus or personal email"
          />

          {/* Password Field with Realtime Validation */}
          <AuthInput
            label="Password"
            id="login-password"
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
            error={touched.password ? passwordValidation.message : undefined}
            successMessage={password.length >= 6 ? 'Password entered' : undefined}
            placeholder="••••••••"
          />

          {/* Submit Button */}
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

        {/* Switch to Register link */}
        {onSwitchToRegister && (
          <div className="mt-6 pt-5 border-t border-[var(--cs-border)] text-center">
            <p className="text-xs text-[var(--cs-muted)] font-mono">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-[var(--cs-teal)] hover:text-[var(--cs-teal-bright)] font-bold uppercase tracking-wider ml-1 underline cursor-pointer transition-colors"
              >
                Register
              </button>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
