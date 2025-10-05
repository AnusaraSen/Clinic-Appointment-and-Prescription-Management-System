import React from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../features/patient-interaction/components/Topbar';
import { CalendarClock } from 'lucide-react';

export default function SamplePatientProfile() {
  const samplePatient = {
    _id: '64f1234567890abcdef0123',
    name: 'John Smith',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  };

  const sampleAppointments = [
    {
      _id: 'app1',
      date: new Date(Date.now() + 86400000).toISOString(),
      time: '14:30',
      doctor: { name: 'Dr. Emily Rodriguez', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', specialty: 'Cardiology' },
    },
    {
      _id: 'app2',
      date: new Date(Date.now() + 3 * 86400000).toISOString(),
      time: '10:15',
      doctor: { name: 'Dr. Sarah Johnson', avatar: '', specialty: 'Dermatology' },
    },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Topbar />
        <main style={{ padding: '32px', maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            {samplePatient.avatar ? (
              <img src={samplePatient.avatar} alt={samplePatient.name} style={{ width: 64, height: 64, borderRadius: '50%' }} />
            ) : (
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e5e7eb' }} />
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: 22, color: '#111827' }}>{samplePatient.name}</div>
              <div style={{ color: '#6b7280' }}>ID: {samplePatient._id}</div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,128,128,0.06)', padding: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>Appointments</div>
            {sampleAppointments.map((app) => (
              <div key={app._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {app.doctor?.avatar ? (
                    <img src={app.doctor.avatar} alt={app.doctor.name} style={{ width: 40, height: 40, borderRadius: '50%' }} />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e5e7eb' }} />
                  )}
                  <div>
                    <div style={{ fontWeight: 600, color: '#008080' }}>{app.doctor?.name}</div>
                    <div style={{ color: '#6b7280', fontSize: 13 }}>{app.doctor?.specialty}</div>
                    <div style={{ color: '#555' }}>
                      <CalendarClock size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                      {new Date(app.date).toLocaleDateString()} at {app.time}
                    </div>
                  </div>
                </div>
                <button style={{ color: '#3b82f6', background: 'transparent', border: 'none', cursor: 'default' }}>View</button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
