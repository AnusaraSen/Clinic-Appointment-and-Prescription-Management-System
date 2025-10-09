import React, { useState, useEffect } from "react";
import { useAuth } from '../../authentication/context/AuthContext.jsx';
import axios from "axios";
import Sidebar from "../components/SidebarPatient";
import Topbar from "../components/Topbar";
import "../../../styles/Patient-Interaction/AddAppointments.css";
import { useNavigate, useLocation } from "react-router-dom";

/*
  AddAppointments Page
  --------------------------------------
  Enhancements:
   - Retrieves selected doctor from navigation state or persisted storage
   - Fetches raw availability blocks for doctor (GET /api/availability/doctor/:doctorId)
   - Transforms each block into discrete 30-minute time slots with deviation tags:
       deviationMinutes > 0 => Early
       deviationMinutes < 0 => Delay
       deviationMinutes = 0 => On Time
   - Interactive slot chips populate appointment date & time.
   - Manual date/time inputs disabled when slots are present (prevents mismatch).
*/
function AddAppointments() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Selected doctor state (initial from navigation or localStorage fallback)
  const [doctor, setDoctor] = useState(() => {
    const d = location.state?.doctor;
    if (d) return d;
    try {
      const stored = localStorage.getItem('selectedDoctor');
      if (stored) return JSON.parse(stored);
    } catch {}
    return undefined;
  });

  // Persist doctor when provided via navigation
  useEffect(() => {
    if (location.state?.doctor) {
      setDoctor(location.state.doctor);
      localStorage.setItem('selectedDoctor', JSON.stringify(location.state.doctor));
    }
  }, [location.state]);

  // Form state
  const [form, setForm] = useState({
    patient_id: "", // will be auto-filled from auth
    patient_name: "", // will be auto-filled from auth
    patient_nic: "", // NEW: capture patient's NIC for downstream prescription linkage
    doctor_id: "",
    doctor_name: "",
    appointment_date: "",
    appointment_time: "",
    appointment_type: "Consultation",
    reason: "",
    follow_up_date: "",
    follow_up_time: ""
  });

  // When auth user changes, auto-inject patient info (only for Patient role)
  useEffect(() => {
    if (user && user.role === 'Patient') {
      setForm(prev => ({
        ...prev,
        patient_id: user.user_id || prev.patient_id,
        patient_name: user.name || prev.patient_name
      }));
    }
  }, [user]);

  // Availability + derived slots
  const [availability, setAvailability] = useState([]); // raw blocks
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);
  const [slots, setSlots] = useState([]); // raw all slots
  const [futureSlots, setFutureSlots] = useState([]); // filtered to future
  const [groupedSlots, setGroupedSlots] = useState([]); // [{dateISO, friendlyDate, slots:[] }]
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [bookedMap, setBookedMap] = useState(new Map()); // key dateISO -> Set(times)
  const SLOT_INTERVAL_MINUTES = 30;

  // Inject doctor data into form when doctor changes
  useEffect(() => {
    if (doctor) {
      if (!doctor._id) {
        console.warn('[AddAppointments] Doctor object missing _id:', doctor);
      }
      setForm(prev => ({
        ...prev,
        doctor_id: doctor._id || '',
        doctor_name: doctor.name || (doctor.firstName && doctor.lastName ? `${doctor.firstName} ${doctor.lastName}` : '')
      }));
    }
  }, [doctor]);

  // Fetch availability blocks when doctor changes
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!doctor || !doctor._id) return;
      const tried = [];
      const attemptIds = [doctor._id];
      // Include legacy placeholder if present in calendar files (hard-coded example) only if different
      const legacyPlaceholder = '64a9b0d1234567890abcdef1';
      if (legacyPlaceholder !== doctor._id) attemptIds.push(legacyPlaceholder);
      let accumulated = [];
      for (const id of attemptIds) {
        tried.push(id);
        try {
          const res = await axios.get(`http://localhost:5000/api/availability/doctor/${id}`, { timeout: 7000 });
          if (res.data && res.data.length) {
            accumulated = res.data;
            console.log('[Availability] Using doctorId', id, 'returned', res.data.length, 'blocks');
            break;
          } else {
            console.log('[Availability] doctorId', id, 'returned 0 blocks');
          }
        } catch (err) {
          console.warn('[Availability] fetch failed for', id, err.message);
        }
      }
      setAvailability(accumulated);
      if (!accumulated.length) {
        console.warn('[Availability] No blocks found. Tried ids:', tried);
      }
    };
    fetchAvailability();
  }, [doctor]);

  // Utility: parse time string supporting 'HH:MM', 'H:MM', 'HH:MMam', 'HH:MM pm'
  function parseFlexibleTime(str) {
    if (!str) return null;
    const raw = str.trim().toLowerCase();
    // Extract am/pm
    let meridian = null;
    const ampmMatch = raw.match(/(am|pm)$/);
    if (ampmMatch) meridian = ampmMatch[1];
    const cleaned = raw.replace(/(am|pm)/g,'').trim();
    const parts = cleaned.split(':');
    if (parts.length < 2) return null;
    let h = parseInt(parts[0],10); let m = parseInt(parts[1],10);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    if (meridian) {
      if (meridian === 'am' && h === 12) h = 0; // 12am -> 0
      if (meridian === 'pm' && h !== 12) h += 12; // add 12 except 12pm
    }
    if (h < 0 || h > 23 || m < 0 || m > 59) return null;
    return { hour: h, minute: m };
  }

  // Transform availability blocks into discrete slot chips
  useEffect(() => {
    const newSlots = [];
    console.log('[Slots] Raw availability blocks:', availability);
    availability.forEach(block => {
      if (!block?.date || !block?.startTime || !block?.endTime) return;
      try {
        const dateObj = new Date(block.date);
        // Local date components instead of UTC slice to prevent off-by-one
        const dateISO = `${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2,'0')}-${String(dateObj.getDate()).padStart(2,'0')}`;
        const startParsed = parseFlexibleTime(block.startTime);
        const endParsed = parseFlexibleTime(block.endTime);
        if (!startParsed || !endParsed) {
          console.warn('[Slots] Skipping block unparsable times', block.startTime, block.endTime, block);
          return;
        }
        const startMinutes = startParsed.hour*60 + startParsed.minute;
        const endMinutes = endParsed.hour*60 + endParsed.minute;
        if (endMinutes <= startMinutes) {
          console.warn('[Slots] Skipping block end<=start', block);
          return;
        }
        for (let m = startMinutes; m < endMinutes; m += SLOT_INTERVAL_MINUTES) {
          const h = Math.floor(m/60).toString().padStart(2,'0');
          const mm = (m%60).toString().padStart(2,'0');
          const time24 = `${h}:${mm}`;
          const hourNum = parseInt(h,10);
          const ampm = hourNum >=12 ? 'PM' : 'AM';
          const hour12 = ((hourNum + 11) % 12 + 1);
          const label12 = `${hour12}:${mm} ${ampm}`;
          const dev = block.deviationMinutes || 0;
          let deviationTag = 'On Time';
          if (dev > 0) deviationTag = 'Early';
          else if (dev < 0) deviationTag = 'Delay';
          newSlots.push({
            id: `${block._id}-${time24}`,
            availabilityId: block._id,
            dateISO,
            time: time24,
            label: label12,
            deviationTag,
            deviationMinutes: dev
          });
        }
      } catch (e) {
        console.warn('Slot transform error', e, block);
      }
    });
    if (newSlots.length === 0 && availability.length > 0) {
      // Fallback: one slot per block (start time)
      console.warn('[Slots] Fallback: generating one slot per block');
      availability.forEach(block => {
        try {
          const dateObj = new Date(block.date);
          const dateISO = `${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2,'0')}-${String(dateObj.getDate()).padStart(2,'0')}`;
          const startParsed = parseFlexibleTime(block.startTime);
          if (!startParsed) return;
          const h = String(startParsed.hour).padStart(2,'0');
          const mm = String(startParsed.minute).padStart(2,'0');
          const time24 = `${h}:${mm}`;
          const hourNum = startParsed.hour;
          const ampm = hourNum >=12 ? 'PM' : 'AM';
          const hour12 = ((hourNum + 11) % 12 + 1);
          const label12 = `${hour12}:${mm} ${ampm}`;
          const dev = block.deviationMinutes || 0;
          let deviationTag = 'On Time';
          if (dev > 0) deviationTag = 'Early'; else if (dev < 0) deviationTag = 'Delay';
          newSlots.push({
            id: `${block._id}-fallback`,
            availabilityId: block._id,
            dateISO,
            time: time24,
            label: label12,
            deviationTag,
            deviationMinutes: dev
          });
        } catch {}
      });
    }
    console.log('[Slots] Generated slots count:', newSlots.length, newSlots.slice(0,5));
    setSlots(newSlots);
    setSelectedSlotId(prev => newSlots.find(s => s.id === prev) ? prev : null);
  }, [availability]);

  // Filter to future slots & group
  useEffect(() => {
    const now = new Date();
    const nowMinutes = now.getHours()*60 + now.getMinutes();
    const todayISO = now.toISOString().slice(0,10);
    const inRange = slots.filter(s => {
      if (s.dateISO > todayISO) return true;
      if (s.dateISO === todayISO) {
        const [h,m] = s.time.split(':').map(Number);
        return (h*60 + m) >= nowMinutes;
      }
      return false;
    });
    // Optional: constrain to next 30 days
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate()+30);
    const maxISO = maxDate.toISOString().slice(0,10);
    const limited = inRange.filter(s => s.dateISO <= maxISO);
    setFutureSlots(limited);
    // Grouping
    const map = new Map();
    limited.forEach(s => {
      if (!map.has(s.dateISO)) map.set(s.dateISO, []);
      map.get(s.dateISO).push(s);
    });
    const groups = Array.from(map.entries()).sort((a,b) => a[0].localeCompare(b[0])).map(([dateISO, list]) => {
      const dateObj = new Date(dateISO + 'T00:00:00');
      const friendlyDate = dateObj.toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric' });
      list.sort((a,b) => a.time.localeCompare(b.time));
      return { dateISO, friendlyDate, slots: list };
    });
    setGroupedSlots(groups);
  }, [slots]);

  // Fetch booked slots after availability or doctor change
  useEffect(() => {
    const loadBooked = async () => {
      if (!doctor?._id) return;
      try {
        // Fetch next 30 days bookings (simple approach: no date filter, then we filter client side)
        const res = await axios.get(`http://localhost:5000/appointments/booked/${doctor._id}`);
        const map = new Map();
        (res.data || []).forEach(appt => {
          const d = new Date(appt.date);
          const dateISO = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
          if (!map.has(dateISO)) map.set(dateISO, new Set());
          map.get(dateISO).add(appt.time);
        });
        setBookedMap(map);
      } catch (e) {
        console.warn('[Booked] fetch failed', e.message);
      }
    };
    loadBooked();
  }, [doctor, availability]);

  const selectSlot = (slot) => {
    setSelectedSlotId(slot.id);
    setForm(prev => ({
      ...prev,
      appointment_date: slot.dateISO,
      appointment_time: slot.time
    }));
  };

  const isBooked = (dateISO, time) => bookedMap.get(dateISO)?.has(time);

  const deviationColor = (tag) => {
    switch(tag) {
      case 'Early': return '#16a34a';
      case 'Delay': return '#dc2626';
      default: return '#0369a1';
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.patient_id) { alert("Patient ID is required."); return; }
    if (!form.patient_name) { alert("Patient name is required."); return; }
    if (!form.patient_nic) { alert("Patient NIC is required."); return; }
    if (!form.doctor_name || !doctor) { alert("Please select a doctor from the Doctors page first."); return; }
    if (form.appointment_date) {
      const d = new Date(form.appointment_date);
      const now = new Date();
      d.setHours(0,0,0,0); now.setHours(0,0,0,0);
      if (d < now) { window.alert("Appointment date cannot be in the past."); return; }
    }
    // Enforce slot selection only
    if (!selectedSlotId) {
      window.alert('Please select an available time slot from the left.');
      return;
    }
    // Double-check that slot still unbooked at submit time
    if (isBooked(form.appointment_date, form.appointment_time)) {
      window.alert('That slot was just booked. Please choose another.');
      return;
    }
    const trimmedNic = form.patient_nic.trim();
    const appointment = {
      patient_id: form.patient_id,
      patient_name: form.patient_name,
      patient_nic: trimmedNic,
      // Critical: include doctor_id for backend uniqueness & validation
      doctor_id: doctor?._id || form.doctor_id,
      appointment_date: form.appointment_date,
      appointment_time: form.appointment_time,
      appointment_type: form.appointment_type,
      doctor_name: form.doctor_name,
      doctor_specialty: doctor?.specialty,
      reason: form.reason,
      notes: form.reason,
      status: "upcoming",
      follow_up: form.follow_up_date || form.follow_up_time ? { date: form.follow_up_date || undefined, time: form.follow_up_time || undefined } : undefined
    };
    try {
  await axios.post("http://localhost:5000/appointment/add", appointment, { timeout: 5000 });
      window.alert("Appointment added successfully!");
      navigate("/patient-dashboard");
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) {
        window.alert('That time slot was just booked. Please choose another.');
      } else {
        // Normalize server error shape { message, error }
        const data = err?.response?.data;
        const serverMsg = (data && (data.error || data.message)) || err?.message || 'Unknown error';
        window.alert('Error adding appointment: ' + serverMsg);
      }
      console.error('Add appointment error:', err);
    }
  };

  useEffect(() => {
    if (doctor) {
      const doctorId = doctor.id || doctor._id;
      console.log('[AddAppointments] Using doctorId for availability:', doctorId, 'Doctor object:', doctor);
    }
  }, [doctor]);

  if (!doctor) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa' }}>
        <Sidebar />
        <div style={{ flex: 1, marginLeft: 220 }}>
          <Topbar />
          <main style={{ padding: '32px', maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
            <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 10, padding: 32, textAlign: 'center', boxShadow: '0 2px 8px rgba(255,215,0,0.08)' }}>
              <h2 style={{ color: '#d48806', marginBottom: 16 }}>No Doctor Selected</h2>
              <p style={{ color: '#555', marginBottom: 24 }}>Please select a doctor from the Doctors page to book an appointment.</p>
              <button style={{ background: '#008080', color: 'white', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/doctors')}>Go to Doctors Page</button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Topbar />
        <main style={{ padding: '32px', maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 40, alignItems: 'flex-start', justifyContent: 'flex-start' }}>
            {/* Doctor profile & slots */}
            <div style={{
              minWidth: 260,
              maxWidth: 300,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: '#e6f7fa',
              borderRadius: 12,
              padding: '32px 18px',
              boxShadow: '0 2px 8px rgba(0,128,128,0.08)'
            }}>
              <img src={doctor.avatar} alt={doctor.name} style={{ width: 80, height: 80, borderRadius: '50%', marginBottom: 18 }} />
              <div style={{ fontWeight: 700, fontSize: '1.15rem', color: '#008080', marginBottom: 6 }}>{doctor.name}</div>
              <div style={{ color: '#555', fontSize: '1.05rem', marginBottom: 6 }}>{doctor.specialty}</div>
              <div style={{ color: '#fbbf24', fontWeight: 600, marginBottom: 18 }}>Rating: {doctor.rating}</div>
              <div style={{ width: '100%', marginTop: 12, background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,128,128,0.07)', padding: '12px 8px', textAlign: 'center' }}>
                <h3 style={{ color: '#008080', fontSize: '1.08rem', marginBottom: 8 }}>Available Time Slots</h3>
                {loadingAvailability && <div style={{ fontStyle: 'italic', color: '#888', margin: '8px 0' }}>Loading availability...</div>}
                {availabilityError && <div style={{ color: '#d93025', fontSize: '0.85rem', marginBottom: 8 }}>Error: {availabilityError}</div>}
                {!loadingAvailability && !availabilityError && slots.length === 0 && (
                  <div style={{ fontStyle: 'italic', color: '#999', margin: '4px 0 8px' }}>
                    No availability published or all slots are in the past.
                    <details style={{ marginTop:4 }}>
                      <summary style={{ cursor:'pointer', fontSize:'0.65rem' }}>Debug info</summary>
                      <div style={{ fontSize:'0.6rem', textAlign:'left' }}>
                        <div>Blocks received: {availability.length}</div>
                        <div>Example block: {availability[0] ? JSON.stringify({date:availability[0].date,start:availability[0].startTime,end:availability[0].endTime}) : 'n/a'}</div>
                        <div>Client now: {new Date().toString()}</div>
                        <div>Accepted formats: 09:30, 9:30am, 09:30 AM</div>
                      </div>
                    </details>
                  </div>
                )}
                {!loadingAvailability && slots.length > 0 && (
                  <div style={{ fontSize: '0.78rem', color: '#555', marginBottom: 6 }}>
                    {slots.length} slot(s) generated from {availability.length} block(s)
                  </div>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', maxHeight: 260, overflowY: 'auto', padding: '4px 2px' }}>
                  {groupedSlots.map(group => (
                    <div key={group.dateISO} style={{flex:'1 1 100%', borderTop:'1px solid #e0f2f1', paddingTop:6, marginTop:6}}>
                      <div style={{fontSize:'0.7rem', fontWeight:600, color:'#0f766e', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:4}}>
                        {group.friendlyDate}
                      </div>
                      <div style={{display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center'}}>
                        {group.slots.map(slot => {
                          const booked = isBooked(group.dateISO, slot.time);
                          const isSelected = slot.id === selectedSlotId;
                          return (
                            <button key={slot.id} type="button" onClick={() => !booked && selectSlot(slot)}
                              disabled={booked}
                              style={{
                                border: isSelected ? '2px solid #008080' : '1px solid #bae6fd',
                                background: booked ? '#f1f5f9' : (isSelected ? '#ccfbf1' : '#f0f9ff'),
                                color: booked ? '#94a3b8' : '#024959',
                                fontSize: '0.72rem',
                                borderRadius: 8,
                                padding: '6px 8px 6px',
                                cursor: booked ? 'not-allowed' : 'pointer',
                                minWidth: 70,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                                boxShadow: isSelected ? '0 0 0 2px rgba(0,128,128,0.15)' : '0 1px 2px rgba(0,0,0,0.05)'
                              }}
                              title={booked ? 'Already booked' : `Deviation: ${slot.deviationMinutes} min (${slot.deviationTag})`}
                            >
                              <span style={{ fontWeight: 600 }}>{slot.label}</span>
                              {booked ? (
                                <span style={{ fontSize: '0.55rem', fontWeight: 600, color: '#dc2626' }}>Booked</span>
                              ) : (
                                <span style={{ fontSize: '0.55rem', fontWeight: 600, color: deviationColor(slot.deviationTag) }}>{slot.deviationTag}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {selectedSlotId && (
                  <div style={{ marginTop: 8, fontSize: '0.75rem', color: '#047857' }}>
                    Selected: {form.appointment_date} @ {form.appointment_time}
                  </div>
                )}
              </div>
            </div>

            {/* Appointment Form */}
            <div className="add-appointments" style={{ flex: 1 }}>
              <h2>Add Appointment</h2>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 8 }}>
                  <label htmlFor="patient_id">Patient ID</label>
                  <input id="patient_id" name="patient_id" value={form.patient_id} onChange={handleChange} placeholder="Patient ID" required readOnly style={{ background:'#f1f5f9', fontWeight:600 }} />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label htmlFor="patient_name">Patient Name</label>
                  <input id="patient_name" name="patient_name" value={form.patient_name} onChange={handleChange} placeholder="Patient Name" required readOnly style={{ background:'#f1f5f9', fontWeight:600 }} />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label htmlFor="patient_nic">Patient NIC</label>
                  <input id="patient_nic" name="patient_nic" value={form.patient_nic} onChange={handleChange} placeholder="Enter Patient NIC" required />
                  <div style={{ fontSize:'0.65rem', color:'#555' }}>This NIC will be used later to prefill prescriptions via Diagnose.</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label htmlFor="doctor_name">Selected Doctor</label>
                  <input id="doctor_name" name="doctor_name" value={form.doctor_name} placeholder="Doctor Name" readOnly style={{ backgroundColor: '#f0f8ff', color: '#008080', fontWeight: 600 }} />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label>Selected Date</label>
                  <input value={form.appointment_date} readOnly placeholder="Select a slot" style={{ background:'#f1f5f9', fontWeight:600 }} />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label>Selected Time</label>
                  <input value={form.appointment_time} readOnly placeholder="Select a slot" style={{ background:'#f1f5f9', fontWeight:600 }} />
                  <div style={{ fontSize: '0.65rem', color: '#555' }}>Choose an available slot from the left. Manual entry disabled.</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label htmlFor="appointment_type">Appointment Type</label>
                  <select id="appointment_type" name="appointment_type" value={form.appointment_type} onChange={handleChange} required>
                    <option value="Consultation">Consultation</option>
                    <option value="Annual Checkup">Annual Checkup</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Blood Test Results">Blood Test Results</option>
                    <option value="Prescription Renewal">Prescription Renewal</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label htmlFor="reason">Reason/Notes</label>
                  <input id="reason" name="reason" value={form.reason} onChange={handleChange} placeholder="Reason" required />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label htmlFor="follow_up_date">Follow-up date</label>
                  <input id="follow_up_date" name="follow_up_date" type="date" value={form.follow_up_date} onChange={handleChange} />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label htmlFor="follow_up_time">Follow-up time</label>
                  <input id="follow_up_time" name="follow_up_time" type="time" value={form.follow_up_time} onChange={handleChange} />
                </div>
                <button type="submit">Submit</button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AddAppointments;
