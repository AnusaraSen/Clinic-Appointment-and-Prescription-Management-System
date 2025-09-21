
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/Patient-Interaction/AllAppointments.css";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/SidebarPatient";
import Topbar from "../../components/Topbar";

function formatDateOnly(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
}

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function AllAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Try proxy first (works when `proxy` is set in frontend/package.json),
  // then fall back to absolute addresses.
  const endpoints = [
    "/appointment/", // proxy to backend when dev server is used
    "http://localhost:5000/appointment/",
    "http://127.0.0.1:5000/appointment/",
  ];

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    setAppointments([]);
    let lastErr = null;

    for (const url of endpoints) {
      try {
        // short timeout helps fail fast during diagnostics
        const res = await axios.get(url, { timeout: 5000 });
        setAppointments(res.data || []);
        setLoading(false);
        setError("");
        return;
      } catch (err) {
        lastErr = err;
        // keep trying next endpoint
        console.warn(`Failed to fetch from ${url}:`, err?.response?.status, err?.message || err);
      }
    }

    // After trying all endpoints — show actionable message with details
    const status = lastErr?.response?.status;
    const data = lastErr?.response?.data;
    const msg = data || lastErr?.message || "Failed to reach backend";
    setError(
      `Unable to reach backend. Tried: ${endpoints.join(", ")}.\nStatus: ${status || "n/a"}. Error: ${msg}.\nSuggestions: ensure backend is running on port 5000, check CORS, or open the browser devtools network tab for more details.`
    );
    console.error("All fetch attempts failed:", { status, data, err: lastErr });
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Topbar />
        <main style={{ padding: '32px', maxWidth: 1440, margin: '0 auto' }}>
          <div className="all-appointments">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>All Appointments</h2>
              <div>
                <button className="redo-btn" onClick={fetchAppointments} disabled={loading}>
                  {loading ? "Loading..." : "Refresh"}
                </button>
              </div>
            </div>
            {error && (
              <div style={{ color: "red", marginBottom: "1rem", whiteSpace: "pre-wrap" }}>
                {error}
              </div>
            )}
            {loading ? (
              <div>Loading appointments...</div>
            ) : appointments.length === 0 ? (
              <div>No appointments found.</div>
            ) : (
              <div className="appointments-table-container">
                <table className="appointments-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Reason</th>
                      <th>Follow-up</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((app) => (
                      <tr key={app._id}>
                        <td>{app.patient_id && typeof app.patient_id === 'object' ? app.patient_id.name : app.patient_id}</td>
                        <td>{app.doctor_id && typeof app.doctor_id === 'object' ? app.doctor_id.name : app.doctor_id}</td>
                        <td>{formatDateOnly(app.date)}</td>
                        <td>{app.time || "-"}</td>
                        <td>{app.status || "-"}</td>
                        <td>{app.reason || "-"}</td>
                        <td>
                          {(() => {
                            const fuDate = app?.follow_up?.date || app?.follow_up_date;
                            const fuTime = app?.follow_up?.time || app?.follow_up_time;
                            if (!fuDate && !fuTime) return "-";
                            const dateStr = fuDate ? formatDateOnly(fuDate) : "";
                            const timeStr = fuTime ? String(fuTime) : "";
                            return `${dateStr}${dateStr && timeStr ? " " : ""}${timeStr}` || "-";
                          })()}
                        </td>
                        <td>{app.created_at ? formatDateTime(app.created_at) : "-"}</td>
                        <td>
                          <button onClick={() => navigate(`/update?id=${app._id}`)} style={{ marginRight: 8 }}>
                            Update
                          </button>
                          <button onClick={() => navigate(`/delete?id=${app._id}`)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AllAppointments;
