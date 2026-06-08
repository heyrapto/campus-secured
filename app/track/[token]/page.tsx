import DynamicMap from '@/components/dashboard/DynamicMap';
import { connectDB } from '@/lib/mongodb';
import Alert from '@/models/Alert';

export default async function TrackPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  await connectDB();
  
  // Find the alert
  const alert = await Alert.findOne({ trackToken: token }).populate('studentId', 'name studentId');
  
  if (!alert) {
    return (
      <div className="min-h-screen bg-[var(--cs-bg)] flex items-center justify-center p-4">
        <div className="cs-panel p-10 text-center max-w-md w-full border-t-2 border-t-[var(--cs-red)]">
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

  // Pass alert object to the map (serialize it first)
  const serializedAlert = {
    _id: alert._id.toString(),
    trackToken: alert.trackToken,
    lat: alert.lat,
    lng: alert.lng,
    type: alert.type,
    status: alert.status,
    studentId: {
      name: alert.studentId?.name
    },
    createdAt: alert.createdAt.toISOString()
  };

  return (
    <div className="min-h-screen bg-[var(--cs-bg)] p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-8">
        
        <div className="border-b border-[var(--cs-border)] pb-4">
          <div className="cs-accent-label mb-1">Public tracking link</div>
          <h1 
            className="text-2xl md:text-3xl font-bold text-[var(--cs-text)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            LIVE OPERATIONS MAP
          </h1>
        </div>

        <div className="cs-panel p-6 border-l-4 border-l-[var(--cs-red)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="cs-overline mb-1">Status</p>
              <p className={`text-sm font-mono font-bold ${alert.status === 'ACTIVE' ? 'text-[var(--cs-red-bright)] animate-pulse' : 'text-[var(--cs-teal-bright)]'}`}>
                [{alert.status}]
              </p>
            </div>
            <div>
              <p className="cs-overline mb-1">Incident</p>
              <p className="text-[var(--cs-text)] text-sm font-bold tracking-widest uppercase">{alert.type}</p>
            </div>
            <div>
              <p className="cs-overline mb-1">Target</p>
              <p className="text-[var(--cs-text)] text-sm font-bold truncate">{alert.studentId?.name}</p>
            </div>
            <div>
              <p className="cs-overline mb-1">Timestamp</p>
              <p className="text-[var(--cs-text)] text-sm font-mono">{new Date(alert.createdAt).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        <div className="cs-panel-solid p-1">
          <DynamicMap alerts={[serializedAlert]} />
        </div>
        
      </div>
    </div>
  );
}
