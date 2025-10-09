import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import equipmentApi from "../../../../../api/equipmentApi";
import "../../../../../styles/Medicine/MedicineForm.css";

function generateModelNumber() {
	const d = new Date();
	const y = String(d.getFullYear()).slice(2);
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	const rnd = Math.random().toString(36).slice(2, 5).toUpperCase();
	return `EQ-${y}${m}${day}-${rnd}`;
}

function generateSerialNumber() {
	const d = new Date();
	const y = String(d.getFullYear()).slice(2);
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
	return `SN-${y}${m}${day}-${rnd}`;
}

export default function InsertEquipment() {
	const navigate = useNavigate();
	const UNIT_OPTIONS = useMemo(() => [
		'units', 'pieces', 'sets', 'kits', 'boxes'
	], []);
	const MANUFACTURER_OPTIONS = useMemo(() => [
		'Acme Corp', 'MedTech', 'BioLab Instruments', 'OptiView', 'ThermoTech', 'Other'
	], []);
	const LOCATION_OPTIONS = useMemo(() => [
		'Lab Room 201', 'Lab Room 202', 'Equipment Store A', 'Equipment Store B', 'Maintenance Bay'
	], []);
	const MAINTENANCE_SCHEDULE_OPTIONS = useMemo(() => [
		'Monthly', 'Quarterly', 'Bi-Annual', 'Annual', 'As Needed'
	], []);
	const [form, setForm] = useState({
		itemName: "",
		quantity: "",
		unit: "",
		location: "",
		// Equipment-specific fields
			modelNumber: generateModelNumber(),
			manufacturer: "",
		calibrationDate: "",
		maintenanceSchedule: "",
			serialNumber: generateSerialNumber(),
		purchaseDate: "",
		warrantyExpiry: "",
		condition: "Good",
		// Additional fields
		reorderLevel: "",
		supplier: "",
		lastMaintenanceDate: "",
		nextMaintenanceDate: "",
		maintenanceNotes: "",
		userManual: "",
		technicalSpecs: ""
	});
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	const conditionOptions = ['Excellent', 'Good', 'Fair', 'Needs Repair', 'Out of Service'];

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((f) => ({ ...f, [name]: value }));
	};

	const validate = () => {
		if (!form.itemName.trim()) return "Equipment name is required";
		if (form.quantity === "" || isNaN(Number(form.quantity))) return "Quantity must be a number";
		if (Number(form.quantity) < 0) return "Quantity cannot be negative";
			if (!form.unit) return "Unit is required";
			if (!form.location) return "Location is required";
		if (form.reorderLevel && (isNaN(Number(form.reorderLevel)) || Number(form.reorderLevel) < 0)) {
			return "Reorder level must be a positive number";
		}
		return "";
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		const v = validate();
		if (v) {
			setError(v);
			return;
		}
		try {
			setSubmitting(true);
			const submissionData = {
				itemName: form.itemName.trim(),
				quantity: Number(form.quantity),
						unit: form.unit,
						location: form.location,
				condition: form.condition
			};

			// Add optional fields if provided
			if (form.modelNumber) submissionData.modelNumber = form.modelNumber.trim();
			if (form.manufacturer) submissionData.manufacturer = form.manufacturer;
			if (form.calibrationDate) submissionData.calibrationDate = form.calibrationDate;
			if (form.maintenanceSchedule) submissionData.maintenanceSchedule = form.maintenanceSchedule;
			if (form.serialNumber) submissionData.serialNumber = form.serialNumber.trim();
			if (form.purchaseDate) submissionData.purchaseDate = form.purchaseDate;
			if (form.warrantyExpiry) submissionData.warrantyExpiry = form.warrantyExpiry;
			if (form.reorderLevel) submissionData.reorderLevel = Number(form.reorderLevel);
			if (form.supplier) submissionData.supplier = form.supplier.trim();
			if (form.lastMaintenanceDate) submissionData.lastMaintenanceDate = form.lastMaintenanceDate;
			if (form.nextMaintenanceDate) submissionData.nextMaintenanceDate = form.nextMaintenanceDate;
			if (form.maintenanceNotes) submissionData.maintenanceNotes = form.maintenanceNotes.trim();
			if (form.userManual) submissionData.userManual = form.userManual.trim();
			if (form.technicalSpecs) submissionData.technicalSpecs = form.technicalSpecs.trim();

			const response = await equipmentApi.post("/", submissionData);
			console.log('Equipment created successfully:', response.data);
			
			alert("✅ Equipment added successfully!");
					navigate("/equipment-inventory");
		} catch (err) {
			console.error('Error creating equipment:', err);
			if (err.response?.status === 409 || err.response?.data?.message?.includes('already exists')) {
				setError("Equipment with this name already exists. Please choose a different name.");
			} else if (err.response?.data?.message) {
				setError(err.response.data.message);
			} else {
				setError("Failed to add equipment. Please try again.");
			}
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="medicine-container">
			<div className="medicine-card">
				<h2 className="medicine-title">Add Equipment</h2>
				{error && <div className="medicine-error">{error}</div>}
				<form onSubmit={handleSubmit} className="medicine-form" noValidate>
					<div className="medicine-field">
						<label htmlFor="itemName">Equipment Name *</label>
						<input
							id="itemName"
							name="itemName"
							value={form.itemName}
							onChange={handleChange}
							placeholder="e.g. Digital Microscope"
							required
							disabled={submitting}
						/>
					</div>
					
					<div className="medicine-field">
						<label htmlFor="quantity">Quantity *</label>
						<input
							type="number"
							id="quantity"
							name="quantity"
							value={form.quantity}
							onChange={handleChange}
							placeholder="e.g. 5"
							min="0"
							required
							disabled={submitting}
						/>
					</div>
					
					<div className="medicine-field">
						<label htmlFor="unit">Unit *</label>
								<select
									id="unit"
									name="unit"
									value={form.unit}
									onChange={handleChange}
									required
									disabled={submitting}
								>
									<option value="">Select unit</option>
									{UNIT_OPTIONS.map(opt => (
										<option key={opt} value={opt}>{opt}</option>
									))}
								</select>
					</div>
					
					<div className="medicine-field">
						<label htmlFor="location">Location *</label>
								<select
									id="location"
									name="location"
									value={form.location}
									onChange={handleChange}
									required
									disabled={submitting}
								>
									<option value="">Select location</option>
									{LOCATION_OPTIONS.map(opt => (
										<option key={opt} value={opt}>{opt}</option>
									))}
								</select>
					</div>
					
					<div className="medicine-field">
						<label htmlFor="condition">Condition</label>
						<select
							id="condition"
							name="condition"
							value={form.condition}
							onChange={handleChange}
							disabled={submitting}
						>
							{conditionOptions.map(option => (
								<option key={option} value={option}>{option}</option>
							))}
						</select>
					</div>

					{/* Equipment-specific fields */}
					<div className="medicine-field">
						<label htmlFor="modelNumber">Model Number</label>
								<input
							id="modelNumber"
							name="modelNumber"
							value={form.modelNumber}
							placeholder="e.g. XYZ-2000"
									readOnly
							disabled={submitting}
						/>
								<div style={{ color: '#64748b', fontSize: 12 }}>Auto-generated</div>
					</div>
					
					<div className="medicine-field">
						<label htmlFor="manufacturer">Manufacturer</label>
								<select
									id="manufacturer"
									name="manufacturer"
									value={form.manufacturer}
									onChange={handleChange}
									disabled={submitting}
								>
									<option value="">Select manufacturer</option>
									{MANUFACTURER_OPTIONS.map(opt => (
										<option key={opt} value={opt}>{opt}</option>
									))}
								</select>
					</div>
					
					<div className="medicine-field">
						<label htmlFor="serialNumber">Serial Number</label>
								<input
							id="serialNumber"
							name="serialNumber"
							value={form.serialNumber}
							placeholder="e.g. SN123456789"
									readOnly
							disabled={submitting}
						/>
								<div style={{ color: '#64748b', fontSize: 12 }}>Auto-generated</div>
					</div>
					
					<div className="medicine-field">
						<label htmlFor="calibrationDate">Calibration Date</label>
						<input
							type="date"
							id="calibrationDate"
							name="calibrationDate"
							value={form.calibrationDate}
							onChange={handleChange}
							disabled={submitting}
						/>
					</div>
					
					<div className="medicine-field">
						<label htmlFor="purchaseDate">Purchase Date</label>
						<input
							type="date"
							id="purchaseDate"
							name="purchaseDate"
							value={form.purchaseDate}
							onChange={handleChange}
							disabled={submitting}
						/>
					</div>
					
					<div className="medicine-field">
						<label htmlFor="warrantyExpiry">Warranty Expiry</label>
						<input
							type="date"
							id="warrantyExpiry"
							name="warrantyExpiry"
							value={form.warrantyExpiry}
							onChange={handleChange}
							disabled={submitting}
						/>
					</div>

					{/* Maintenance fields */}
					<div className="medicine-field">
						<label htmlFor="maintenanceSchedule">Maintenance Schedule</label>
								<select
									id="maintenanceSchedule"
									name="maintenanceSchedule"
									value={form.maintenanceSchedule}
									onChange={handleChange}
									disabled={submitting}
								>
									<option value="">Select schedule</option>
									{MAINTENANCE_SCHEDULE_OPTIONS.map(opt => (
										<option key={opt} value={opt}>{opt}</option>
									))}
								</select>
					</div>
					
					<div className="medicine-field">
						<label htmlFor="lastMaintenanceDate">Last Maintenance Date</label>
						<input
							type="date"
							id="lastMaintenanceDate"
							name="lastMaintenanceDate"
							value={form.lastMaintenanceDate}
							onChange={handleChange}
							disabled={submitting}
						/>
					</div>
					
					<div className="medicine-field">
						<label htmlFor="nextMaintenanceDate">Next Maintenance Date</label>
						<input
							type="date"
							id="nextMaintenanceDate"
							name="nextMaintenanceDate"
							value={form.nextMaintenanceDate}
							onChange={handleChange}
							disabled={submitting}
						/>
					</div>

					{/* Additional fields */}
					<div className="medicine-field">
						<label htmlFor="reorderLevel">Reorder Level</label>
						<input
							type="number"
							id="reorderLevel"
							name="reorderLevel"
							value={form.reorderLevel}
							onChange={handleChange}
							placeholder="e.g. 5"
							min="0"
							disabled={submitting}
						/>
					</div>
					
					<div className="medicine-field">
						<label htmlFor="supplier">Supplier</label>
						<input
							id="supplier"
							name="supplier"
							value={form.supplier}
							onChange={handleChange}
							placeholder="e.g. TechSupply Inc."
							disabled={submitting}
						/>
					</div>
					
					<div className="medicine-field" style={{ gridColumn: '1 / -1' }}>
						<label htmlFor="userManual">User Manual URL</label>
						<input
							id="userManual"
							name="userManual"
							value={form.userManual}
							onChange={handleChange}
							placeholder="e.g. https://example.com/manual/equipment.pdf"
							disabled={submitting}
						/>
					</div>
					
					<div className="medicine-field" style={{ gridColumn: '1 / -1' }}>
						<label htmlFor="maintenanceNotes">Maintenance Notes</label>
						<textarea
							id="maintenanceNotes"
							name="maintenanceNotes"
							value={form.maintenanceNotes}
							onChange={handleChange}
							placeholder="Special maintenance instructions..."
							rows="3"
							disabled={submitting}
							style={{ resize: 'vertical' }}
						/>
					</div>
					
					<div className="medicine-field" style={{ gridColumn: '1 / -1' }}>
						<label htmlFor="technicalSpecs">Technical Specifications</label>
						<textarea
							id="technicalSpecs"
							name="technicalSpecs"
							value={form.technicalSpecs}
							onChange={handleChange}
							placeholder="Technical specifications and details..."
							rows="3"
							disabled={submitting}
							style={{ resize: 'vertical' }}
						/>
					</div>

					<div className="medicine-actions" style={{ gridColumn: '1 / -1' }}>
						<button 
							type="submit" 
							className="medicine-btn medicine-btn-primary"
							disabled={submitting}
						>
							{submitting ? "Adding..." : "ADD EQUIPMENT"}
						</button>
						<button
							type="button"
							className="medicine-btn medicine-btn-secondary"
							onClick={() => navigate("/equipment-inventory")}
							disabled={submitting}
						>
							CANCEL
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}