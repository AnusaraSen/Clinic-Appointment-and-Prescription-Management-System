import React, { useEffect, useState } from 'react';
import { Wrench, Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../authentication/context/AuthContext.jsx';
import { AddMaintenanceRequestForm } from '../../equipment-maintenance/components/AddMaintenanceRequestForm';

const LabStaffMaintenanceRequestsSection = () => {
  const { user } = useAuth() || {};
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const refresh = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/maintenance-requests');
      if (!res.ok) throw new Error(`Failed to load maintenance requests (${res.status})`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.data || data.items || []);

      const uid = user?._id && String(user._id);
      const uname = (user?.name || user?.fullName || user?.username || '').toLowerCase();

      const mine = (list || []).filter(r => {
        const rb = r.reportedBy;
        if (!rb) return false;
        if (typeof rb === 'object') {
          const rid = rb._id || rb.id;
          if (rid && uid && String(rid) === uid) return true;
          const rname = (rb.name || '').toLowerCase();
          if (uname && rname && (rname === uname || rname.includes(uname))) return true;
        } else if (typeof rb === 'string') {
          const rbs = rb.toLowerCase();
          if (uname && rbs.includes(uname)) return true;
        }
        return false;
      });

      mine.sort((a,b) => new Date(b.date||b.created_at||0) - new Date(a.date||a.created_at||0));
      setItems(mine.slice(0, 5));
    } catch (e) {
      setError(e?.message || 'Failed to load maintenance requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [user?._id]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return <Clock className="h-4 w-4 text-amber-500"/>;
      case 'In Progress': return <AlertCircle className="h-4 w-4 text-blue-500"/>;
      case 'Completed': return <CheckCircle className="h-4 w-4 text-green-500"/>;
      case 'Cancelled': return <AlertCircle className="h-4 w-4 text-red-500"/>;
      default: return <Clock className="h-4 w-4 text-gray-400"/>;
    }
  };

  const PriorityBadge = ({ p }) => {
    const map = {
      High: 'bg-red-100 text-red-700 border border-red-200',
      Medium: 'bg-amber-100 text-amber-700 border border-amber-200',
      Low: 'bg-green-100 text-green-700 border border-green-200',
    };
    const cls = map[p] || 'bg-gray-100 text-gray-700 border border-gray-200';
    return <span className={`text-[10px] px-2 py-0.5 rounded ${cls}`}>{p || '—'}</span>;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded bg-teal-50"><Wrench className="h-4 w-4 text-teal-700"/></div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Maintenance Requests</h3>
            <p className="text-xs text-gray-500">Your submitted requests</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded bg-teal-600 text-white hover:bg-teal-700"
          title="Add maintenance request"
        >
          <Plus className="h-3.5 w-3.5"/> Add
        </button>
      </div>

      {loading && <div className="p-4 text-sm text-gray-500">Loading…</div>}
      {error && !loading && <div className="p-4 text-sm text-red-700 bg-red-50 border-t border-red-100">{error}</div>}

      {!loading && !error && (
        items.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">No requests sent yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((r) => (
              <li key={r._id || r.id} className="p-4 flex items-start gap-3">
                <div className="mt-0.5">{getStatusIcon(r.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-800 truncate">{r.title || 'Untitled request'}</div>
                    <PriorityBadge p={r.priority} />
                  </div>
                  <div className="text-xs text-gray-500 truncate">{r.description || 'No description'}</div>
                  <div className="text-[11px] text-gray-400 mt-1">{r.date ? new Date(r.date).toLocaleString() : ''}</div>
                </div>
              </li>
            ))}
          </ul>
        )
      )}

      {showAdd && (
        <AddMaintenanceRequestForm
          isOpen={showAdd}
          onClose={() => setShowAdd(false)}
          onSuccess={() => { setShowAdd(false); refresh(); }}
        />
      )}
    </div>
  );
};

export default LabStaffMaintenanceRequestsSection;
