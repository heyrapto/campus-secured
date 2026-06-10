'use client';

import { useState, useEffect } from 'react';
import { Shield, PhoneForwarded, Users, AlertTriangle, UserX, UserCheck } from 'lucide-react';

export default function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<{ userId: string, actionType: string, userName: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const confirmAction = (userId: string, actionType: string, userName: string) => {
    setSelectedAction({ userId, actionType, userName });
  };

  const executeAction = async () => {
    if (!selectedAction) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedAction.userId, actionType: selectedAction.actionType })
      });
      if (res.ok) {
        await fetchUsers();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
      setSelectedAction(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--cs-teal)]"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-[var(--cs-border)] pb-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--cs-teal)]">Active Users</h2>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--cs-muted)]" />
            <span className="text-xs font-mono text-[var(--cs-muted)]">{users.length} Total</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map(user => (
            <div key={user._id} className={`cs-panel p-4 border-l-2 flex flex-col gap-3 ${user.status === 'suspended' ? 'border-l-[var(--cs-red)] opacity-75' : 'border-l-[var(--cs-teal)]'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-[var(--cs-text)] text-sm tracking-widest uppercase">{user.name}</h4>
                  <p className="text-xs text-[var(--cs-muted)] mt-0.5 font-mono">ID: {user.studentId}</p>
                </div>
                {user.status === 'suspended' ? (
                  <span className="cs-pill-red text-[8px]">Suspended</span>
                ) : (
                  <span className="cs-pill-teal text-[8px]">Active</span>
                )}
              </div>
              
              <div className="text-xs text-[var(--cs-muted)] font-mono space-y-1">
                <p>WhatsApp: {user.whatsapp || 'N/A'}</p>
                <p className={user.falseAlarms > 0 ? 'text-[var(--cs-red-bright)]' : ''}>
                  False Alarms: {user.falseAlarms || 0}
                </p>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[var(--cs-border)]">
                <button 
                  onClick={() => confirmAction(user._id, 'FLAG_FALSE_ALARM', user.name)}
                  className="flex-1 cs-btn-ghost min-h-8 py-0 text-[9px]"
                  title="Flag False Alarm"
                >
                  <AlertTriangle className="w-3 h-3 text-[var(--cs-red-bright)]" /> Flag
                </button>
                {user.status === 'suspended' ? (
                  <button 
                    onClick={() => confirmAction(user._id, 'ACTIVATE', user.name)}
                    className="flex-1 cs-btn-primary min-h-8 py-0 text-[9px]"
                  >
                    <UserCheck className="w-3 h-3" /> Activate
                  </button>
                ) : (
                  <button 
                    onClick={() => confirmAction(user._id, 'SUSPEND', user.name)}
                    className="flex-1 cs-btn-danger min-h-8 py-0 text-[9px]"
                  >
                    <UserX className="w-3 h-3" /> Suspend
                  </button>
                )}
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="col-span-full cs-panel p-6 text-center text-[var(--cs-muted)] text-xs font-mono">
              No active users found.
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {selectedAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--cs-bg)]/80 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="cs-panel p-6 w-full max-w-sm space-y-6 animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="text-base font-bold tracking-widest uppercase text-[var(--cs-text)] border-b border-[var(--cs-border)] pb-2 mb-4">
                Confirm Action
              </h3>
              <p className="text-sm text-[var(--cs-muted)] leading-relaxed">
                Are you sure you want to 
                <span className="font-bold text-[var(--cs-text)]">
                  {selectedAction.actionType === 'FLAG_FALSE_ALARM' ? ' flag a false alarm for ' : selectedAction.actionType === 'SUSPEND' ? ' suspend ' : ' activate '}
                </span>
                <span className="font-bold text-[var(--cs-teal-bright)]">{selectedAction.userName}</span>?
              </p>
              {selectedAction.actionType === 'SUSPEND' && (
                <p className="text-xs text-[var(--cs-red-bright)] mt-3 p-2 bg-[var(--cs-red)]/10 border border-[var(--cs-red)]/30">
                  This user will no longer be able to trigger SOS alerts until activated.
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedAction(null)}
                disabled={actionLoading}
                className="flex-1 cs-btn-ghost text-xs min-h-10"
              >
                Cancel
              </button>
              <button 
                onClick={executeAction}
                disabled={actionLoading}
                className={`flex-1 text-xs min-h-10 ${selectedAction.actionType === 'SUSPEND' || selectedAction.actionType === 'FLAG_FALSE_ALARM' ? 'cs-btn-danger' : 'cs-btn-primary'}`}
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
