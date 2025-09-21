import React, { useState } from "react";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/SidebarPatient";
import Topbar from "../../components/Topbar";
import "../../styles/Patient-Interaction/DoctorsPage.css";

function DoctorsPage() {
	const doctors = [
		{
			name: "Dr. Emily Rodriguez",
			specialty: "Pediatrics",
			rating: 4.7,
			avatar: "https://randomuser.me/api/portraits/women/44.jpg"
		},
		{
			name: "Dr. James Wilson",
			specialty: "Orthopedics",
			rating: 4.6,
			avatar: "https://randomuser.me/api/portraits/men/45.jpg"
		},
		{
			name: "Dr. Lisa Patel",
			specialty: "Dermatology",
			rating: 4.8,
			avatar: "https://randomuser.me/api/portraits/women/46.jpg"
		},
		{
			name: "Dr. Michael Chen",
			specialty: "Neurology",
			rating: 4.8,
			avatar: "https://randomuser.me/api/portraits/men/47.jpg"
		},
		{
			name: "Dr. Robert Kim",
			specialty: "Ophthalmology",
			rating: 4.7,
			avatar: "https://randomuser.me/api/portraits/men/48.jpg"
		},
		{
			name: "Dr. Sarah Johnson",
			specialty: "Cardiology",
			rating: 4.9,
			avatar: "https://randomuser.me/api/portraits/women/49.jpg"
		}
	];

	const [search, setSearch] = useState("");
	const [specialty, setSpecialty] = useState("");
	const [sort, setSort] = useState("az");
	const navigate = useNavigate();

	// Filter and sort logic
	const filteredDoctors = doctors
		.filter(d =>
			(!search || d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase())) &&
			(!specialty || specialty === "All" || d.specialty === specialty)
		)
		.sort((a, b) => {
			if (sort === "az") return a.name.localeCompare(b.name);
			if (sort === "za") return b.name.localeCompare(a.name);
			return 0;
		});

	const specialties = ["All", ...Array.from(new Set(doctors.map(d => d.specialty)))];

	return (
		<div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa' }}>
			<Sidebar />
			<div style={{ flex: 1, marginLeft: 220 }}>
				<Topbar />
				<main style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
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
							{filteredDoctors.map((doc, idx) => (
								<div className="doctor-card" key={idx}>
									<img className="doctor-avatar" src={doc.avatar} alt={doc.name} />
									<div className="doctor-name">{doc.name}</div>
									<div className="doctor-specialty">{doc.specialty}</div>
									<div className="doctor-rating">
										<Star size={18} fill="#fbbf24" color="#fbbf24" /> {doc.rating}
									</div>
									<button className="doctor-request-btn" onClick={() => navigate('/add', { state: { doctor: doc } })}>Request Appointment</button>
								</div>
							))}
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}

export default DoctorsPage;
