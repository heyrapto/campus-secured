'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

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
        className="aero-panel w-full max-w-md p-8 relative"
      >
        <div className="flex justify-between items-center border-b border-[var(--aero-border)] pb-4 mb-6">
          <h2 className="text-xl font-bold text-[var(--aero-text)]" style={{ fontFamily: 'var(--font-hero)' }}>
            AUTH SYSTEM
          </h2>
          <button 
            onClick={onClose}
            className="text-[var(--aero-muted)] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="border border-[var(--aero-pink)] bg-[var(--aero-pink)]/10 text-[var(--aero-pink)] p-3 mb-6 text-sm">
            [ERROR] {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-[var(--aero-muted)] mb-2">Email Identity</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="aero-input"
              placeholder="student@futminna.edu.ng"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-[var(--aero-muted)] mb-2">Access Key</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="aero-input"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full aero-button mt-6"
          >
            {loading ? 'AUTHENTICATING...' : 'LOGIN_'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
