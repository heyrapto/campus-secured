'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function RegisterModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '', studentId: '', email: '', password: '', whatsapp: ''
  });
  const [contacts, setContacts] = useState([
    { name: '', phone: '', whatsapp: '', relationship: '' }
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleContactChange = (index: number, field: string, value: string) => {
    const updated = [...contacts];
    (updated[index] as any)[field] = value;
    setContacts(updated);
  };

  const addContact = () => {
    if (contacts.length < 3) {
      setContacts([...contacts, { name: '', phone: '', whatsapp: '', relationship: '' }]);
    }
  };

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          contacts: contacts.filter(c => c.name && c.phone)
        })
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-y-auto py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="cs-panel w-full max-w-2xl p-8 relative"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[var(--cs-border)] pb-4 mb-6">
          <h2
            className="text-xl font-bold text-[var(--cs-text)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            NEW RECRUIT
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="cs-overline block mb-2">Full Name</label>
              <input
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="cs-input"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="cs-overline block mb-2">Student ID</label>
              <input
                required
                value={formData.studentId}
                onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                className="cs-input"
                placeholder="2018/1/XXXX"
              />
            </div>
            <div>
              <label className="cs-overline block mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="cs-input"
                placeholder="you@futminna.edu.ng"
              />
            </div>
            <div>
              <label className="cs-overline block mb-2">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="cs-input"
                placeholder="••••••••"
              />
            </div>
            <div className="md:col-span-2">
              <label className="cs-overline block mb-2">WhatsApp Number</label>
              <input
                required
                value={formData.whatsapp}
                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                className="cs-input"
                placeholder="2348XXXXXXXXX (international format)"
              />
              <p className="cs-overline mt-2 text-[var(--cs-teal)]">
                Required for emergency broadcasts
              </p>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="border-t border-[var(--cs-border)] pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--cs-teal)]">
                Emergency Contacts
              </h3>
              {contacts.length < 3 && (
                <button
                  type="button"
                  onClick={addContact}
                  className="text-[var(--cs-teal)] hover:text-[var(--cs-teal-bright)] text-xs uppercase tracking-widest flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add Contact
                </button>
              )}
            </div>

            <div className="space-y-3">
              {contacts.map((contact, index) => (
                <div
                  key={index}
                  className="p-4 bg-[var(--cs-surface-alt)] border border-[var(--cs-border)] relative"
                >
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeContact(index)}
                      className="absolute top-2 right-2 text-[var(--cs-muted)] hover:text-[var(--cs-red-bright)] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      placeholder="Contact Name"
                      required={index === 0}
                      value={contact.name}
                      onChange={e => handleContactChange(index, 'name', e.target.value)}
                      className="cs-input py-2 text-sm"
                    />
                    <input
                      placeholder="Phone Number"
                      required={index === 0}
                      value={contact.phone}
                      onChange={e => handleContactChange(index, 'phone', e.target.value)}
                      className="cs-input py-2 text-sm"
                    />
                    <input
                      placeholder="WhatsApp (Optional)"
                      value={contact.whatsapp}
                      onChange={e => handleContactChange(index, 'whatsapp', e.target.value)}
                      className="cs-input py-2 text-sm"
                    />
                    <input
                      placeholder="Relationship (e.g. Parent)"
                      value={contact.relationship}
                      onChange={e => handleContactChange(index, 'relationship', e.target.value)}
                      className="cs-input py-2 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full cs-btn-primary mt-4"
          >
            {loading ? 'INITIALIZING...' : 'CREATE ACCOUNT'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
