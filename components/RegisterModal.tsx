'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, ArrowRight, ArrowLeft, Shield, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import AuthInput from './auth/AuthInput';
import PasswordStrengthIndicator from './auth/PasswordStrengthIndicator';
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

interface RegisterModalProps {
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

export default function RegisterModal({ onClose, onSwitchToLogin }: RegisterModalProps) {
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
  const router = useRouter();

  // ── Step 1 Realtime Validation ─────────────────────────────
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

  // ── Step 2 Realtime Validation ─────────────────────────────
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
    // Mark all step 1 fields as touched
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

    // Mark step 2 fields as touched
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
        router.refresh();
        onClose();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
        className="cs-panel w-full max-w-xl my-auto shadow-2xl relative"
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex justify-between items-start p-6 border-b border-[var(--cs-border)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--cs-teal)]" />
              <h2
                className="text-xl font-bold text-[var(--cs-text)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                CADET ENROLLMENT
              </h2>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--cs-teal)] font-mono">
              Step {step} of 2 — {step === 1 ? 'Cadet Identity & Credentials' : 'Emergency Contact Network'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--cs-muted)] hover:text-white transition-colors p-1"
            aria-label="Close registration dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Progress bar ───────────────────────────────────── */}
        <div className="h-0.5 bg-[var(--cs-border)]">
          <motion.div
            className="h-full bg-[var(--cs-teal)]"
            animate={{ width: step === 1 ? '50%' : '100%' }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* ── Error banner ───────────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-[var(--cs-red)] bg-[var(--cs-red)]/10 text-[var(--cs-red-bright)] px-6 py-3 text-xs font-mono flex items-start gap-2 overflow-hidden"
            >
              <span className="font-bold text-[10px] tracking-wider uppercase shrink-0 mt-0.5">[ERR]</span>
              <span className="leading-relaxed">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Step Content ───────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2 }}
              className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <AuthInput
                  label="Full Name"
                  id="reg-name"
                  required
                  placeholder="e.g. Amina Bello"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (error) setError('');
                  }}
                  onBlur={() => handleBlur('name')}
                  isTouched={touched.name}
                  error={touched.name ? nameValidation.message : undefined}
                  successMessage={nameValidation.message}
                />

                {/* Student ID */}
                <AuthInput
                  label="Student ID"
                  id="reg-student-id"
                  required
                  placeholder="2018/1/XXXXX"
                  value={formData.studentId}
                  onChange={(e) => {
                    setFormData({ ...formData, studentId: e.target.value });
                    if (error) setError('');
                  }}
                  onBlur={() => handleBlur('studentId')}
                  isTouched={touched.studentId}
                  error={touched.studentId ? studentIdValidation.message : undefined}
                  successMessage={studentIdValidation.message}
                  hint="Format: YYYY/X/XXXX (e.g. 2021/1/74921MS)"
                />

                {/* Email */}
                <AuthInput
                  label="Campus Email"
                  id="reg-email"
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
                  error={touched.email ? emailValidation.message : undefined}
                  successMessage={emailValidation.isCampus ? 'Verified institutional email' : 'Valid email format'}
                />

                {/* WhatsApp Number */}
                <AuthInput
                  label="WhatsApp Number"
                  id="reg-whatsapp"
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
                  error={touched.whatsapp ? whatsappValidation.message : undefined}
                  successMessage={whatsappValidation.message}
                  hint="International format without '+' (e.g. 2348012345678)"
                />

                {/* Password (spans both columns) */}
                <div className="sm:col-span-2 space-y-3">
                  <AuthInput
                    label="Password"
                    id="reg-password"
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
                    error={touched.password ? passwordValidation.message : undefined}
                    successMessage={passwordValidation.isValid ? 'Security criteria met' : undefined}
                  />

                  {/* Realtime Password Strength & Criteria Checklist */}
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
              key="step2"
              id="step2-form"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="p-6 space-y-5 max-h-[70vh] overflow-y-auto"
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
                    className="text-[var(--cs-teal)] hover:text-[var(--cs-teal-bright)] text-xs uppercase tracking-widest flex items-center gap-1 transition-colors shrink-0 ml-4 font-mono font-bold"
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
                            className="text-[var(--cs-muted)] hover:text-[var(--cs-red-bright)] transition-colors p-1"
                            aria-label={`Remove contact ${index + 1}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <AuthInput
                          label="Contact Name"
                          id={`contact-name-${index}`}
                          required={isPrimary}
                          value={contact.name}
                          onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                          onBlur={() => handleContactBlur(index, 'name')}
                          isTouched={cTouched.name}
                          error={cTouched.name ? cNameVal.message : undefined}
                          successMessage={cNameVal.isValid && contact.name ? 'Valid' : undefined}
                          placeholder="e.g. Dr. Bello (Parent)"
                          className="py-2 text-sm"
                        />

                        <AuthInput
                          label="Phone Number"
                          id={`contact-phone-${index}`}
                          type="tel"
                          required={isPrimary}
                          value={contact.phone}
                          onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                          onBlur={() => handleContactBlur(index, 'phone')}
                          isTouched={cTouched.phone}
                          error={cTouched.phone ? cPhoneVal.message : undefined}
                          successMessage={cPhoneVal.isValid && contact.phone ? 'Valid' : undefined}
                          placeholder="08012345678"
                          className="py-2 text-sm"
                        />

                        <AuthInput
                          label="WhatsApp (Optional)"
                          id={`contact-wa-${index}`}
                          type="tel"
                          value={contact.whatsapp}
                          onChange={(e) => handleContactChange(index, 'whatsapp', e.target.value)}
                          onBlur={() => handleContactBlur(index, 'whatsapp')}
                          isTouched={cTouched.whatsapp}
                          error={cTouched.whatsapp && contact.whatsapp ? cWaVal.message : undefined}
                          placeholder="2348XXXXXXXXX"
                          className="py-2 text-sm"
                        />

                        <AuthInput
                          label="Relationship"
                          id={`contact-rel-${index}`}
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

              {/* Hidden submit to allow Enter key submission */}
              <button type="submit" className="hidden" />
            </motion.form>
          )}
        </AnimatePresence>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div className="flex justify-between items-center gap-4 p-6 border-t border-[var(--cs-border)] bg-[var(--cs-surface)]">
          <button
            type="button"
            onClick={prevStep}
            className={`cs-btn-ghost px-4 ${step === 1 ? 'invisible pointer-events-none' : ''}`}
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
              form="step2-form"
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

        {/* Switch to Login Link */}
        {onSwitchToLogin && (
          <div className="px-6 pb-5 pt-2 text-center bg-[var(--cs-surface)]">
            <p className="text-xs text-[var(--cs-muted)] font-mono">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-[var(--cs-teal)] hover:text-[var(--cs-teal-bright)] font-bold uppercase tracking-wider ml-1 underline cursor-pointer transition-colors"
              >
                Log In
              </button>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
