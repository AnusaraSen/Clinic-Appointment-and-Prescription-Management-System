import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PatientLayout } from "../components/PatientLayout";
import "../../../styles/Patient-Interaction/DoctorsPage.css";

function DoctorsPage() {
	const [doctors, setDoctors] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [search, setSearch] = useState("");
	const [specialty, setSpecialty] = useState("");
	const [sort, setSort] = useState("az");
	const navigate = useNavigate();

	useEffect(() => {
		let active = true;
		(async () => {
			setLoading(true); setError(null);
			try {
				const res = await fetch('http://localhost:5000/api/users?role=Doctor');
				const json = await res.json();
				if (!json.success) throw new Error(json.message || 'Failed to fetch doctors');
				if (active) {
					const mapped = (json.data || []).map(u => ({
						_id: u._id || u.id, // force _id presence
						id: undefined, // avoid downstream using legacy id
						name: u.name && u.name.startsWith('Dr.') ? u.name : `Dr. ${u.name}`,
						specialty: u.specialty || u.department || 'General Medicine',
						rating: 4.8, // placeholder until rating implemented
						avatar: u.avatar || 'https://via.placeholder.com/96x96.png?text=Dr'
					}));
					setDoctors(mapped);
				}
			} catch (e) {
				if (active) setError(e.message);
			} finally {
				if (active) setLoading(false);
			}
		})();
		return () => { active = false; };
	}, []);

	const filteredDoctors = doctors
		.filter(d => (
			(!search || d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase())) &&
			(!specialty || specialty === "All" || d.specialty === specialty)
		))
		.sort((a, b) => {
			if (sort === "az") return a.name.localeCompare(b.name);
			if (sort === "za") return b.name.localeCompare(a.name);
			return 0;
		});

	const specialties = ["All", ...Array.from(new Set(doctors.map(d => d.specialty)))] ;

	return (
		<PatientLayout currentPage="doctors">
			<div className="doctors-page">
				<div className="doctors-header">
					<h1 className="h1">Find the Right Doctor</h1>
					<p className="p">Search for specialists and book your appointment with ease.</p>
				</div>
				<div className="doctors-controls">
					<input
						className="doctors-search"
						type="text"
						placeholder="Search doctors by name or specialization"
						value={search}
						onChange={e => setSearch(e.target.value)}
					/>
					<select className="doctors-select" value={specialty} onChange={e => setSpecialty(e.target.value)}>
						{specialties.map(s => (
							<option key={s} value={s}>{s}</option>
						))}
					</select>
					<select className="doctors-sort" value={sort} onChange={e => setSort(e.target.value)}>
						<option value="az">Sort A-Z</option>
						<option value="za">Sort Z-A</option>
					</select>
				</div>
				<div className="doctors-grid">
					{loading && <div style={{gridColumn:'1/-1', textAlign:'center', padding:'2rem'}}>Loading doctors...</div>}
					{!loading && error && <div style={{gridColumn:'1/-1', textAlign:'center', color:'#b91c1c', padding:'2rem'}}>{error}</div>}
					{!loading && !error && filteredDoctors.length===0 && <div style={{gridColumn:'1/-1', textAlign:'center', padding:'2rem'}}>No doctors found.</div>}
					{!loading && !error && filteredDoctors.map((doc, idx) => (
						<div className="doctor-card" key={idx}>
							<img className="doctor-avatar" src={doc.avatar} alt={doc.name} />
							<div className="doctor-name">{doc.name}</div>
							<div className="doctor-specialty">{doc.specialty}</div>
							<div className="doctor-rating">
								<Star size={18} fill="#fbbf24" color="#fbbf24" /> {doc.rating}
							</div>
							<button className="doctor-request-btn" onClick={() => navigate('/appointments/add', { state: { doctor: doc } })}>Request Appointment</button>
						</div>
					))}
				</div>
			</div>
		</PatientLayout>
	);
}

export default DoctorsPage;
