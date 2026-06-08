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
  const [contacts, setContacts] = useState([{ name: '', phone: '', whatsapp: '', relationship: '' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleContactChange = (index: number, field: string, value: string) => {
    const newContacts = [...contacts];
    (newContacts[index] as any)[field] = value;
    setContacts(newContacts);
  };

  const addContact = () => {
    if (contacts.length < 3) {
      setContacts([...contacts, { name: '', phone: '', whatsapp: '', relationship: '' }]);
    }
  };

  const removeContact = (index: number) => {
    const newContacts = contacts.filter((_, i) => i !== index);
    setContacts(newContacts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, contacts: contacts.filter(c => c.name && c.phone) })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      const loginRes = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (loginRes?.error) {
        setError('Registered, but automatic login failed. Please log in manually.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-y-auto pt-24 pb-24">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="aero-panel w-full max-w-2xl p-8 relative"
      >
        <div className="flex justify-between items-center border-b border-[var(--aero-border)] pb-4 mb-6">
          <h2 className="text-xl font-bold text-[var(--aero-text)]" style={{ fontFamily: 'var(--font-hero)' }}>
            NEW RECRUIT
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[var(--aero-muted)] mb-2">Full Name</label>
              <input 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="aero-input"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-[var(--aero-muted)] mb-2">Student ID</label>
              <input 
                required
                value={formData.studentId}
                onChange={e => setFormData({...formData, studentId: e.target.value})}
                className="aero-input"
                placeholder="2018/1/XXXX"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-[var(--aero-muted)] mb-2">Email</label>
              <input 
                type="email" required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="aero-input"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-[var(--aero-muted)] mb-2">Password</label>
              <input 
                type="password" required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="aero-input"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-widest text-[var(--aero-muted)] mb-2">WhatsApp Number</label>
              <input 
                required
                value={formData.whatsapp}
                onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                className="aero-input"
                placeholder="2348XXXXXXXXX"
              />
              <p className="text-[10px] text-[var(--aero-muted)] mt-2 uppercase tracking-widest">>> Required for emergency broadcasts</p>
            </div>
          </div>

          <div className="border-t border-[var(--aero-border)] pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--aero-accent)]">Emergency Contacts</h3>
              {contacts.length < 3 && (
                <button type="button" onClick={addContact} className="text-[var(--aero-accent)] hover:text-[var(--aero-accent-strong)] text-xs uppercase tracking-widest flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add Link
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {contacts.map((contact, index) => (
                <div key={index} className="p-4 bg-[var(--aero-panel-soft)] border border-[var(--aero-border)] relative">
                  {index > 0 && (
                    <button type="button" onClick={() => removeContact(index)} className="absolute top-2 right-2 text-[var(--aero-muted)] hover:text-[var(--aero-pink)] transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input 
                      placeholder="Contact Name" required={index === 0}
                      value={contact.name} onChange={e => handleContactChange(index, 'name', e.target.value)}
                      className="aero-input py-1.5 text-sm"
                    />
                    <input 
                      placeholder="Phone Number" required={index === 0}
                      value={contact.phone} onChange={e => handleContactChange(index, 'phone', e.target.value)}
                      className="aero-input py-1.5 text-sm"
                    />
                    <input 
                      placeholder="WhatsApp (Optional)"
                      value={contact.whatsapp} onChange={e => handleContactChange(index, 'whatsapp', e.target.value)}
                      className="aero-input py-1.5 text-sm"
                    />
                    <input 
                      placeholder="Relationship (e.g. Parent)"
                      value={contact.relationship} onChange={e => handleContactChange(index, 'relationship', e.target.value)}
                      className="aero-input py-1.5 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full aero-button mt-4"
          >
            {loading ? 'INITIALIZING...' : 'CREATE ACCOUNT_'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
