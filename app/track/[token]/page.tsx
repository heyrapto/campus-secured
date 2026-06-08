import DynamicMap from '@/components/dashboard/DynamicMap';
import { connectDB } from '@/lib/mongodb';
import Alert from '@/models/Alert';
import EmergencyContact from '@/models/EmergencyContact';
import { getReadableAddress } from '@/lib/geocoding';
import Link from 'next/link';
import { Mail, Phone, User, AlertTriangle, ShieldCheck, ArrowLeft, Heart, MapPin } from 'lucide-react';

export default async function TrackPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  await connectDB();
  
  // Find the alert with populated student fields
  const alert = await Alert.findOne({ trackToken: token }).populate(
    'studentId',
    'name studentId email whatsapp'
  );
  
  if (!alert) {
    return (
      <div className="min-h-screen bg-[var(--cs-bg)] flex items-center justify-center p-4">
        <div className="cs-panel p-10 text-center max-w-md w-full border-t border-[var(--cs-red)]">
          <h1 className="text-xl font-bold text-[var(--cs-red-bright)] tracking-widest font-mono">
            [ERR: NOT FOUND]
          </h1>
          <p className="text-[var(--cs-muted)] mt-3 text-sm">
            The tracking link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  // Get emergency contacts for this student
  let contacts = [];
  if (alert.studentId) {
    contacts = await EmergencyContact.find({ studentId: alert.studentId._id });
  }

  // Fetch geocoded human-readable location
  const resolvedLocation = await getReadableAddress(alert.lat, alert.lng);

  const studentName = alert.studentId?.name || 'UNKNOWN STUDENT';
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(studentName)}&backgroundColor=3bbfb8&textColor=ffffff`;

  // Pass alert object to the map (serialize it first)
  const serializedAlert = {
    _id: alert._id.toString(),
    trackToken: alert.trackToken,
    lat: alert.lat,
    lng: alert.lng,
    type: alert.type,
    status: alert.status,
    studentId: {
      name: studentName
    },
    createdAt: alert.createdAt.toISOString()
  };

  return (
    <div className="min-h-screen bg-[var(--cs-bg)] p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-5xl w-full space-y-6">
        
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--cs-border)] pb-4">
          <div className="space-y-1">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--cs-muted)] hover:text-[var(--cs-teal)] transition-colors mb-2 uppercase tracking-widest font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <h1 
              className="text-2xl md:text-3xl font-bold text-[var(--cs-text)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              LIVE TRACKING PORTAL
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="cs-pill-teal">Active Stream</span>
            <span className={`cs-pill-red ${alert.status === 'ACTIVE' ? 'animate-pulse' : 'opacity-60'}`}>
              {alert.status}
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-stretch">
          {/* Map View */}
          <div className="flex flex-col gap-4 h-full">
            <div className="cs-panel-solid p-1 flex-1 flex flex-col min-h-[380px]">
              <DynamicMap alerts={[serializedAlert]} />
            </div>
            <div className="cs-panel p-5 space-y-4 shrink-0">
              <div className="space-y-1">
                <h3 className="text-xs uppercase tracking-widest text-[var(--cs-teal)] font-bold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Resolved Location
                </h3>
                <p className="text-sm font-bold text-[var(--cs-text)] mt-1.5 leading-relaxed">
                  {resolvedLocation}
                </p>
              </div>

              <div className="border-t border-[var(--cs-border)] pt-3">
                <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-[var(--cs-muted)]">
                  <div>Latitude: <span className="text-[var(--cs-text)]">{alert.lat.toFixed(6)}</span></div>
                  <div>Longitude: <span className="text-[var(--cs-text)]">{alert.lng.toFixed(6)}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Details / Personal Info */}
          <div className="flex flex-col gap-6 h-full">
            {/* Person Card */}
            <div className="cs-panel p-6 space-y-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-none border border-[var(--cs-border)] overflow-hidden shrink-0 bg-[var(--cs-surface-alt)] p-0.5">
                    <img src={avatarUrl} alt={studentName} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="cs-overline">TARGET NODE</div>
                    <h2 className="text-lg font-bold text-[var(--cs-text)] truncate">{studentName}</h2>
                    <p className="text-xs font-mono text-[var(--cs-muted)] mt-0.5">ID: {alert.studentId?.studentId || 'N/A'}</p>
                  </div>
                </div>

                <div className="border-t border-[var(--cs-border)] pt-4 space-y-3 mt-6">
                  <h3 className="text-xs uppercase tracking-widest text-[var(--cs-teal)] font-bold mb-1">INCIDENT PROTOCOL</h3>
                  <div className="flex items-start gap-2.5 text-sm">
                    <AlertTriangle className="w-4 h-4 text-[var(--cs-red-bright)] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[var(--cs-text)] font-mono">{alert.type}</span>
                      {alert.landmark && (
                        <p className="text-[11px] text-[var(--cs-text)] mt-1 font-bold">
                          📍 Landmark: {alert.landmark}
                        </p>
                      )}
                      {alert.description && (
                        <p className="text-[11px] text-[var(--cs-muted)] mt-1.5 whitespace-pre-wrap border border-[var(--cs-border)] p-2 bg-[var(--cs-surface-alt)] font-mono leading-relaxed">
                          {alert.description}
                        </p>
                      )}
                      <p className="text-[10px] text-[var(--cs-muted)] font-mono mt-1">
                        Reported {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-[var(--cs-border)] pt-4 space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-[var(--cs-teal)] font-bold">CONTACT INFO</h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-2 text-[var(--cs-muted)]">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[var(--cs-text)] truncate">{alert.studentId?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--cs-muted)]">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[var(--cs-text)] font-mono">{alert.studentId?.whatsapp || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contacts Card */}
            <div className="cs-panel p-6 space-y-4 flex-1 flex flex-col">
              <h3 className="text-xs uppercase tracking-widest text-[var(--cs-teal)] font-bold flex items-center gap-2 shrink-0">
                <Heart className="w-4 h-4 text-[var(--cs-red-bright)]" /> EMERGENCY CONTACTS
              </h3>

              <div className="flex-1 overflow-y-auto min-h-[140px] space-y-3 pr-1">
                {contacts.length === 0 ? (
                  <p className="text-xs text-[var(--cs-muted)] font-mono italic">No emergency contacts registered.</p>
                ) : (
                  <div className="space-y-3">
                    {contacts.map((contact: any, idx: number) => (
                      <div 
                        key={contact._id?.toString() || idx}
                        className="p-3 bg-[var(--cs-surface-alt)] border border-[var(--cs-border)] space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-bold text-xs text-[var(--cs-text)]">{contact.name}</div>
                          {contact.relationship && (
                            <span className="text-[9px] uppercase tracking-widest text-[var(--cs-teal)] font-mono border border-[var(--cs-teal)]/30 px-1 py-0.5">
                              {contact.relationship}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 font-mono text-[10px] text-[var(--cs-muted)]">
                          <p>Phone: <span className="text-[var(--cs-text)]">{contact.phone}</span></p>
                          {contact.whatsapp && (
                            <p>WhatsApp: <span className="text-[var(--cs-text)]">{contact.whatsapp}</span></p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
          </div>
        </div>
</div>
      </div>
    </div>
  );
}