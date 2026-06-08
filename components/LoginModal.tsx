'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', { redirect: false, email, password });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.refresh();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="cs-panel w-full max-w-md p-8 relative"
      >
        <div className="flex justify-between items-center border-b border-[var(--cs-border)] pb-4 mb-6">
          <h2
            className="text-xl font-bold text-[var(--cs-text)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            AUTH SYSTEM
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--cs-muted)] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="border border-[var(--cs-red)] bg-[var(--cs-red)]/10 text-[var(--cs-red-bright)] p-3 mb-6 text-sm font-mono">
            [ERROR] {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="cs-overline block mb-2">Email Identity</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="cs-input"
              placeholder="student@futminna.edu.ng"
            />
          </div>
          <div>
            <label className="cs-overline block mb-2">Access Key</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="cs-input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full cs-btn-primary mt-4"
          >
            {loading ? 'AUTHENTICATING...' : 'LOG IN'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
