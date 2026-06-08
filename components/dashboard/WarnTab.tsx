'use client';

import { useState } from 'react';
import { Send, AlertOctagon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WarnTab() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const sendBroadcast = async () => {
    if (!message) return;
    setStatus('sending');

    try {
      // Create an endpoint for admin broadcast.
      // Since it wasn't strictly in our previous tasks, we will mock it or call the bot directly if allowed.
      // We will assume there's an api route `/api/alerts/broadcast` that we need to build.
      const res = await fetch('/api/alerts/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      if (!res.ok) throw new Error('Broadcast failed');
      
      setStatus('sent');
      setMessage('');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (e: any) {
      setStatus('error');
      setErrorMsg(e.message);
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white">Admin Broadcast</h2>
        <p className="text-slate-400">Send an emergency message to all registered students via WhatsApp.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="bg-amber-500/20 border border-amber-500/50 p-4 rounded-xl flex gap-3 text-amber-200">
          <AlertOctagon className="w-6 h-6 shrink-0" />
          <p className="text-sm">Warning: This will immediately send a WhatsApp message to all students on campus. Use only for real emergencies.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Broadcast Message</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={5}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            placeholder="🚨 CAMPUS ALERT: Armed robbery reported near north gate. Avoid the area. Security has been dispatched."
          />
        </div>

        {status === 'error' && <p className="text-red-400 text-sm">{errorMsg}</p>}
        {status === 'sent' && <p className="text-emerald-400 text-sm">Broadcast sent successfully!</p>}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={sendBroadcast}
          disabled={status === 'sending' || !message}
          className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-all disabled:opacity-50"
        >
          {status === 'sending' ? (
            'Sending Broadcast...'
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send to All Students
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
