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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-2xl text-center">
          <h1 className="text-2xl font-bold text-red-400">Alert Not Found</h1>
          <p className="text-slate-400 mt-2">The tracking link is invalid or expired.</p>
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
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 flex flex-col">
      <div className="max-w-4xl w-full mx-auto space-y-6">
        <div className="glass p-6 rounded-2xl border-l-4 border-l-red-500">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Live Emergency Tracking</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div>
              <p className="text-slate-400 text-sm">Status</p>
              <p className={`font-bold ${alert.status === 'ACTIVE' ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                {alert.status}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Incident</p>
              <p className="text-white font-medium">{alert.type}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Student</p>
              <p className="text-white font-medium">{alert.studentId?.name}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Time</p>
              <p className="text-white font-medium">{new Date(alert.createdAt).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        <DynamicMap alerts={[serializedAlert]} />
      </div>
    </div>
  );
}
