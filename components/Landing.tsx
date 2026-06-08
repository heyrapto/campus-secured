'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  MessageCircle,
  MapPin,
  Radio,
  UserCheck,
  BellRing,
  ArrowRight,
  Menu,
} from 'lucide-react';
import Marquee from 'react-fast-marquee';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

/* ─── Data ──────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: BellRing,
    label: 'One-Tap SOS',
    desc: 'Hit the SOS button and your live GPS coordinates are instantly broadcast to campus security and your registered emergency contacts.',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp Integration',
    desc: 'No internet? No problem. Send HELP, SOS, or SAFE directly through WhatsApp. The bot routes every message to the right responders.',
  },
  {
    icon: MapPin,
    label: 'Live GPS Tracking',
    desc: 'Security guards can follow your real-time movement on a live map until you are confirmed safe or the incident is resolved.',
  },
  {
    icon: Radio,
    label: 'Campus-Wide Broadcasts',
    desc: 'Admins push emergency alerts instantly to every registered student on campus — robbery, fire, lockdown — within seconds.',
  },
  {
    icon: UserCheck,
    label: 'Emergency Contacts',
    desc: 'Register up to three emergency contacts. They receive a shareable tracking link the moment you trigger an SOS.',
  },
  {
    icon: Shield,
    label: 'Role-Based Access',
    desc: 'Students report. Guards respond. Admins broadcast. Separate dashboards and permissions keep each role focused.',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Register your profile',
    desc: 'Create an account with your student ID, WhatsApp number, and up to three emergency contacts. Takes under two minutes.',
  },
  {
    num: '02',
    title: 'Enable location access',
    desc: 'Allow the app to access your GPS so that when you trigger SOS, your exact position is captured and shared immediately.',
  },
  {
    num: '03',
    title: 'Trigger SOS when needed',
    desc: 'Open the app, choose the incident type, and hit TRIGGER SOS. Security is notified and your contacts get a live tracking link.',
  },
];

/* ─── Sections ───────────────────────────────────────────────── */

function Ticker() {
  const items = [
    'sos.ready', 'whatsapp.linked', 'gps.enabled', 'security.dispatched',
    'contacts.notified', 'campus.protected', 'alert.active', 'tracking.live',
  ];

  return (
    <div className="border-y border-[var(--cs-border)] overflow-hidden py-3 bg-[var(--cs-surface)]/50">
      <Marquee speed={40} gradient={false} autoFill>
        {items.map((item, i) => (
          <span key={i} className="text-xs font-mono uppercase tracking-widest text-[var(--cs-muted)] flex items-center gap-3 px-6">
            <span className="inline-block w-1 h-1 rounded-full bg-[var(--cs-teal)]" />
            {item}
          </span>
        ))}
      </Marquee>
    </div>
  );
}

