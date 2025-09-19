import React, { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  getDoctorAvailability,
  addAvailability,
  deleteAvailability,
  updateAvailability,
  testBackendConnection,
} from "../api/AvailabilityAPI";

function DoctorCalendar({ doctorId }) {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formDate, setFormDate] = useState(null); // YYYY-MM-DD
  const [formValues, setFormValues] = useState({ startTime: '', endTime: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const calendarRef = useRef(null);
  const [editingEventId, setEditingEventId] = useState(null); // currently editing event id
  const formRef = useRef(null); // reference to side form for auto-scroll
  const [showDeviationPanel, setShowDeviationPanel] = useState(false);
  const [deviationEventId, setDeviationEventId] = useState(null);
  const [deviationValue, setDeviationValue] = useState(0); // minutes (+ early, - delay)
  const STYLE_ID = 'calendar-hover-actions-style';

  // Inject one-time styles for hover action buttons (centered with blurred backdrop)
  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.innerHTML = `
        .fc-day-hover-wrapper {position:absolute; inset:0; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .15s; z-index:6;}
        .fc-daygrid-day:hover .fc-day-hover-wrapper {opacity:1;}
        .fc-day-hover-backdrop {position:absolute; inset:4px; backdrop-filter:blur(4px); background:rgba(255,255,255,0.55); border-radius:6px; box-shadow:0 2px 4px rgba(0,0,0,0.15);} 
        .fc-day-hover-actions {position:relative; display:flex; gap:8px;}
        .fc-day-hover-actions button {border:none; cursor:pointer; font-size:11px; padding:4px 8px; border-radius:4px; color:#fff; font-weight:500; box-shadow:0 1px 2px rgba(0,0,0,.2);} 
        .fc-day-hover-actions button.btn-view {background:#0d6efd;} 
        .fc-day-hover-actions button.btn-add {background:#198754;} 
        .fc-day-hover-actions button:focus {outline:2px solid rgba(0,0,0,.3);} 
        .fc-day-hover-actions button:active {transform:translateY(1px);} 
        /* Header Add Slot button styling */
        .fc .fc-toolbar .fc-addSlot-button {background:#198754; border:1px solid #198754; color:#fff; font-weight:500;}
        .fc .fc-toolbar .fc-addSlot-button:hover {background:#157347; border-color:#146c43;}
        .fc .fc-toolbar .fc-addSlot-button:active {background:#146c43;}
  /* Event color classes */
  /* Event color palette cycling */
  .fc-event.event-slot-0 {background:#0d6efd; border-color:#0d6efd; color:#fff;}
  .fc-event.event-slot-1 {background:#198754; border-color:#198754; color:#fff;}
  .fc-event.event-slot-2 {background:#ffc107; border-color:#ffc107; color:#000;}
  .fc-event.event-slot-3 {background:#6f42c1; border-color:#6f42c1; color:#fff;}
  .fc-event.event-slot-4 {background:#20c997; border-color:#20c997; color:#000;}
  .fc-event.event-slot-5 {background:#dc3545; border-color:#dc3545; color:#fff;}
  /* Custom event content */
  .fc-slot-time {font-size: 0.75rem; line-height:1.1;}
  .fc-slot-detail {font-size:0.7rem; line-height:1.1;}
  .fc-slot-detail .fc-slot-time {font-size:0.8rem;}
  .fc-slot-desc {margin-top:2px; white-space:normal;}
  /* Day view event hover action buttons (do NOT change event height) */
  .fc-timegrid-event {position:relative;}
  .fc-event-actions {position:absolute; top:2px; right:2px; display:flex; gap:4px; opacity:0; transition:opacity .12s; z-index:40;}
  .fc-timegrid-event:hover .fc-event-actions {opacity:1;}
  .fc-event-actions button {border:none; padding:2px 6px; font-size:10px; line-height:1; border-radius:3px; cursor:pointer; font-weight:600; color:#fff; box-shadow:0 1px 2px rgba(0,0,0,.35);} 
  .fc-event-actions .btn-update {background:#0d6efd;}
  .fc-event-actions .btn-update:hover {background:#0b5ed7;}
  .fc-event-actions .btn-delete {background:#dc3545;}
  .fc-event-actions .btn-delete:hover {background:#bb2d3b;}
  .fc-event-actions .btn-availability {background:#ffe08a; color:#5c4700; font-weight:600; padding:4px 10px; font-size:12px;}
  .fc-event-actions .btn-availability:hover {background:#ffd567;}
  /* Deviation tags */
  .fc-dev-tag {display:inline-block; padding:2px 6px; border-radius:10px; font-size:10px; font-weight:600; margin-top:2px;}
  .fc-dev-tag.delay {background:#f8d7da; color:#842029;}
  .fc-dev-tag.early {background:#d1e7dd; color:#0f5132;}
  .fc-dev-tag.ontime {background:#d1f7c4; color:#0f5132;}
  /* Month view: keep tag on same line with 15px spacing from time */
  .fc-daygrid .fc-daygrid-event .fc-dev-tag { margin-left:15px; margin-top:0; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Auto-scroll to form when opening in update mode (editing existing slot)
  useEffect(() => {
    if (showForm && editingEventId && formRef.current) {
      const rect = formRef.current.getBoundingClientRect();
      const y = rect.top + window.pageYOffset - 16; // slight offset
      window.scrollTo({ top: y < 0 ? 0 : y, behavior: 'smooth' });
    }
  }, [showForm, editingEventId]);

  // Test backend connectivity (can be called from browser console)
  window.testBackend = async () => {
    try {
      await testBackendConnection();
      console.log("✅ Backend is reachable!");
    } catch (error) {
      console.error("❌ Backend is not reachable:", error.message);
    }
  };

  // Load doctor's availability
  useEffect(() => {
  const fetchAvailability = async () => {
      try {
        const res = await getDoctorAvailability(doctorId);
        // Group by date and assign color index per slot order
        const dateCounters = {};
    const formatted = res.data
          .sort((a,b)=>{
            const da=a.date.localeCompare(b.date); if(da!==0) return da; return a.startTime.localeCompare(b.startTime);
          })
          .map((slot) => {
            const dateKey = slot.date.split('T')[0];
            const idx = dateCounters[dateKey] ?? 0;
            dateCounters[dateKey] = idx + 1;
            const colorClass = 'event-slot-' + (idx % 6);
            return {
              id: slot._id,
              title: `${slot.startTime}-${slot.endTime}`,
              start: new Date(dateKey + 'T' + slot.startTime),
              end: new Date(dateKey + 'T' + slot.endTime),
              classNames: [colorClass],
              extendedProps: { description: slot.description || '', deviationMinutes: slot.deviationMinutes || 0 }
            };
          });
        setEvents(formatted);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAvailability();
  }, [doctorId]);

  // Handle date click (add new availability)
  const normalizeTime = (t) => {
    if (!t) return "";
    let v = t.trim();
    v = v.replace(/[\.\-]/g, ":").replace(/\s+/g, "");
    if (/^\d{4}$/.test(v)) v = v.slice(0, 2) + ":" + v.slice(2);
    const m = v.match(/^(\d{1,2}):(\d{2})$/);
    if (m) v = m[1].padStart(2, "0") + ":" + m[2];
    return v;
  };

  const handleDateClick = (info) => {
  // Only navigate to the selected date's day view; do NOT open the form automatically
  handleViewDate(info.dateStr);
  };

  const handleViewDate = (dateStr) => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.changeView('timeGridDay', dateStr);
    }
  };

  // Format a Date object as YYYY-MM-DD using local timezone (avoids UTC shift)
  const formatLocalYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSlot = async () => {
    if (editingEventId) return; // guard
    const startTime = normalizeTime(formValues.startTime);
    const endTime = normalizeTime(formValues.endTime);
    const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      alert('Invalid time format (use HH:MM).');
      return;
    }
    if (endTime <= startTime) {
      alert('End time must be after start time.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { doctorId, date: formDate, startTime, endTime, description: formValues.description?.trim() };
      console.log('Adding availability', payload);
      const res = await addAvailability(payload);
      setEvents((prev) => {
        const updated = [...prev, {
          id: res.data._id,
          title: `${startTime}-${endTime}`,
          start: new Date(formDate + 'T' + startTime),
          end: new Date(formDate + 'T' + endTime),
          extendedProps: { description: res.data.description || '', deviationMinutes: 0 }
        }];
        // Re-index colors per date
        const dateCounters = {};
        return updated
          .sort((a,b)=> {
            const da = formatLocalYMD(new Date(a.start)).localeCompare(formatLocalYMD(new Date(b.start)));
            if (da !== 0) return da;
            return new Date(a.start) - new Date(b.start);
          })
          .map(evt => {
            const dateKey = formatLocalYMD(new Date(evt.start));
            const idx = dateCounters[dateKey] ?? 0;
            dateCounters[dateKey] = idx + 1;
            return { ...evt, classNames: ['event-slot-' + (idx % 6)] };
          });
      });
      setShowForm(false);
    } catch (error) {
      console.error('Add availability failed', error?.response?.data || error.message);
      alert('Failed to add slot: ' + (error?.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  // Trigger form from day view header button
  const handleAddSlotFromDayView = () => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    const currentDate = api.getDate();
    const dateStr = formatLocalYMD ? formatLocalYMD(currentDate) : currentDate.toISOString().split('T')[0];
    setFormDate(dateStr);
    setFormValues({ startTime: '', endTime: '', description: '' });
    setShowForm(true);
  };

  // Handle event click (delete availability)
  const handleEventClick = (info) => {
    // disable default click delete (use hover buttons instead)
    info.jsEvent.preventDefault();
  };

  const startEditEvent = (eventObj) => {
    const start = eventObj.start;
    const end = eventObj.end;
    const fmt = (d) => d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', hour12:false });
    const dateStr = formatLocalYMD(start);
    setFormDate(dateStr);
    setFormValues({
      startTime: fmt(start),
      endTime: fmt(end),
      description: eventObj.extendedProps?.description || ''
    });
    setEditingEventId(eventObj.id);
    setShowForm(true);
  };

  const reindexColors = (list) => {
    const dateCounters = {};
    return list
      .sort((a,b)=> {
        const da = formatLocalYMD(new Date(a.start)).localeCompare(formatLocalYMD(new Date(b.start)));
        if (da !== 0) return da;
        return new Date(a.start) - new Date(b.start);
      })
      .map(evt => {
        const dateKey = formatLocalYMD(new Date(evt.start));
        const idx = dateCounters[dateKey] ?? 0;
        dateCounters[dateKey] = idx + 1;
        return { ...evt, classNames:[ 'event-slot-' + (idx % 6) ] };
      });
  };

  const handleUpdateSlot = async () => {
    if (!editingEventId) return;
    const startTime = normalizeTime(formValues.startTime);
    const endTime = normalizeTime(formValues.endTime);
    const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      alert('Invalid time format (use HH:MM).');
      return;
    }
    if (endTime <= startTime) {
      alert('End time must be after start time.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { startTime, endTime, description: formValues.description?.trim(), date: formDate };
      const res = await updateAvailability(editingEventId, payload);
      setEvents(prev => reindexColors(prev.map(e => e.id === editingEventId ? {
        ...e,
        title: `${startTime}-${endTime}`,
        start: new Date(formDate + 'T' + startTime),
        end: new Date(formDate + 'T' + endTime),
  extendedProps: { ...(e.extendedProps||{}), description: res.data.description || '' }
      } : e)));
      setEditingEventId(null);
      setShowForm(false);
    } catch (error) {
      console.error('Update availability failed', error?.response?.data || error.message);
      alert('Failed to update slot: ' + (error?.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this availability?')) return;
    try {
      await deleteAvailability(id);
      setEvents(prev => reindexColors(prev.filter(e => e.id !== id)));
      if (editingEventId === id) { setEditingEventId(null); setShowForm(false); }
      if (deviationEventId === id) { setShowDeviationPanel(false); setDeviationEventId(null); }
    } catch (error) {
      console.error('Delete availability failed', error?.response?.data || error.message);
      alert('Failed to delete slot: ' + (error?.response?.data?.message || error.message));
    }
  };

  // Deviation (availability shift) logic
  const openDeviationPanel = (eventObj) => {
    setDeviationEventId(eventObj.id);
    setDeviationValue(eventObj.extendedProps?.deviationMinutes || 0);
    setShowDeviationPanel(true);
    setTimeout(()=>{
      const panel = document.getElementById('deviation-panel');
      if (panel) {
        const r = panel.getBoundingClientRect();
        const y = r.top + window.pageYOffset - 16;
        window.scrollTo({ top: y < 0 ? 0 : y, behavior:'smooth'});
      }
    }, 40);
  };

  const saveDeviation = async () => {
    if (!deviationEventId) return;
    try {
      await updateAvailability(deviationEventId, { deviationMinutes: deviationValue });
      setEvents(prev => prev.map(e => e.id === deviationEventId ? { ...e, extendedProps: { ...(e.extendedProps||{}), deviationMinutes: deviationValue } } : e));
      setShowDeviationPanel(false); setDeviationEventId(null);
    } catch (error) {
      alert('Failed to save change: ' + (error?.response?.data?.message || error.message));
    }
  };

  // Format minutes into "Xhr Y mins" form when 60+ minutes, preserving singular/plural
  const formatDeviationDuration = (mins) => {
    const abs = Math.abs(mins);
    if (abs < 60) return abs + ' mins';
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    const hourPart = h + 'hr' + (h > 1 ? 's' : '');
    const minPart = m ? ' ' + m + ' mins' : '';
    return hourPart + minPart;
  };

  const deviationTagHTML = (minutes, detailed=false) => {
    if (!detailed) { // month / condensed views keep simple labels
      if (minutes > 0) return `<span class="fc-dev-tag early">Early</span>`;
      if (minutes < 0) return `<span class="fc-dev-tag delay">Delay</span>`;
      return `<span class="fc-dev-tag ontime">On Time</span>`;
    }
    if (minutes > 0) return `<span class="fc-dev-tag early">Early +${formatDeviationDuration(minutes)}</span>`;
    if (minutes < 0) return `<span class="fc-dev-tag delay">Delay ${formatDeviationDuration(minutes)}</span>`;
    return `<span class="fc-dev-tag ontime">On Time</span>`;
  };

  return (
  <div className="doctor-calendar position-relative" style={{ width: '100%' }}>
      <h3>Doctor Availability Calendar</h3>

  <div style={{ width: '100%' }}>
  <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        customButtons={currentView !== 'dayGridMonth' ? {
          addSlot: {
            text: 'Add Slot',
            click: handleAddSlotFromDayView,
          },
        } : {}}
        initialView="dayGridMonth"
        headerToolbar={currentView === 'dayGridMonth' ? {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        } : {
          left: 'prev,next today',
          center: 'title',
          right: 'addSlot dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        }}
        events={events}
  // Removed dateClick that opened form; clicking a day no longer opens Add Slot form automatically
        eventClick={handleEventClick}
        datesSet={(arg) => { // Track view & hide form in day view
          setCurrentView(arg.view.type);
          if (arg.view.type === 'timeGridDay' && showForm) setShowForm(false);
        }}
        eventContent={(arg) => {
          const viewType = arg.view.type;
          const start = arg.event.start;
          const end = arg.event.end;
          const fmt = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
          const range = start && end ? `${fmt(start)}-${fmt(end)}` : arg.timeText;
            if (!start) return;
            const fmt24 = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            const fmt12 = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).replace(/ /g,'');
            const range24 = end ? `${fmt24(start)}-${fmt24(end)}` : fmt24(start);
            const range12 = end ? `${fmt12(start)}-${fmt12(end)}` : fmt12(start);
            if (viewType === 'dayGridMonth') {
              const dev = arg.event.extendedProps?.deviationMinutes || 0;
              return { html: `<span class=\"fc-slot-time\">${range12}</span>${deviationTagHTML(dev,false)}` };
            }
            if (viewType === 'timeGridDay') {
              // Day view: show time (24h for precision) + description
              const desc = arg.event.extendedProps?.description;
              const dev = arg.event.extendedProps?.deviationMinutes || 0;
              return { html: `<div class="fc-slot-detail"><div class="fc-slot-time">${range24}</div>${desc ? `<div class="fc-slot-desc">${desc}</div>` : ''}${deviationTagHTML(dev,true)}</div>` };
            }
            // Other views (week/list): just show 24h time (no description per current requirement)
            return { html: `<div class="fc-slot-time">${range24}</div>` };
        }}
        eventDidMount={(arg) => {
          if (arg.view.type !== 'timeGridDay') return; // only day view
          const el = arg.el;
          if (el.querySelector('.fc-event-actions')) return;
          const actions = document.createElement('div');
          actions.className = 'fc-event-actions';
          const btnU = document.createElement('button');
          btnU.type = 'button'; btnU.className='btn-update'; btnU.textContent='Update';
          btnU.addEventListener('click', (e)=>{ e.stopPropagation(); startEditEvent(arg.event); });
          const btnD = document.createElement('button');
          btnD.type='button'; btnD.className='btn-delete'; btnD.textContent='Delete';
          btnD.addEventListener('click', (e)=>{ e.stopPropagation(); handleDeleteEvent(arg.event.id); });
          const btnAvail = document.createElement('button');
          btnAvail.type='button'; btnAvail.className='btn-availability'; btnAvail.textContent='Availability';
          btnAvail.addEventListener('click', (e)=>{ e.stopPropagation(); openDeviationPanel(arg.event); });
          const row1 = document.createElement('div');
          row1.style.display='flex'; row1.style.gap='4px';
          row1.appendChild(btnU); row1.appendChild(btnD);
          const row2 = document.createElement('div');
          row2.style.marginTop='4px';
          row2.appendChild(btnAvail);
          actions.style.flexDirection='column';
          actions.appendChild(row1);
          actions.appendChild(row2);
          el.appendChild(actions);
        }}
        dayCellDidMount={(arg) => {
          if (arg.view.type !== 'dayGridMonth') return;
          if (arg.el.querySelector('.fc-day-hover-wrapper')) return;
          const dateStr = formatLocalYMD(arg.date); // use local date to avoid UTC off-by-one
          arg.el.style.position = 'relative';
          const wrapper = document.createElement('div');
          wrapper.className = 'fc-day-hover-wrapper';
          const backdrop = document.createElement('div');
          backdrop.className = 'fc-day-hover-backdrop';
          const actions = document.createElement('div');
          actions.className = 'fc-day-hover-actions';
          const viewBtn = document.createElement('button');
          viewBtn.type = 'button';
          viewBtn.className = 'btn-view';
          viewBtn.textContent = 'View date';
          viewBtn.addEventListener('click', (e) => { e.stopPropagation(); handleViewDate(dateStr); });
          const addBtn = document.createElement('button');
          addBtn.type = 'button';
          addBtn.className = 'btn-add';
          addBtn.textContent = 'Add slot';
          addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            setFormDate(dateStr);
            setFormValues({ startTime: '', endTime: '', description: '' });
            setShowForm(true);
          });
          actions.appendChild(viewBtn);
          actions.appendChild(addBtn);
          wrapper.appendChild(backdrop);
          wrapper.appendChild(actions);
          arg.el.appendChild(wrapper);
        }}
        height="auto"
      />
  </div>
      {showForm && (
        <div ref={formRef} className="card shadow" style={{ position: 'absolute', top: '4rem', right: 0, width: 320, zIndex: 10 }}>
          <div className="card-body p-3">
            <div className="d-flex justify-content-between align-items-start">
              <h5 className="card-title mb-2">{editingEventId ? 'Update Slot' : 'Add Slot'}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowForm(false)} />
            </div>
            <p className="text-muted" style={{ fontSize: '0.8rem' }}>{formDate}</p>
            <div className="mb-2">
              <label className="form-label">Start Time</label>
              <input type="time" name="startTime" value={formValues.startTime} onChange={handleFormChange} className="form-control" />
            </div>
            <div className="mb-2">
              <label className="form-label">End Time</label>
              <input type="time" name="endTime" value={formValues.endTime} onChange={handleFormChange} className="form-control" />
            </div>
            <div className="mb-3">
              <label className="form-label">Description (optional)</label>
              <input name="description" value={formValues.description} onChange={handleFormChange} placeholder="Checkups" className="form-control" />
            </div>
            <button disabled={submitting} onClick={editingEventId ? handleUpdateSlot : handleAddSlot} className="btn btn-success w-100 mb-2">
              {submitting ? (editingEventId ? 'Updating...' : 'Adding...') : (editingEventId ? 'Update Slot' : 'Add Slot')}
            </button>
            {editingEventId && (
              <button type="button" className="btn btn-outline-secondary w-100" onClick={() => { setEditingEventId(null); setShowForm(false); }}>
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
      {showDeviationPanel && (
        <div id="deviation-panel" className="card shadow" style={{ position:'absolute', top: showForm? '28rem':'4rem', right: showForm? 340:0, width: 300, zIndex: 11 }}>
          <div className="card-body p-3">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <h6 className="mb-0">Adjust Availability</h6>
              <button type="button" className="btn-close" aria-label="Close" onClick={()=>{ setShowDeviationPanel(false); setDeviationEventId(null); }} />
            </div>
            <p className="text-muted" style={{fontSize:'0.7rem'}}>Drag left for Delay (negative), right for Early (positive). 0 = On Time.</p>
            <div className="mb-2">
              <input type="range" className="form-range" min="-120" max="120" step="5" value={deviationValue} onChange={e=> setDeviationValue(parseInt(e.target.value,10))} />
              <div className="d-flex justify-content-between" style={{fontSize:'0.65rem', marginTop:'-4px'}}>
                <span>Delay</span><span>0</span><span>Early</span>
              </div>
            </div>
            <div className="text-center mb-2" style={{fontSize:'0.75rem', fontWeight:600}}>
              {deviationValue > 0 && <span className="badge bg-success-subtle text-success">Early +{formatDeviationDuration(deviationValue)}</span>}
              {deviationValue < 0 && <span className="badge bg-danger-subtle text-danger">Delay {formatDeviationDuration(deviationValue)}</span>}
              {deviationValue === 0 && <span className="badge bg-success-subtle text-success">On Time</span>}
            </div>
            <button className="btn btn-primary w-100 mb-2" onClick={saveDeviation}>Save</button>
            <button className="btn btn-outline-secondary w-100" onClick={()=>{ setShowDeviationPanel(false); setDeviationEventId(null); }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorCalendar;
