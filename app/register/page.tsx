'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Plus, Trash2, ArrowRight, ArrowLeft, UserPlus } from 'lucide-react';
import AuthInput from '@/components/auth/AuthInput';
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator';
import {
  validateEmail,
  validateStudentId,
  validatePassword,
  validateName,
  validatePhone,
} from '@/lib/validation';

interface Contact {
  name: string;
  phone: string;
  whatsapp: string;
  relationship: string;
}

export default function RegisterPage() {
  const { status } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    password: '',
    whatsapp: '',
  });

  const [touched, setTouched] = useState({
    name: false,
    studentId: false,
    email: false,
    password: false,
    whatsapp: false,
  });

  const [contacts, setContacts] = useState<Contact[]>([
    { name: '', phone: '', whatsapp: '', relationship: '' },
  ]);

  const [contactsTouched, setContactsTouched] = useState<
    Array<{ name: boolean; phone: boolean; whatsapp: boolean }>
  >([{ name: false, phone: false, whatsapp: false }]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Realtime validation
  const nameValidation = validateName(formData.name);
  const studentIdValidation = validateStudentId(formData.studentId);
  const emailValidation = validateEmail(formData.email);
  const passwordValidation = validatePassword(formData.password);
  const whatsappValidation = validatePhone(formData.whatsapp, true);

  const isStep1Valid =
    nameValidation.isValid &&
    studentIdValidation.isValid &&
    emailValidation.isValid &&
    passwordValidation.isValid &&
    whatsappValidation.isValid;

  const contact1NameValid = validateName(contacts[0]?.name || '');
  const contact1PhoneValid = validatePhone(contacts[0]?.phone || '', true);
  const isStep2Valid = contact1NameValid.isValid && contact1PhoneValid.isValid;

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleContactBlur = (index: number, field: 'name' | 'phone' | 'whatsapp') => {
    setContactsTouched((prev) => {
      const updated = [...prev];
      if (!updated[index]) {
        updated[index] = { name: false, phone: false, whatsapp: false };
      }
      updated[index] = { ...updated[index], [field]: true };
      return updated;
    });
  };

  const handleContactChange = (index: number, field: keyof Contact, value: string) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    setContacts(updated);
    if (error) setError('');
  };

  const addContact = () => {
    if (contacts.length < 3) {
      setContacts([...contacts, { name: '', phone: '', whatsapp: '', relationship: '' }]);
      setContactsTouched([...contactsTouched, { name: false, phone: false, whatsapp: false }]);
    }
  };

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
    setContactsTouched(contactsTouched.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    setError('');
    setTouched({
      name: true,
      studentId: true,
      email: true,
      password: true,
      whatsapp: true,
    });

    if (!isStep1Valid) {
      setError('Please resolve all validation errors before proceeding.');
      return;
    }

    setStep(2);
  };

  const prevStep = () => {
    setError('');
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setContactsTouched(
      contacts.map(() => ({ name: true, phone: true, whatsapp: true }))
    );

    if (!isStep2Valid) {
      setError('At least one primary emergency contact with valid name and phone is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          contacts: contacts.filter((c) => c.name && c.phone),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      const loginRes = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (loginRes?.error) {
        setError('Registered — but auto-login failed. Please log in manually.');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
    } finally {
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

      {/* Main Register Card */}
      <main className="w-full max-w-xl mx-auto my-8">
        <div className="cs-panel shadow-2xl relative">
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-[var(--cs-border)] space-y-1">
            <div className="flex items-center justify-between">
              <h1
                className="text-2xl font-bold text-[var(--cs-text)] tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                CADET ENROLLMENT
              </h1>
              <span className="cs-pill-teal">
                Step {step} of 2
              </span>
            </div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--cs-teal)] font-mono">
              {step === 1 ? 'Cadet Identity & Credentials' : 'Emergency Contact Network'}
            </p>
          </div>

          {/* Progress bar */}
          <div className="h-0.5 bg-[var(--cs-border)]">
            <motion.div
              className="h-full bg-[var(--cs-teal)]"
              animate={{ width: step === 1 ? '50%' : '100%' }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-b border-[var(--cs-red)] bg-[var(--cs-red)]/10 text-[var(--cs-red-bright)] px-6 sm:px-8 py-3 text-xs font-mono flex items-start gap-2 overflow-hidden"
              >
                <span className="font-bold text-[10px] tracking-wider uppercase shrink-0 mt-0.5">[ERR]</span>
                <span className="leading-relaxed">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 1 Content */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="page-step1"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.2 }}
                className="p-6 sm:p-8 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AuthInput
                    label="Full Name"
                    id="page-reg-name"
                    required
                    placeholder="e.g. Amina Bello"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (error) setError('');
                    }}
                    onBlur={() => handleBlur('name')}
                    isTouched={touched.name}
                    isValid={nameValidation.isValid}
                    error={touched.name ? nameValidation.error : undefined}
                  />

                  <AuthInput
                    label="Student ID"
                    id="page-reg-student-id"
                    required
                    placeholder="2018/1/XXXXX"
                    value={formData.studentId}
                    onChange={(e) => {
                      setFormData({ ...formData, studentId: e.target.value });
                      if (error) setError('');
                    }}
                    onBlur={() => handleBlur('studentId')}
                    isTouched={touched.studentId}
                    isValid={studentIdValidation.isValid}
                    error={touched.studentId ? studentIdValidation.error : undefined}
                    hint="Format: YYYY/X/XXXX (e.g. 2021/1/74921MS)"
                  />

                  <AuthInput
                    label="Campus Email"
                    id="page-reg-email"
                    type="email"
                    required
                    placeholder="you@futminna.edu.ng"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (error) setError('');
                    }}
                    onBlur={() => handleBlur('email')}
                    isTouched={touched.email}
                    isValid={emailValidation.isValid}
                    error={touched.email ? emailValidation.error : undefined}
                  />

                  <AuthInput
                    label="WhatsApp Number"
                    id="page-reg-whatsapp"
                    type="tel"
                    required
                    placeholder="2348XXXXXXXXX"
                    value={formData.whatsapp}
                    onChange={(e) => {
                      setFormData({ ...formData, whatsapp: e.target.value });
                      if (error) setError('');
                    }}
                    onBlur={() => handleBlur('whatsapp')}
                    isTouched={touched.whatsapp}
                    isValid={whatsappValidation.isValid}
                    error={touched.whatsapp ? whatsappValidation.error : undefined}
                    hint="International format without '+' (e.g. 2348012345678)"
                  />

                  <div className="sm:col-span-2 space-y-3">
                    <AuthInput
                      label="Password"
                      id="page-reg-password"
                      isPassword
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (error) setError('');
                      }}
                      onBlur={() => handleBlur('password')}
                      isTouched={touched.password}
                      isValid={passwordValidation.isValid}
                      error={touched.password ? passwordValidation.error : undefined}
                    />

                    <PasswordStrengthIndicator
                      validation={passwordValidation}
                      showWhenEmpty={touched.password}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.form
                key="page-step2"
                id="page-step2-form"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="p-6 sm:p-8 space-y-5"
                noValidate
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-[var(--cs-text)]">
                      EMERGENCY DISPATCH RECIPIENTS
                    </p>
                    <p className="text-xs text-[var(--cs-muted)] font-mono mt-0.5">
                      Will receive live GPS tracking links on SOS trigger. At least 1 primary contact required.
                    </p>
                  </div>
                  {contacts.length < 3 && (
                    <button
                      type="button"
                      onClick={addContact}
                      className="text-[var(--cs-teal)] hover:text-[var(--cs-teal-bright)] text-xs uppercase tracking-widest flex items-center gap-1 transition-colors shrink-0 ml-4 font-mono font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {contacts.map((contact, index) => {
                    const isPrimary = index === 0;
                    const cTouched = contactsTouched[index] || { name: false, phone: false, whatsapp: false };
                    const cNameVal = validateName(contact.name);
                    const cPhoneVal = validatePhone(contact.phone, isPrimary || Boolean(contact.name));
                    const cWaVal = validatePhone(contact.whatsapp, false);

                    return (
                      <div
                        key={index}
                        className="p-4 bg-[var(--cs-surface-alt)] border border-[var(--cs-border)] relative space-y-3"
                      >
                        <div className="flex justify-between items-center border-b border-[var(--cs-border)] pb-2">
                          <span className="cs-overline text-[9px] text-[var(--cs-teal)]">
                            {isPrimary ? 'PRIMARY EMERGENCY CONTACT' : `CONTACT NODE #${index + 1}`}
                          </span>
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => removeContact(index)}
                              className="text-[var(--cs-muted)] hover:text-[var(--cs-red-bright)] transition-colors p-1 cursor-pointer"
                              aria-label={`Remove contact ${index + 1}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <AuthInput
                            label="Contact Name"
                            id={`page-contact-name-${index}`}
                            required={isPrimary}
                            value={contact.name}
                            onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                            onBlur={() => handleContactBlur(index, 'name')}
                            isTouched={cTouched.name}
                            isValid={cNameVal.isValid}
                            error={cTouched.name ? cNameVal.error : undefined}
                            placeholder="e.g. Dr. Bello (Parent)"
                            className="py-2 text-sm"
                          />

                          <AuthInput
                            label="Phone Number"
                            id={`page-contact-phone-${index}`}
                            type="tel"
                            required={isPrimary}
                            value={contact.phone}
                            onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                            onBlur={() => handleContactBlur(index, 'phone')}
                            isTouched={cTouched.phone}
                            isValid={cPhoneVal.isValid}
                            error={cTouched.phone ? cPhoneVal.error : undefined}
                            placeholder="08012345678"
                            className="py-2 text-sm"
                          />

                          <AuthInput
                            label="WhatsApp (Optional)"
                            id={`page-contact-wa-${index}`}
                            type="tel"
                            value={contact.whatsapp}
                            onChange={(e) => handleContactChange(index, 'whatsapp', e.target.value)}
                            onBlur={() => handleContactBlur(index, 'whatsapp')}
                            isTouched={cTouched.whatsapp}
                            isValid={cWaVal.isValid}
                            error={cTouched.whatsapp && contact.whatsapp ? cWaVal.error : undefined}
                            placeholder="2348XXXXXXXXX"
                            className="py-2 text-sm"
                          />

                          <AuthInput
                            label="Relationship"
                            id={`page-contact-rel-${index}`}
                            value={contact.relationship}
                            onChange={(e) => handleContactChange(index, 'relationship', e.target.value)}
                            placeholder="e.g. Parent, Guardian, Roommate"
                            className="py-2 text-sm"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button type="submit" className="hidden" />
              </motion.form>
            )}
          </AnimatePresence>

          {/* Footer Controls */}
          <div className="flex justify-between items-center gap-4 p-6 sm:p-8 border-t border-[var(--cs-border)] bg-[var(--cs-surface)]">
            <button
              type="button"
              onClick={prevStep}
              className={`cs-btn-ghost px-4 cursor-pointer ${step === 1 ? 'invisible pointer-events-none' : ''}`}
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>

            {step === 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="cs-btn-primary cursor-pointer"
              >
                Continue <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button
                type="submit"
                form="page-step2-form"
                disabled={loading}
                className="cs-btn-primary cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    INITIALIZING ACCOUNT...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    CREATE ACCOUNT
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Switch to Login */}
          <div className="px-6 sm:px-8 pb-6 pt-2 text-center bg-[var(--cs-surface)]">
            <p className="text-xs text-[var(--cs-muted)] font-mono">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-[var(--cs-teal)] hover:text-[var(--cs-teal-bright)] font-bold uppercase tracking-wider ml-1 underline transition-colors"
              >
                Log In
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
