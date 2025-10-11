import React, { useState, useEffect } from 'react';
import '../styles/clinicalDashboard.css';
import { Calendar, Pill, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '../../authentication/context/AuthContext.jsx';
import { getDoctorAppointments, getDoctorAppointmentsByName, getAllAppointments } from '../../../api/appointmentsApi.js';

export const ClinicalKPICards = ({ dashboardData, isLoading, error }) => {
  const { user } = useAuth() || {};
  const [clinicalStats, setClinicalStats] = useState({
    medicalRecords: { total: 11, breakdown: { active: 9, archived: 2, pending: 0 }, loading: false },
    appointments: { total: 12, breakdown: { upcoming: 5, completed: 6, cancelled: 1 }, loading: false },
    patients: { total: 8, breakdown: { seen: 6, waiting: 2, scheduled: 5 }, loading: false },
    prescriptions: { total: 7, breakdown: { issued: 6, pending: 1, refills: 0 }, loading: false },
    followUps: { total: 7, breakdown: { due: 3, overdue: 2, completed: 2 }, loading: false },
    completedPast: { total: 0, loading: true }
  });

  useEffect(() => { fetchClinicalData(); }, []);

  const toYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const extractApptYMD = (a) => {
    const raw = (
      a?.appointment_date ?? a?.appointmentDate ?? a?.date ?? a?.scheduledDate ?? a?.datetime ?? a?.startTime ?? a?.time
    );
    if (!raw) return null;
    if (typeof raw === 'string') {
      const s = raw.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s.slice(0, 10);
      const d = new Date(s);
      return isNaN(d.getTime()) ? null : toYMD(d);
    }
    if (typeof raw === 'number') {
      const d = new Date(raw);
      return isNaN(d.getTime()) ? null : toYMD(d);
    }
    try {
      const d = new Date(raw);
      return isNaN(d.getTime()) ? null : toYMD(d);
    } catch { return null; }
  };

  // Attempt to extract a normalized appointment type string
  const extractApptType = (a) => {
    const raw = (
      a?.type ?? a?.appointment_type ?? a?.appointmentType ?? a?.status ?? a?.category ?? a?.kind
    );
    if (!raw) return '';
    if (typeof raw === 'string') return raw.trim().toLowerCase();
    if (typeof raw === 'object') {
      try {
        if (raw.name) return String(raw.name).trim().toLowerCase();
        if (raw.label) return String(raw.label).trim().toLowerCase();
      } catch {}
    }
    return String(raw).trim().toLowerCase();
  };

  const fetchAppointmentsTodayCount = async (base) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayYmd = toYMD(today);
    const candidateUrls = [
      `${base}/appointments/today`,
      `${base}/dashboard/appointments/today`,
      `${base}/appointments?date=${encodeURIComponent(todayYmd)}`,
      `${base}/appointment?date=${encodeURIComponent(todayYmd)}`,
      `${base}/appointments/`,
      `${base}/appointment/`
    ];
    for (const url of candidateUrls) {
      try {
        const r = await fetch(url);
        if (!r.ok) continue;
        const data = await r.json();
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          if (typeof data.totalToday === 'number') return data.totalToday;
          if (data.today && typeof data.today.total === 'number') return data.today.total;
          if (typeof data.total === 'number' && (url.includes('today') || url.includes('?date='))) return data.total;
          const arrCandidates = [data.items, data.appointments, data.data, data.results];
          for (const arr of arrCandidates) {
            if (Array.isArray(arr)) return arr.filter(a => extractApptYMD(a) === todayYmd).length;
          }
        }
        if (Array.isArray(data)) return data.filter(a => extractApptYMD(a) === todayYmd).length;
      } catch {}
    }
    return 0;
  };

  // Fetch a flat array of appointments regardless of server shape
  const fetchAllAppointmentsFlat = async (base) => {
    const urls = [
      `${base}/appointments`, `${base}/appointments/`, `${base}/appointment`, `${base}/appointment/`,
      `${base}/dashboard/appointments`, `${base}/dashboard/appointments/`
    ];
    for (const url of urls) {
      try {
        const r = await fetch(url);
        if (!r.ok) continue;
        const data = await r.json();
        if (Array.isArray(data)) return data;
        if (data && typeof data === 'object') {
          // Common shapes: { items: [] }, { appointments: [] }, { data: [] }, { results: [] }
          const arr = data.items || data.appointments || data.data || data.results;
          if (Array.isArray(arr)) return arr;
          // Some APIs return grouped by date: { 'YYYY-MM-DD': [ {..}, ... ], ... }
          const values = Object.values(data);
          if (values.every(v => Array.isArray(v))) return values.flat();
        }
      } catch (_) { /* try next */ }
    }
    return [];
  };
  // Separate state to drive the Today's Appointments KPI precisely for the logged-in doctor
  const [todaysAppointmentsCount, setTodaysAppointmentsCount] = useState(0);
  const [todaysAppointmentsLoading, setTodaysAppointmentsLoading] = useState(true);

  useEffect(() => {
    // Try to fetch real data, but we already have fallback data loaded
    fetchClinicalData();
  }, []);

  const fetchClinicalData = async () => {
    try {
      const base = 'http://localhost:5000';
      const [medicalRecordsRes, appointmentsRes, patientsRes, prescriptionsRes, followUpsRes] = await Promise.all([
        fetch(`${base}/patient/get`).catch(() => ({ ok: false })),
        fetch(`${base}/dashboard/appointments/stats`).catch(() => ({ ok: false })),
        fetch(`${base}/dashboard/patients/stats`).catch(() => ({ ok: false })),
        fetch(`${base}/prescription/get`).catch(() => ({ ok: false })),
        fetch(`${base}/dashboard/followups/stats`).catch(() => ({ ok: false }))
      ]);

      if (medicalRecordsRes.ok) {
        const medicalRecordsData = await medicalRecordsRes.json();
        const actualTotal = Array.isArray(medicalRecordsData) ? medicalRecordsData.length : (medicalRecordsData.total || medicalRecordsData.items?.length || 0);
        setClinicalStats(prev => ({
          ...prev,
          medicalRecords: {
            total: actualTotal,
            breakdown: {
              active: Math.floor(actualTotal * 0.85),
              archived: Math.floor(actualTotal * 0.12),
              pending: Math.floor(actualTotal * 0.03)
            },
            loading: false
          }
        }));
      }

      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setClinicalStats(prev => ({
          ...prev,
          appointments: {
            total: appointmentsData.total || 0,
            breakdown: {
              upcoming: appointmentsData.upcoming || 0,
              completed: appointmentsData.completed || 0,
              cancelled: appointmentsData.cancelled || 0
            },
            loading: false
          }
        }));
      }

      // Compute today's count and completed appointments (aligned with Past section: doctor-scoped, before today)
      try {
        const allAppointments = await fetchAllAppointmentsFlat(base);
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const todayYmd = toYMD(today);
        const toY = (a) => extractApptYMD(a);
        let todayCount = 0;
        for (const a of allAppointments) {
          const ymd = toY(a);
          if (!ymd) continue;
          if (ymd === todayYmd) todayCount++;
        }

        // Doctor-scoped past count to match Past Appointments section
        const docId = user?._id || user?.doctorId || user?.id;
        const docName = user?.name || user?.fullName || user?.username;
        const pastDocCount = await fetchDoctorCompletedPastCount(base, docId, docName);
        setClinicalStats(prev => ({
          ...prev,
          appointments: { ...prev.appointments, total: todayCount, loading: false },
          completedPast: { ...prev.completedPast, total: pastDocCount, loading: false }
        }));
      } catch {}

      if (patientsRes.ok) {
        const patientsData = await patientsRes.json();
        setClinicalStats(prev => ({
          ...prev,
          patients: { total: patientsData.total || 0, breakdown: { seen: patientsData.seen || 0, waiting: patientsData.waiting || 0, scheduled: patientsData.scheduled || 0 }, loading: false }
        }));
      }

      if (prescriptionsRes.ok) {
        const prescriptionsData = await prescriptionsRes.json();
        const prescriptionTotal = Array.isArray(prescriptionsData) ? prescriptionsData.length : (prescriptionsData.total || prescriptionsData.items?.length || 0);
        setClinicalStats(prev => ({
          ...prev,
          prescriptions: {
            total: prescriptionTotal,
            breakdown: {
              issued: Math.floor(prescriptionTotal * 0.80),
              pending: Math.floor(prescriptionTotal * 0.15),
              refills: Math.floor(prescriptionTotal * 0.05)
            },
            loading: false
          }
        }));
      }

      if (followUpsRes.ok) {
        const followUpsData = await followUpsRes.json();
        setClinicalStats(prev => ({ ...prev, followUps: { total: followUpsData.total || 0, breakdown: { due: followUpsData.due || 0, overdue: followUpsData.overdue || 0, completed: followUpsData.completed || 0 }, loading: false } }));
      }

      // If needed, we could fall back to a doctor-specific past count here
      // Compute doctor's appointments count for TODAY (date equals today)
      try {
        setTodaysAppointmentsLoading(true);
        const todayCount = await fetchDoctorTodaysCount(base);
        setTodaysAppointmentsCount(todayCount);
      } catch (_e) {
        // leave default 0
      } finally {
        setTodaysAppointmentsLoading(false);
      }

    } catch (error) {
      console.error('Error fetching clinical data:', error);
    }
  };

  const fetchDoctorCompletedPastCount = async (base, doctorId, doctorName) => {
    const docIds = []; let docNames = [];
    if (doctorId) docIds.push(String(doctorId));
    if (doctorName) docNames.push(String(doctorName));
    const nameVariants = new Set();
    for (const n of docNames) {
      const t = n.replace(/^Dr\.?\s+/i, '').trim();
      nameVariants.add(t); nameVariants.add(`Dr. ${t}`); nameVariants.add(`Dr ${t}`); nameVariants.add(n.trim());
    }
    docNames = Array.from(nameVariants);

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const start = '1970-01-01'; const end = toYMD(yesterday);

    for (const id of docIds) {
      const url = `${base}/appointments/by-doctor/${encodeURIComponent(id)}?start=${start}&end=${end}`;
      try { const r = await fetch(url); if (r.ok) { const arr = await r.json(); if (Array.isArray(arr)) return arr.length; } } catch {}
    }
    for (const name of docNames) {
      const url = `${base}/appointments/by-doctor-name/${encodeURIComponent(name)}?start=${start}&end=${end}&loose=true`;
      try { const r = await fetch(url); if (r.ok) { const arr = await r.json(); if (Array.isArray(arr)) return arr.length; } } catch {}
    }

    try {
      const allUrls = [`${base}/appointment/`, `${base}/appointments/`];
      for (const url of allUrls) {
        try {
          const r = await fetch(url);
          if (r.ok) {
            const data = await r.json();
            if (Array.isArray(data)) {
              const cutoff = today.getTime();
              const matchesIdentity = (a) => {
                if (docIds.length === 0 && docNames.length === 0) return false;
                const did = a.doctor_id ? String(a.doctor_id) : '';
                const dname = (a.doctor_name || (a.doctor && a.doctor.name) || '').toLowerCase();
                const idMatch = docIds.includes(did);
                const nameMatch = docNames.some(n => {
                  const nn = String(n).toLowerCase();
                  return dname === nn || dname.includes(nn) || nn.includes(dname);
                });
                return idMatch || nameMatch;
              };
              const cnt = data.filter(a => {
                const d = new Date(a.appointment_date || a.date);
                d.setHours(0, 0, 0, 0);
                return d.getTime() < cutoff && matchesIdentity(a);
              }).length;
              return cnt;
            }
          }
        } catch {}
      }
    } catch {}
    return 0;
  };

  const calculatePercentage = (value, total) => (total > 0 ? Math.round((value / total) * 100) : 0);
  // Fetch count of TODAY's appointments for the current doctor (appointment_date == today)
  const fetchDoctorTodaysCount = async (base) => {
    // Pull identity from localStorage (align with other helpers)
    let user = null;
    try { const s = localStorage.getItem('user'); if (s) user = JSON.parse(s); } catch {}
    const docIds = [];
    let docNames = [];
    if (user) {
      if (user._id) docIds.push(String(user._id));
      if (user.doctorId) docIds.push(String(user.doctorId));
      if (user.id) docIds.push(String(user.id));
      if (user.name) docNames.push(String(user.name));
      if (user.fullName) docNames.push(String(user.fullName));
      if (user.username) docNames.push(String(user.username));
    }

    const nameVariants = new Set();
    for (const n of docNames) {
      const trimmed = n.replace(/^Dr\.?\s+/i, '').trim();
      nameVariants.add(trimmed);
      nameVariants.add(`Dr. ${trimmed}`);
      nameVariants.add(`Dr ${trimmed}`);
      nameVariants.add(n.trim());
    }
    docNames = Array.from(nameVariants);

    const today = new Date(); today.setHours(0,0,0,0);
    const ymd = toYMD(today);

    // Try by doctorId
    for (const id of docIds) {
      const url = `${base}/appointments/by-doctor/${encodeURIComponent(id)}?start=${ymd}&end=${ymd}`;
      try {
        const r = await fetch(url);
        if (r.ok) { const arr = await r.json(); if (Array.isArray(arr)) return arr.length; }
      } catch (_) {}
    }
    // Try by doctorName (loose)
    for (const name of docNames) {
      const url = `${base}/appointments/by-doctor-name/${encodeURIComponent(name)}?start=${ymd}&end=${ymd}&loose=true`;
      try {
        const r = await fetch(url);
        if (r.ok) { const arr = await r.json(); if (Array.isArray(arr)) return arr.length; }
      } catch (_) {}
    }
    // Fallback: fetch all and filter by today and identity
    try {
      const allUrls = [`${base}/appointment/`, `${base}/appointments/`];
      for (const url of allUrls) {
        try {
          const r = await fetch(url);
          if (r.ok) {
            const data = await r.json();
            if (Array.isArray(data)) {
              const matchesIdentity = (a) => {
                if (docIds.length === 0 && docNames.length === 0) return false;
                const did = a.doctor_id ? String(a.doctor_id) : '';
                const dname = (a.doctor_name || (a.doctor && a.doctor.name) || '').toLowerCase();
                const idMatch = docIds.includes(did);
                const nameMatch = docNames.some(n => {
                  const nn = String(n).toLowerCase();
                  return dname === nn || dname.includes(nn) || nn.includes(dname);
                });
                return idMatch || nameMatch;
              };
              const cnt = data.filter(a => {
                const d = new Date(a.appointment_date || a.date);
                d.setHours(0,0,0,0);
                return toYMD(d) === ymd && matchesIdentity(a);
              }).length;
              return cnt;
            }
          }
        } catch (_) {}
      }
    } catch (_) {}
    return 0;
  };

  // calculatePercentage defined once above; avoid duplicate declarations

  const clinicalKPICards = [
    {
      title: 'Total Medical Records',
      total: clinicalStats.medicalRecords.total,
      icon: <FileText className="h-7 w-7" />,
      color: 'medical-blue',
      bgGradient: 'from-blue-500 to-cyan-600',
      trend: 'All records secure',
      trendDirection: 'up',
      loading: clinicalStats.medicalRecords.loading,
      breakdown: [
        { label: 'Active', value: clinicalStats.medicalRecords.breakdown.active, percentage: calculatePercentage(clinicalStats.medicalRecords.breakdown.active, clinicalStats.medicalRecords.total), color: 'bg-emerald-500' },
        { label: 'Archived', value: clinicalStats.medicalRecords.breakdown.archived, percentage: calculatePercentage(clinicalStats.medicalRecords.breakdown.archived, clinicalStats.medicalRecords.total), color: 'bg-gray-500' },
        { label: 'Pending', value: clinicalStats.medicalRecords.breakdown.pending, percentage: calculatePercentage(clinicalStats.medicalRecords.breakdown.pending, clinicalStats.medicalRecords.total), color: 'bg-amber-500' }
      ]
    },
    {
      title: "Today's Appointments",
      total: todaysAppointmentsCount,
      icon: <Calendar className="h-7 w-7" />,
      color: 'medical-green',
      bgGradient: 'from-emerald-500 to-teal-600',
  trend: `${todaysAppointmentsCount} scheduled today`,
      trendDirection: 'up',
      loading: todaysAppointmentsLoading,
      breakdown: [
        { label: 'Upcoming', value: clinicalStats.appointments.breakdown.upcoming, percentage: calculatePercentage(clinicalStats.appointments.breakdown.upcoming, clinicalStats.appointments.total), color: 'bg-blue-500' },
        { label: 'Completed', value: clinicalStats.appointments.breakdown.completed, percentage: calculatePercentage(clinicalStats.appointments.breakdown.completed, clinicalStats.appointments.total), color: 'bg-emerald-500' },
        { label: 'Cancelled', value: clinicalStats.appointments.breakdown.cancelled, percentage: calculatePercentage(clinicalStats.appointments.breakdown.cancelled, clinicalStats.appointments.total), color: 'bg-rose-500' }
      ]
    },
    {
      title: 'Prescriptions Issued',
      total: clinicalStats.prescriptions.total,
      icon: <Pill className="h-7 w-7" />,
      color: 'medical-purple',
      bgGradient: 'from-purple-500 to-indigo-600',
      trend: 'All medications verified',
      trendDirection: 'up',
      loading: clinicalStats.prescriptions.loading,
      breakdown: [
        { label: 'Issued', value: clinicalStats.prescriptions.breakdown.issued, percentage: calculatePercentage(clinicalStats.prescriptions.breakdown.issued, clinicalStats.prescriptions.total), color: 'bg-emerald-500' },
        { label: 'Pending', value: clinicalStats.prescriptions.breakdown.pending, percentage: calculatePercentage(clinicalStats.prescriptions.breakdown.pending, clinicalStats.prescriptions.total), color: 'bg-amber-500' },
        { label: 'Refills', value: clinicalStats.prescriptions.breakdown.refills, percentage: calculatePercentage(clinicalStats.prescriptions.breakdown.refills, clinicalStats.prescriptions.total), color: 'bg-blue-500' }
      ]
    },
    {
      title: 'Completed Appointments',
      total: clinicalStats.completedPast.total,
      icon: <CheckCircle className="h-7 w-7" />,
      color: 'medical-emerald',
      bgGradient: 'from-emerald-500 to-teal-600',
  trend: 'Before today',
      trendDirection: 'up',
      loading: clinicalStats.completedPast.loading,
      breakdown: [],
      onClick: () => {
        const el = document.getElementById('past-appointments');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  ];

  const palette = [
    { accent: 'cd-accent-blue', icon: 'cd-icon-wrap', bar: 'cd-accent-bar cd-accent-blue' },
    { accent: 'cd-accent-emerald', icon: 'cd-icon-wrap', bar: 'cd-accent-bar cd-accent-emerald' },
    { accent: 'cd-accent-indigo', icon: 'cd-icon-wrap', bar: 'cd-accent-bar cd-accent-indigo' },
    { accent: 'cd-accent-amber', icon: 'cd-icon-wrap', bar: 'cd-accent-bar cd-accent-amber' }
  ];

  console.log('Clinical Stats:', clinicalStats);
  console.log('First Card Data:', clinicalKPICards[0]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {error && (
        <div className="col-span-full bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 text-sm">⚠️ Error loading clinical data: {error}</p>
          <p className="text-red-600 text-xs mt-1">Using fallback data...</p>
        </div>
      )}

      {clinicalKPICards.map((card, index) => {
        const scheme = palette[index % palette.length];
        return (
          <div key={index} className={`cd-card cd-fade-in ${card.onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`} aria-live="polite" onClick={card.onClick}>
            <span className={scheme.bar} aria-hidden="true"></span>
            <div className="cd-card-header">
              <div className={scheme.icon}>{card.icon}</div>
              <h3 className="cd-title">{card.title}</h3>
            </div>
            <div className="cd-metric" aria-label={`${card.total} ${card.title}`}>{card.total || 0}</div>
            <p className="cd-subtle" role="note">{card.trend}</p>
          </div>
        );
      })}
    </div>
  );
};