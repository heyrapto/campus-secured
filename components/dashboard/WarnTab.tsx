'use client';

import { useState } from 'react';
import { Send, AlertOctagon } from 'lucide-react';

export default function WarnTab() {
  const [message, setMessage] = useState('');
  const [status, setStatus]   = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const sendBroadcast = async () => {
    if (!message.trim()) return;
    setStatus('sending');

    try {
      const res = await fetch('/api/alerts/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      if (!res.ok) throw new Error('Broadcast failed');

      setStatus('sent');
      setMessage('');
      setTimeout(() => setStatus('idle'), 4000);
    } catch (e: any) {
      setStatus('error');
      setErrorMsg(e.message);
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b border-[var(--cs-border)] pb-4">
        <div className="cs-accent-label mb-1">Admin only</div>
        <h2
          className="text-2xl font-bold text-[var(--cs-text)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          BROADCAST SYSTEM
        </h2>
      </div>

      <div className="cs-panel p-8 space-y-6">
        {/* Warning banner */}
        <div className="border border-[var(--cs-border)] bg-[var(--cs-surface-alt)] p-4 flex gap-3 text-[var(--cs-red-bright)]">
          <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-xs font-mono uppercase tracking-widest leading-relaxed">
            This executes an immediate WhatsApp broadcast to all registered student nodes on campus. Use only for confirmed emergencies.
          </p>
        </div>

        {/* Message input */}
        <div className="space-y-2">
          <label className="cs-overline block">Message Payload</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={5}
            className="cs-input font-mono text-sm resize-none"
            placeholder="[CAMPUS ALERT] Armed robbery reported near North Gate. Avoid the area. Security has been deployed."
          />
          <p className="text-[10px] font-mono text-[var(--cs-muted)]">
            {message.length} characters · will be sent to all registered WhatsApp numbers
          </p>
        </div>

        {/* Status messages */}
        {status === 'error' && (
          <p className="text-[var(--cs-red-bright)] text-xs font-mono border border-[var(--cs-red)]/50 p-3">
            ERR: {errorMsg}
          </p>
        )}
        {status === 'sent' && (
          <p className="text-[var(--cs-teal-bright)] text-xs font-mono border border-[var(--cs-teal)]/50 p-3">
            SUCCESS: Payload delivered to WhatsApp broadcast queue.
          </p>
        )}

        <button
          onClick={sendBroadcast}
          disabled={status === 'sending' || !message.trim()}
          className="w-full cs-btn-primary"
        >
          {status === 'sending' ? (
            'TRANSMITTING...'
          ) : (
            <>
              <Send className="w-4 h-4" />
              EXECUTE BROADCAST
            </>
          )}
        </button>
      </div>
    </div>
  );
}
