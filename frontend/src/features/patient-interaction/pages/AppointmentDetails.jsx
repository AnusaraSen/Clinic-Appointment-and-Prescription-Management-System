import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { CalendarClock, ArrowLeft, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import Sidebar from "../components/SidebarPatient";
import Topbar from "../components/Topbar";

function formatDateOnly(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
}

function AppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Prefer proxy endpoint, with absolute fallbacks
  const endpoints = useMemo(() => [
    `/appointment/get/${id}`,
    `http://localhost:5000/appointment/get/${id}`,
    `http://127.0.0.1:5000/appointment/get/${id}`,
  ], [id]);

  useEffect(() => {
    const fetchOne = async () => {
      setLoading(true);
      setError("");
      let lastErr = null;
      for (const url of endpoints) {
        try {
          const res = await axios.get(url, { timeout: 5000 });
          const data = res?.data?.appointment || res?.data;
          if (data && data._id) {
            setAppointment(data);
            const pid = (typeof data.patient_id === 'object') ? data.patient_id?._id : data.patient_id;
            if (pid) localStorage.setItem('patientId', pid);
            setLoading(false);
            return;
          }
        } catch (e) {
          lastErr = e;
        }
      }
      const msg = lastErr?.response?.data || lastErr?.message || "Failed to load appointment";
      setError(String(msg));
      setLoading(false);
    };
    fetchOne();
  }, [endpoints]);

  const handleDownload = () => {
    if (!appointment) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    const pageWidth = doc.internal.pageSize.getWidth();
    let cursorY = 40; // top padding

    // Simple vector "logo": blue rounded square with white cross
    const logoX = 40;
    const logoY = cursorY;
    const logoSize = 40;
    doc.setFillColor(59, 130, 246); // blue
    if (doc.roundedRect) {
      doc.roundedRect(logoX, logoY, logoSize, logoSize, 8, 8, "F");
    } else {
      doc.rect(logoX, logoY, logoSize, logoSize, "F");
    }
    // white cross
    doc.setFillColor(255, 255, 255);
    doc.rect(logoX + logoSize / 2 - 6, logoY + 10, 12, logoSize - 20, "F");
    doc.rect(logoX + 10, logoY + logoSize / 2 - 6, logoSize - 20, 12, "F");

    // Clinic name and contact
    const clinicName = "FAMILY HEALTH CARE CLINIC";
    const clinicAddress = "42/5, Main Street, Dehiowita";
    const clinicPhone = "0719595962";

    // Title
    doc.setFontSize(18);
    doc.setTextColor(59, 130, 246); // blue
    doc.text(clinicName, logoX + logoSize + 16, logoY + 16);

    // Address and phone (subtle gray)
    doc.setFontSize(11);
    doc.setTextColor(90);
    doc.text(clinicAddress, logoX + logoSize + 16, logoY + 34);
    doc.text(`Tel: ${clinicPhone}`, logoX + logoSize + 16, logoY + 50);

    cursorY = logoY + logoSize + 20;

    // Divider line
    doc.setDrawColor(230);
    doc.setLineWidth(1);
    doc.line(40, cursorY, pageWidth - 40, cursorY);
    cursorY += 24;

    // Document heading
    doc.setTextColor(0);
    doc.setFontSize(16);
    doc.text("Appointment Details", 40, cursorY);
    cursorY += 14;

    // Content card background
    const cardX = 40;
    const cardW = pageWidth - 80;
    const cardY = cursorY + 8;
    const lineGap = 18;
    let y = cardY + 22;
    doc.setFillColor(248, 250, 252); // light background
    if (doc.roundedRect) {
      doc.roundedRect(cardX, cardY, cardW, 220, 10, 10, "F");
    } else {
      doc.rect(cardX, cardY, cardW, 220, "F");
    }

    // Labels and values
    const label = (t, lx, ly) => {
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(t, lx, ly);
    };
    const value = (t, vx, vy) => {
      doc.setFontSize(12);
      doc.setTextColor(20);
      doc.text(String(t ?? "-"), vx, vy);
    };

    const col1 = cardX + 16;
    const col2 = cardX + cardW / 2 + 8;

    // Prepare display text for patient and doctor
    // Prefer populated objects from backend (appointment.patient, appointment.doctor)
    const patientText = appointment.patient_name
      || appointment.patient?.name
      || (appointment.patient_id && typeof appointment.patient_id === 'object' ? (appointment.patient_id.name || appointment.patient_id._id) : null)
      || (typeof appointment.patient_id === 'string' ? appointment.patient_id : '-')
      ;
    const doctorText = appointment.doctor_name
      || appointment.doctor?.name
      || (appointment.doctor_id && typeof appointment.doctor_id === 'object' ? (appointment.doctor_id.name || appointment.doctor_id._id) : null)
      || (typeof appointment.doctor_id === 'string' ? appointment.doctor_id : '-')
      ;

    // Left column
    label("Appointment ID", col1, y); value(appointment._id, col1, y + 14); y += lineGap + 14;
    label("Patient", col1, y); value(patientText, col1, y + 14); y += lineGap + 14;
    label("Doctor", col1, y); value(doctorText, col1, y + 14); y += lineGap + 14;

    // Right column
    let y2 = cardY + 22;
    label("Date & Time", col2, y2); value(`${formatDateOnly(appointment.appointment_date || appointment.date)} ${appointment.appointment_time || appointment.time || "-"}`, col2, y2 + 14); y2 += lineGap + 14;
    label("Status", col2, y2); value(appointment.status || "-", col2, y2 + 14); y2 += lineGap + 14;
    label("Created", col2, y2); value(appointment.created_at ? new Date(appointment.created_at).toLocaleString() : "-", col2, y2 + 14); y2 += lineGap + 14;

    // Full-width section for reason and follow-up
    let y3 = Math.max(y, y2) + 12;
    label("Reason", col1, y3); value(appointment.reason || appointment.notes || "-", col1, y3 + 14); y3 += lineGap + 14;
    label("Follow-up", col1, y3);
    const followStr = `${appointment?.follow_up?.date ? formatDateOnly(appointment.follow_up.date) : "-"} ${appointment?.follow_up?.time || ""}`.trim();
    value(followStr, col1, y3 + 14);

    // Footer note
    const footerY = cardY + 240 + 26;
    doc.setFontSize(10);
    doc.setTextColor(140);
    doc.text("Thank you for choosing Family Health Care Clinic.", 40, footerY);

    doc.save(`appointment-${appointment._id}.pdf`);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Topbar />
        <main style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }}>
          <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', marginBottom: 16 }}>
            <ArrowLeft size={18} /> Back
          </button>

          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,128,128,0.06)', padding: 24 }}>
            {/* Branded header to mirror PDF */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Simple vector logo */}
                <div style={{ position: 'relative', width: 40, height: 40, background: '#3b82f6', borderRadius: 10 }}>
                  <div style={{ position: 'absolute', left: '50%', top: 8, transform: 'translateX(-50%)', width: 12, height: 24, background: '#fff', borderRadius: 2 }} />
                  <div style={{ position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)', width: 24, height: 12, background: '#fff', borderRadius: 2 }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: '#3b82f6', letterSpacing: 0.2 }}>FAMILY HEALTH CARE CLINIC</div>
                  <div style={{ color: '#666', fontSize: 13 }}>42/5, Main Street, Dehiowita · Tel: 0719595962</div>
                </div>
              </div>
              <button onClick={handleDownload} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}>
                <Download size={18} /> Download PDF
              </button>
            </div>

            <div style={{ height: 1, background: '#e5e7eb', margin: '18px 0 14px' }} />

            {loading ? (
              <div style={{ marginTop: 16 }}>Loading...</div>
            ) : error ? (
              <div style={{ marginTop: 16, color: 'red', whiteSpace: 'pre-wrap' }}>{String(error)}</div>
            ) : !appointment ? (
              <div style={{ marginTop: 16 }}>Appointment not found.</div>
            ) : (
              <div>
                <div style={{ fontWeight: 600, fontSize: 16, color: '#111827', marginBottom: 12 }}>Appointment Details</div>

                {/* Card-like section matching PDF */}
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {/* Left column */}
                    <div>
                      <div style={{ color: '#6b7280', fontSize: 12 }}>Appointment ID</div>
                      <div style={{ color: '#111827', fontSize: 14, marginBottom: 12 }}>{appointment._id}</div>

                      <div style={{ color: '#6b7280', fontSize: 12 }}>Patient</div>
                      <div style={{ color: '#111827', fontSize: 14, marginBottom: 12 }}>
                        {(() => {
                          const pid = (typeof appointment.patient_id === 'object') ? appointment.patient_id?._id : appointment.patient_id;
                          const pname = appointment.patient_name
                            || appointment.patient?.name
                            || (appointment.patient_id && typeof appointment.patient_id === 'object' ? (appointment.patient_id.name || appointment.patient_id._id) : null)
                            || (typeof appointment.patient_id === 'string' ? appointment.patient_id : '-');
                          return pid ? (
                            <Link to={`/patient/${pid}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>{pname}</Link>
                          ) : (
                            <span>{pname}</span>
                          );
                        })()}
                      </div>

                      <div style={{ color: '#6b7280', fontSize: 12 }}>Doctor</div>
                      <div style={{ color: '#111827', fontSize: 14 }}>
                        {appointment.doctor_name 
                          || appointment.doctor?.name
                          || (appointment.doctor_id && typeof appointment.doctor_id === 'object' ? (appointment.doctor_id.name || appointment.doctor_id._id) : null)
                          || (typeof appointment.doctor_id === 'string' ? appointment.doctor_id : '-')}
                      </div>
                    </div>

                    {/* Right column */}
                    <div>
                      <div style={{ color: '#6b7280', fontSize: 12 }}>Date & Time</div>
                      <div style={{ color: '#111827', fontSize: 14, marginBottom: 12 }}>
                        <CalendarClock size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> 
                        {formatDateOnly(appointment.appointment_date || appointment.date)} {appointment.appointment_time || appointment.time || '-'}
                      </div>

                      <div style={{ color: '#6b7280', fontSize: 12 }}>Status</div>
                      <div style={{ color: '#111827', fontSize: 14, marginBottom: 12 }}>{appointment.status || '-'}</div>

                      {appointment.created_at && (
                        <>
                          <div style={{ color: '#6b7280', fontSize: 12 }}>Created</div>
                          <div style={{ color: '#111827', fontSize: 14 }}>{new Date(appointment.created_at).toLocaleString()}</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Full width fields */}
                  <div style={{ marginTop: 14 }}>
                    <div style={{ color: '#6b7280', fontSize: 12 }}>Reason</div>
                    <div style={{ color: '#111827', fontSize: 14, marginBottom: 12 }}>{appointment.reason || appointment.notes || '-'}</div>

                    <div style={{ color: '#6b7280', fontSize: 12 }}>Follow-up</div>
                    <div style={{ color: '#111827', fontSize: 14 }}>
                      {`${appointment?.follow_up?.date ? formatDateOnly(appointment.follow_up.date) : '-'}`}
                      {appointment?.follow_up?.time ? ` ${appointment.follow_up.time}` : ''}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <Link to="/appointments" style={{ color: '#3b82f6' }}>Go to all appointments</Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppointmentDetails;
