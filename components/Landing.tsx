'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

export default function Landing() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <header className="w-full p-6 flex justify-between items-center z-10 aero-container">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8" style={{ color: 'var(--aero-accent)' }} />
          <h1 className="text-xl font-bold tracking-widest text-[var(--aero-text)]" style={{ fontFamily: 'var(--font-hero)' }}>
            CAMPUS SHIELD
          </h1>
        </div>
        <div className="flex items-center gap-6 text-[13px] text-[var(--aero-muted)] tracking-widest uppercase">
          <button onClick={() => setShowLogin(true)} className="hover:text-[var(--aero-accent-strong)] transition-colors">
            Log in
          </button>
          <button onClick={() => setShowRegister(true)} className="hover:text-[var(--aero-accent-strong)] transition-colors">
            Register
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-start justify-center p-6 z-10 aero-container pt-20">
        <div className="grid md:grid-cols-2 gap-12 w-full">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <h2 
              className="text-6xl md:text-[5.5rem] leading-[1.05] font-extrabold text-[var(--aero-text)]" 
              style={{ fontFamily: 'var(--font-hero)' }}
            >
              Protect your campus.
            </h2>
            <div className="border-l border-[var(--aero-border)] pl-6 py-2 space-y-4 max-w-lg">
              <p className="text-lg text-[var(--aero-muted)]">
                The proactive emergency response system. Trigger SOS alerts, notify contacts, and deploy security guards within seconds.
              </p>
              <p className="text-sm text-[var(--aero-accent)]">
                Bring safety directly to your phone. Connect with WhatsApp.
              </p>
            </div>
            <div className="pt-4 flex gap-4">
              <button 
                onClick={() => setShowRegister(true)}
                className="aero-button"
              >
                GET STARTED &rarr;
              </button>
              <button 
                onClick={() => setShowLogin(true)}
                className="aero-button-secondary"
              >
                Log In
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="aero-panel p-8 flex flex-col space-y-6"
          >
            <div className="text-[10px] text-[var(--aero-muted)] uppercase tracking-widest mb-2 border-b border-[var(--aero-border)] pb-4">
              System Capabilities
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-[var(--aero-pink)] text-xs mt-1">01</span>
                <div>
                  <h3 className="font-bold text-[var(--aero-text)]">Live SOS Tracking</h3>
                  <p className="text-sm text-[var(--aero-muted)] mt-1">
                    Send real-time GPS coordinates directly to campus security and emergency contacts.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <span className="text-[var(--aero-pink)] text-xs mt-1">02</span>
                <div>
                  <h3 className="font-bold text-[var(--aero-text)]">WhatsApp Integration</h3>
                  <p className="text-sm text-[var(--aero-muted)] mt-1">
                    Operate via WhatsApp bots. Quick commands for fast reporting in low-bandwidth areas.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-[var(--aero-pink)] text-xs mt-1">03</span>
                <div>
                  <h3 className="font-bold text-[var(--aero-text)]">Incident Broadcasts</h3>
                  <p className="text-sm text-[var(--aero-muted)] mt-1">
                    Receive mass campus-wide alerts when critical incidents are ongoing.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="w-full border-t border-[var(--aero-border)] mt-20">
        <div className="aero-container py-6 flex justify-between text-xs text-[var(--aero-muted)] font-mono">
          <span>Campus Shield CERS v2.0. Protect your students.</span>
          <span className="text-[var(--aero-text)]">system: operational</span>
        </div>
      </footer>

      <AnimatePresence>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
        {showRegister && <RegisterModal onClose={() => setShowRegister(false)} />}
      </AnimatePresence>
    </div>
  );
}
