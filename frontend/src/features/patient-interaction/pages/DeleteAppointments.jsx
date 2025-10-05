import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../../styles/Patient-Interaction/DeleteAppointments.css";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/SidebarPatient";
import Topbar from "../components/Topbar";

function DeleteAppointments() {
  const [id, setId] = useState("");
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qid = params.get("id");
    console.log("Delete - URL search params:", location.search);
    console.log("Delete - Extracted ID from URL:", qid);
    
    // For testing, also try a hardcoded ID if no ID from URL
    const testId = qid || "68d04845a6a115f632da7783";
    console.log("Delete - Using ID:", testId);
    
    if (testId) {
      setId(testId);
    }
  }, [location.search]);

  // helper formatters
  const formatDateOnly = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString();
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  // fetch appointment details when id changes
  useEffect(() => {
    const load = async () => {
      setAppointment(null);
      setError("");
      if (!id) {
        console.log("Delete - No ID provided, skipping fetch");
        return;
      }
      setLoading(true);
      try {
        console.log("Delete - Fetching appointment with ID:", id);
        const url = `http://localhost:5000/appointment/get/${id}`;
        console.log("Delete - Making request to:", url);
        const res = await axios.get(url);
        console.log("Delete - Appointment response:", res.data);
        const appt = res.data.appointment || res.data;
        console.log("Delete - Processed appointment data:", appt);
        setAppointment(appt);
      } catch (err) {
        console.error("Delete - Failed to load appointment:", err);
        console.error("Delete - Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          url: err.config?.url
        });
        const msg = err?.response?.data || err?.message || JSON.stringify(err);
        setError(msg);
        console.error("Failed to load appointment for delete:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!id) {
      window.alert("Please provide an appointment ID to delete.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this appointment? This cannot be undone.")) return;
    try {
      console.log("Delete - Deleting appointment with ID:", id);
      await axios.delete(`http://localhost:5000/appointment/delete/${id}`);
      window.alert("Appointment deleted!");
      navigate("/patient-dashboard");
    } catch (err) {
      console.error("Delete - Delete error:", err);
      const msg = err?.response?.data || err?.message || JSON.stringify(err);
      window.alert("Error deleting appointment: " + msg);
      console.error("Delete error:", err);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f6f8fa' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar />
        <main style={{ flex: 1, padding: '32px 32px 32px 32px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', background: '#f6f8fa' }}>
          <div className="delete-appointments">
            <h2>Delete Appointment</h2>
           
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 6 }}>Appointment ID</label>
              <input value={id} readOnly placeholder="Appointment ID" style={{ backgroundColor: '#f5f5f5' }} />
            </div>
            {loading ? (
              <div>Loading appointment details...</div>
            ) : error ? (
              <div style={{ color: "red" }}>Failed to load: {error}</div>
            ) : appointment ? (
              <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 6 }}>
                <div><strong>Patient:</strong> {appointment.patient_name || appointment.patient_id}</div>
                <div><strong>Doctor:</strong> {appointment.doctor_name || appointment.doctor_id}</div>
                <div><strong>Date:</strong> {formatDateOnly(appointment.appointment_date || appointment.date)}</div>
                <div><strong>Time:</strong> {appointment.appointment_time || appointment.time || "-"}</div>
                <div><strong>Status:</strong> {appointment.status || "-"}</div>
                <div><strong>Reason:</strong> {appointment.reason || appointment.notes || "-"}</div>
                <div><strong>Follow-up:</strong> {appointment.follow_up && (appointment.follow_up.date || appointment.follow_up.time) ? (`${appointment.follow_up.date ? formatDateTime(appointment.follow_up.date) : "-"} ${appointment.follow_up.time ? `at ${appointment.follow_up.time}` : ""}`) : "-"}</div>
                {appointment.created_at && <div><small>Created: {formatDateTime(appointment.created_at)}</small></div>}
              </div>
            ) : (
              <div>No appointment loaded.</div>
            )}
            <div style={{ marginTop: 12 }}>
              <button onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DeleteAppointments;
