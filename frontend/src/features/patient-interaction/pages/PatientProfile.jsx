import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/SidebarPatient";
import Topbar from "../components/Topbar";
import { CheckCircle2, UploadCloud, Trash2, Download } from "lucide-react";
import "../../../styles/Patient-Interaction/PatientProfile.css";

export default function PatientProfile() {
  const { id } = useParams();
  // Patient and appointments
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Form state
  const [form, setForm] = useState({
    gender: "Unknown",
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    phone: "",
    dateOfBirth: "",
    location: "",
    postalCode: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");
  const [medicalFiles, setMedicalFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Endpoints
  const patientEndpoints = useMemo(() => [
    `http://localhost:5000/patients/id/${id}`,
    `http://127.0.0.1:5000/patients/id/${id}`,
    `/patients/id/${id}`,
  ], [id]);
  const filesEndpoints = useMemo(() => [
    `http://localhost:5000/patients/id/${id}/medical-files`,
    `http://127.0.0.1:5000/patients/id/${id}/medical-files`,
    `/patients/id/${id}/medical-files`,
  ], [id]);

  // Helpers
  const toDateInput = (val) => {
    if (!val) return "";
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const loadData = async () => {
    setLoading(true);
    setError("");
    // fetch patient
    let p = null;
    for (const url of patientEndpoints) {
      try {
        const res = await axios.get(url, { timeout: 5000 });
        if (res?.data) { p = res.data; break; }
      } catch {/* try next */}
    }
    if (!p) {
      setError("Failed to load patient");
      setLoading(false);
      return;
    }
    setPatient(p);
    // seed form
    const nameParts = (p.name || "").trim().split(/\s+/);
    const derivedFirst = p.firstName || nameParts[0] || "";
    const derivedLast = p.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "");
    setForm({
      gender: p.gender || "Unknown",
      firstName: derivedFirst,
      lastName: derivedLast,
      email: p.email || "",
      address: p.address || "",
      phone: p.phone || "",
      dateOfBirth: toDateInput(p.dateOfBirth),
      location: p.location || "",
      postalCode: p.postalCode || "",
    });
  setMedicalNotes(p.medicalNotes || "");
  setAvatarPreview(p.avatar || "");
    // fetch medical files
    await loadFiles();
    setLoading(false);
  };

  const loadFiles = async () => {
    for (const url of filesEndpoints) {
      try {
        const res = await axios.get(url, { timeout: 5000 });
        if (res?.data?.files) { setMedicalFiles(res.data.files); return; }
      } catch {/* try next */}
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };
  const onGender = (g) => setForm((f) => ({ ...f, gender: g }));

  const onDiscard = () => {
    if (!patient) return;
    const nameParts = (patient.name || "").trim().split(/\s+/);
    const derivedFirst = patient.firstName || nameParts[0] || "";
    const derivedLast = patient.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "");
    setForm({
      gender: patient.gender || "Unknown",
      firstName: derivedFirst,
      lastName: derivedLast,
      email: patient.email || "",
      address: patient.address || "",
      phone: patient.phone || "",
      dateOfBirth: toDateInput(patient.dateOfBirth),
      location: patient.location || "",
      postalCode: patient.postalCode || "",
    });
  setMedicalNotes(patient.medicalNotes || "");
  setAvatarPreview(patient.avatar || "");
    setSaved(false);
  };

  const onSave = async () => {
    if (!patient) return;
    setSaving(true);
    setSaved(false);
    const payload = {
      gender: form.gender,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      address: form.address,
      phone: form.phone,
      dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : null,
      location: form.location,
      postalCode: form.postalCode,
      avatar: avatarPreview || null,
      medicalNotes,
      // maintain combined name as well
      name: `${form.firstName || ""}${form.lastName ? " " + form.lastName : ""}`.trim() || patient.name,
    };
    const urls = [
      `http://localhost:5000/patients/id/${patient.id || patient._id}`,
      `http://127.0.0.1:5000/patients/id/${patient.id || patient._id}`,
      `/patients/id/${patient.id || patient._id}`,
    ];
    let ok = false;
    for (const u of urls) {
      try {
        const res = await axios.put(u, payload, { timeout: 5000 });
        if (res?.data) { ok = true; setPatient(res.data); break; }
      } catch {/* try next */}
    }
    setSaving(false);
    setSaved(ok);
  };

  const toAbsolute = (url) => {
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    // Prefer localhost:5000 to avoid dev server handling
    return `http://localhost:5000${url}`;
  };

  const onUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    setUploading(true);
    const fd = new FormData();
    for (const f of selectedFiles) fd.append("files", f);
    let ok = false;
    for (const u of filesEndpoints) {
      try {
        const res = await axios.post(u, fd, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 15000 });
        if (res?.data?.files) { setMedicalFiles(res.data.files); ok = true; break; }
      } catch {/* try next */}
    }
    setUploading(false);
    if (ok) setSelectedFiles([]);
  };

  const onDeleteFile = async (fileId) => {
    if (!fileId) return;
    const urls = filesEndpoints.map(base => `${base}/${fileId}`);
    for (const u of urls) {
      try {
        const res = await axios.delete(u, { timeout: 8000 });
        if (res?.data?.success) { await loadFiles(); return; }
      } catch {/* next */}
    }
  };

  return (
    <div className="profile-layout">
      <Sidebar />
      <div className="profile-main">
        <Topbar />
        <main className="profile-content">
          <div className="profile-grid">
            {/* LEFT PANEL */}
            <aside className="profile-left">
              <div className="profile-card">
                <div className="profile-avatar-wrap">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt={patient?.name || "Patient"} />
                  ) : (
                    <div className="profile-avatar-fallback" />
                  )}
                  <label className="avatar-edit">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          setAvatarPreview(reader.result?.toString() || "");
                        };
                        reader.readAsDataURL(file);
                      }}
                      style={{ display: 'none' }}
                    />
                    <span>Change</span>
                  </label>
                </div>
                <div className="profile-name">{patient?.name || "Patient"}</div>
                <div className="profile-role">Patient</div>
                <div className="profile-menu">
                  <div className="menu-item active">Personal Information</div>
                  <div className="menu-item">Login & Password</div>
                  <div className="menu-item">Log Out</div>
                </div>
              </div>
            </aside>

            {/* RIGHT PANEL */}
            <section className="profile-right">
              <div className="form-card span-2">
                <div className="form-title">Personal Information</div>

                {loading ? (
                  <div style={{ padding: 8 }}>Loading...</div>
                ) : error ? (
                  <div style={{ color: 'red', padding: 8 }}>{String(error)}</div>
                ) : (
                  <>
                    {/* Gender */}
                    <div className="gender-row">
                      {['Male','Female','Other'].map(g => (
                        <label key={g} className="radio-pill">
                          <input type="radio" name="gender" checked={form.gender === g} onChange={() => onGender(g)} />
                          <span>{g}</span>
                        </label>
                      ))}
                    </div>

                    {/* Two-column form grid */}
                    <div className="form-grid">
                      <div className="form-field">
                        <label>First Name</label>
                        <input name="firstName" value={form.firstName} onChange={onChange} placeholder="First name" />
                      </div>
                      <div className="form-field">
                        <label>Last Name</label>
                        <input name="lastName" value={form.lastName} onChange={onChange} placeholder="Last name" />
                      </div>

                      <div className="form-field full">
                        <label>Email</label>
                        <div className="with-addon">
                          <input name="email" value={form.email} onChange={onChange} placeholder="name@email.com" />
                          {form.email ? (
                            <span className="verified"><CheckCircle2 size={16} /> Verified</span>
                          ) : null}
                        </div>
                      </div>

                      <div className="form-field full">
                        <label>Address</label>
                        <input name="address" value={form.address} onChange={onChange} placeholder="Street, City" />
                      </div>

                      <div className="form-field">
                        <label>Phone Number</label>
                        <input name="phone" value={form.phone} onChange={onChange} placeholder="(555) 000-0000" />
                      </div>
                      <div className="form-field">
                        <label>Date of Birth</label>
                        <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={onChange} />
                      </div>

                      <div className="form-field">
                        <label>Location</label>
                        <select name="location" value={form.location} onChange={onChange}>
                          <option value="">Select location</option>
                          <option>Colombo, Sri Lanka</option>
                          <option>Kandy, Sri Lanka</option>
                          <option>Galle, Sri Lanka</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div className="form-field">
                        <label>Postal Code</label>
                        <input name="postalCode" value={form.postalCode} onChange={onChange} placeholder="Postal code" />
                      </div>
                    </div>

                    <div className="actions">
                      <button className="btn-outline" onClick={onDiscard}>Discard Changes</button>
                      <button className="btn-primary" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
                      {saved && <span className="saved-flag">Saved</span>}
                    </div>
                  </>
                )}
              </div>

              {/* Recent Appointments container removed as requested */}

              {/* Past Medical Notes */}
              <div className="notes-card">
                <div className="section-title">Past Medical Notes</div>
                <textarea
                  className="notes-textarea"
                  rows={6}
                  placeholder="Add important medical history, allergies, chronic conditions, or notes from previous visits..."
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                />
                <div className="actions" style={{ justifyContent: 'flex-end' }}>
                  <button className="btn-primary" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save Notes'}</button>
                </div>
              </div>

              {/* Past Medical Files */}
              <div className="files-card">
                <div className="section-title">Past Medical Files</div>
                <div className="file-uploader">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                  />
                  <button className="btn-primary" onClick={onUpload} disabled={uploading || selectedFiles.length === 0}>
                    <UploadCloud size={16} style={{ marginRight: 6 }} /> {uploading ? 'Uploading…' : 'Upload'}
                  </button>
                </div>
                <div className="files-list">
                  {medicalFiles && medicalFiles.length > 0 ? medicalFiles.slice().reverse().map((f) => (
                    <div key={f._id || f.filename} className="file-row">
                      <div className="file-main">
                        <div className="file-name">{f.originalName || f.filename}</div>
                        <div className="file-meta">{f.mimeType} • {(Math.max(0, f.size || 0)/1024).toFixed(1)} KB • {new Date(f.uploadedAt).toLocaleString()}</div>
                      </div>
                      <div className="file-actions">
                        <a className="btn-outline small" href={toAbsolute(f.url)} target="_blank" rel="noreferrer">
                          <Download size={16} />
                        </a>
                        <button className="btn-danger small" onClick={() => onDeleteFile(f._id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )) : <div className="muted">No files uploaded yet</div>}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