function HeroSection({ onRegister, onLogin }: { onRegister: () => void; onLogin: () => void }) {
  return (
    <section className="cs-container py-24 grid md:grid-cols-2 gap-16 items-center">
      {/* Left copy */}
      <div className="space-y-8">
        <div className="cs-accent-label">Campus Emergency Response System</div>

        <h2
          className="text-5xl md:text-[4.5rem] leading-[1.06] font-extrabold text-[var(--cs-text)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Protect your campus.
          <br />
          <span style={{ color: 'var(--cs-teal)' }}>In seconds.</span>
        </h2>

        <div className="border-l-2 border-[var(--cs-border)] pl-5 space-y-3">
          <p className="text-lg text-[var(--cs-muted)] leading-relaxed max-w-md">
            Trigger SOS alerts, share live GPS, notify emergency contacts, and receive campus-wide broadcasts — all from one app.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 pt-2">
          <button onClick={onRegister} className="cs-btn-primary">
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={onLogin} className="cs-btn-ghost">
            Log In
          </button>
        </div>
      </div>

      {/* Right panel — live system status card */}
      <div className="cs-panel p-0 overflow-hidden">
        <div className="border-b border-[var(--cs-border)] px-5 py-3 flex items-center gap-2">
          <span className="cs-overline">system status</span>
          <span className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-[var(--cs-teal)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--cs-teal)] animate-pulse" />
            operational
          </span>
        </div>

        <div className="p-5 space-y-0 font-mono text-sm divide-y divide-[var(--cs-border)]">
          {[
            { key: 'sos.handler',      val: 'active',   pill: 'teal' },
            { key: 'whatsapp.bot',     val: 'linked',   pill: 'teal' },
            { key: 'gps.tracking',     val: 'ready',    pill: 'teal' },
            { key: 'broadcast.queue',  val: 'standby',  pill: null   },
            { key: 'security.nodes',   val: '3 online', pill: null   },
          ].map(row => (
            <div key={row.key} className="flex items-center justify-between py-3">
              <span className="text-[var(--cs-muted)] text-xs">{row.key}</span>
              {row.pill ? (
                <span className="cs-pill-teal">{row.val}</span>
              ) : (
                <span className="text-[var(--cs-text)] text-xs">{row.val}</span>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--cs-border)] px-5 py-3 text-xs font-mono text-[var(--cs-muted)]">
          <span className="text-[var(--cs-teal)]">&#9632;</span>&nbsp; Last updated: just now
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="border-t border-[var(--cs-border)] py-24">
      <div className="cs-container space-y-14">
        <div className="space-y-3">
          <div className="cs-accent-label">What it does</div>
          <h3
            className="text-4xl md:text-5xl font-extrabold text-[var(--cs-text)] max-w-xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Everything security needs.
          </h3>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--cs-border)]">
          {FEATURES.map(({ icon: Icon, label, desc }, i) => (
            <div
              key={label}
              className="bg-[var(--cs-bg)] p-7 space-y-4"
            >
              <div className="w-10 h-10 border border-[var(--cs-teal)]/40 bg-[var(--cs-teal)]/8 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[var(--cs-teal)]" />
              </div>
              <h4 className="font-bold text-[var(--cs-text)]">{label}</h4>
              <p className="text-sm text-[var(--cs-muted)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-t border-[var(--cs-border)] py-24">
      <div className="cs-container grid md:grid-cols-2 gap-16 items-start">
        {/* Left */}
        <div className="space-y-4 md:sticky md:top-24">
          <div className="cs-accent-label">After registration</div>
          <h3
            className="text-4xl md:text-5xl font-extrabold text-[var(--cs-text)] leading-[1.08]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Your phone becomes a panic button.
          </h3>
          <p className="text-[var(--cs-muted)] leading-relaxed max-w-sm">
            Campus Shield keeps your safety network one tap away — even when you have no time to type.
          </p>
        </div>

        {/* Right steps */}
        <div className="space-y-0 divide-y divide-[var(--cs-border)]">
          {STEPS.map(({ num, title, desc }, i) => (
            <div
              key={num}
              className="flex gap-6 py-8"
            >
              <span
                className="text-[var(--cs-red)] font-mono text-xs font-bold mt-1 shrink-0"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {num}
              </span>
              <div className="space-y-2">
                <h4 className="font-bold text-[var(--cs-text)] text-lg">{title}</h4>
                <p className="text-sm text-[var(--cs-muted)] leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({ onRegister }: { onRegister: () => void }) {
  return (
    <section className="border-t border-[var(--cs-border)] py-24">
      <div className="cs-container">
        <div className="cs-panel p-10 md:p-14 grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <h3
              className="text-4xl md:text-5xl font-extrabold text-[var(--cs-text)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Ready to protect your campus?
            </h3>
            <p className="text-[var(--cs-muted)]">
              Join Campus Shield today. Registration takes under two minutes and your safety network is live immediately.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row md:flex-col gap-4">
            <button onClick={onRegister} className="cs-btn-primary w-full justify-center">
              Create Account <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="cs-btn-ghost w-full justify-center"
            >
              <Shield className="w-4 h-4" /> View Source
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--cs-border)] bg-[var(--cs-surface)]/40">
      <div className="cs-container py-10">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[var(--cs-teal)]" />
              <span
                className="font-bold tracking-widest text-sm text-[var(--cs-text)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                CAMPUS SHIELD
              </span>
            </div>
            <p className="text-xs text-[var(--cs-muted)] max-w-xs leading-relaxed">
              Proactive emergency response for Nigerian university campuses. Built with Next.js, MongoDB, and WhatsApp.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
            <div className="space-y-3">
              <p className="cs-overline">Platform</p>
              <ul className="space-y-2 text-[var(--cs-muted)]">
                <li><a href="#features" className="hover:text-[var(--cs-teal)] transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-[var(--cs-teal)] transition-colors">How it works</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <p className="cs-overline">Access</p>
              <ul className="space-y-2 text-[var(--cs-muted)]">
                <li><button className="hover:text-[var(--cs-teal)] transition-colors">Student Login</button></li>
                <li><button className="hover:text-[var(--cs-teal)] transition-colors">Register</button></li>
              </ul>
            </div>
            <div className="space-y-3">
              <p className="cs-overline">System</p>
              <ul className="space-y-2 text-[var(--cs-muted)]">
                <li>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--cs-teal)]" />
                    Operational
                  </span>
                </li>
                <li>CERS v2.0</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--cs-border)] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[var(--cs-muted)] font-mono">
          <span>Campus Shield CERS v2.0. All rights reserved.</span>
          <span>system.status: <span className="text-[var(--cs-teal)]">operational</span></span>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */

export default function Landing() {
  const [showLogin, setShowLogin]       = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-[var(--cs-border)] bg-[var(--cs-bg)]/90 backdrop-blur-sm">
        <div className="cs-container flex justify-between items-center py-4">
          <div className="flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-[var(--cs-teal)]" />
            <span
              className="font-bold tracking-widest text-base text-[var(--cs-text)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              CAMPUS SHIELD
            </span>
          </div>

          <nav className="hidden sm:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-[var(--cs-muted)]">
            <a href="#features" className="hover:text-[var(--cs-teal)] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[var(--cs-teal)] transition-colors">How it works</a>
          </nav>

          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => setShowLogin(true)}
              className="cs-btn-ghost text-xs py-0 px-4 min-h-9"
            >
              Log In
            </button>
            <button
              onClick={() => setShowRegister(true)}
              className="cs-btn-primary text-xs py-0 px-4 min-h-9"
            >
              Register
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="sm:hidden text-[var(--cs-text)] p-2"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Dropdown */}
        {showMobileMenu && (
          <div className="sm:hidden border-t border-[var(--cs-border)] bg-[var(--cs-bg)] p-4 flex flex-col gap-4 text-xs font-bold uppercase tracking-widest">
            <a href="#features" onClick={() => setShowMobileMenu(false)} className="text-[var(--cs-muted)] hover:text-[var(--cs-teal)] p-2">Features</a>
            <a href="#how-it-works" onClick={() => setShowMobileMenu(false)} className="text-[var(--cs-muted)] hover:text-[var(--cs-teal)] p-2">How it works</a>
            <div className="flex flex-col gap-3 mt-2 border-t border-[var(--cs-border)] pt-4">
              <button
                onClick={() => { setShowLogin(true); setShowMobileMenu(false); }}
                className="cs-btn-ghost w-full min-h-10"
              >
                Log In
              </button>
              <button
                onClick={() => { setShowRegister(true); setShowMobileMenu(false); }}
                className="cs-btn-primary w-full min-h-10"
              >
                Register
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Sections */}
      <HeroSection onRegister={() => setShowRegister(true)} onLogin={() => setShowLogin(true)} />
      
      {/* Ticker */}
      <Ticker />

      <FeaturesSection />
      <HowItWorksSection />
      <CTASection onRegister={() => setShowRegister(true)} />
      <Footer />

      {/* Modals */}
      <AnimatePresence>
        {showLogin    && <LoginModal    onClose={() => setShowLogin(false)} />}
        {showRegister && <RegisterModal onClose={() => setShowRegister(false)} />}
      </AnimatePresence>
    </div>
  );
}
