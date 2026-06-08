'use client';

import { useState } from 'react';
import { Send, Eye, ShieldAlert, CheckSquare, MapPin } from 'lucide-react';

export default function IncidentTab() {
  const [incidentType, setIncidentType] = useState('ACCIDENT');
  const [knowPerson, setKnowPerson] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [landmark, setLandmark] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'idle' | 'reporting' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [successToken, setSuccessToken] = useState<string | null>(null);

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!landmark.trim()) {
      alert('Please specify a landmark or location.');
      return;
    }

    setStatus('reporting');
    setErrorMsg('');

    // Try to get geolocation coordinates
    let lat = 9.628643; // default fallbacks (Bosso Gate)
    let lng = 6.520563;

    const postReport = async (latitude: number, longitude: number) => {
      try {
        const res = await fetch('/api/alerts/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: latitude,
            lng: longitude,
            type: incidentType,
            landmark,
            description,
            targetStudentId: knowPerson ? studentId : null
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to submit report');

        setStatus('sent');
        setSuccessToken(data.trackToken);
        // Reset form
        setIncidentType('ACCIDENT');
        setKnowPerson(false);
        setStudentId('');
        setLandmark('');
        setDescription('');
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.message);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async pos => {
          await postReport(pos.coords.latitude, pos.coords.longitude);
        },
        async () => {
          // Fallback to default coordinates if geolocation is blocked or fails
          await postReport(lat, lng);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      await postReport(lat, lng);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b border-[var(--cs-border)] pb-4">
        <div className="cs-accent-label mb-1">Report witnessed events</div>
        <h2
          className="text-2xl font-bold text-[var(--cs-text)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          REPORT NEARBY INCIDENT
        </h2>
      </div>

      <form onSubmit={submitReport} className="cs-panel p-8 space-y-6">
        {/* Helper text */}
        <p className="text-xs text-[var(--cs-muted)] leading-relaxed">
          Report active threats, accidents, or emergencies you are witnessing. This alerts security services and broadcasts a safety alert to student WhatsApp nodes.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Incident Type */}
          <div className="space-y-2">
            <label className="cs-overline block">Incident Type</label>
            <select
              value={incidentType}
              onChange={e => setIncidentType(e.target.value)}
              className="cs-input font-bold tracking-widest uppercase text-sm"
            >
              <option value="ACCIDENT">Accident</option>
              <option value="FIRE">Fire Emergency</option>
              <option value="THEFT">Theft / Burglary</option>
              <option value="ROBBERY">Robbery</option>
              <option value="MEDICAL">Medical Emergency</option>
              <option value="KIDNAP">Abduction / Kidnap</option>
              <option value="HARASSMENT">Harassment</option>
              <option value="OTHER">Other Threat</option>
            </select>
          </div>

          {/* Location / Landmark */}
          <div className="space-y-2">
            <label className="cs-overline block">Landmark / Location</label>
            <input
              required
              value={landmark}
              onChange={e => setLandmark(e.target.value)}
              className="cs-input text-sm"
              placeholder="e.g. Near Bosso Campus Main Gate"
            />
          </div>
        </div>

        {/* Target Identity selection */}
        <div className="space-y-4 pt-2 border-t border-[var(--cs-border)]">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="knowPerson"
              checked={knowPerson}
              onChange={e => setKnowPerson(e.target.checked)}
              className="w-4 h-4 accent-[var(--cs-teal)] bg-transparent border-[var(--cs-border)]"
            />
            <label htmlFor="knowPerson" className="text-xs font-bold uppercase tracking-wider text-[var(--cs-text)] select-none cursor-pointer">
              I know the person involved (Victim)
            </label>
          </div>

          {knowPerson && (
            <div className="space-y-2">
              <label className="cs-overline block">Victim's Student ID</label>
              <input
                required={knowPerson}
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                className="cs-input font-mono text-sm max-w-sm"
                placeholder="2018/1/XXXX"
              />
              <p className="text-[10px] text-[var(--cs-muted)] font-mono">
                We'll look up this ID to fetch emergency contact details.
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2 pt-2 border-t border-[var(--cs-border)]">
          <label className="cs-overline block">Situation Details</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            className="cs-input text-sm resize-none"
            placeholder="Describe the situation (e.g. two cars collided, passengers look injured, need medics urgently)"
          />
        </div>

        {/* Feedback Messages */}
        {status === 'error' && (
          <p className="text-[var(--cs-red-bright)] text-xs font-mono border border-[var(--cs-border)] p-3 bg-[var(--cs-surface-alt)]">
            [ERR] {errorMsg}
          </p>
        )}
        {status === 'sent' && (
          <div className="space-y-3 border border-[var(--cs-border)] p-4 bg-[var(--cs-surface-alt)]">
            <p className="text-[var(--cs-teal-bright)] text-xs font-mono font-bold flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4" /> SUCCESS: Broadcast Alert successfully queued.
            </p>
            {successToken && (
              <div className="text-[11px] font-mono text-[var(--cs-muted)]">
                Responders can track live here: 
                <span className="text-[var(--cs-text)] block mt-1 break-all bg-[var(--cs-bg)] p-2 border border-[var(--cs-border)]">
                  {window.location.origin}/track/{successToken}
                </span>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'reporting'}
          className="w-full cs-btn-primary"
        >
          {status === 'reporting' ? (
            'TRANSMITTING REPORT...'
          ) : (
            <>
              <Send className="w-4 h-4" />
              SUBMIT INCIDENT REPORT
            </>
          )}
        </button>
      </form>
    </div>
  );
}
