import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import equipmentApi from "../../../../../api/equipmentApi";
import "../../../../../styles/Medicine/UpdateMedicine.css";

export default function UpdateEquipment() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [form, setForm] = useState({
		itemName: "",
		quantity: "",
		unit: "",
		location: "",
		// Equipment-specific fields
		modelNumber: "",
		manufacturer: "",
		calibrationDate: "",
		maintenanceSchedule: "",
		serialNumber: "",
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
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	const conditionOptions = ['Excellent', 'Good', 'Fair', 'Needs Repair', 'Out of Service'];

	useEffect(() => {
		let active = true;
		(async () => {
			try {
				console.log('Loading equipment with ID:', id);
				const res = await equipmentApi.get(`/${id}`);
				console.log('API response:', res.data);
				if (!active) return;
				const equipment = res.data.data;
				console.log('Setting form data:', equipment);
				setForm({
					itemName: equipment.itemName || "",
					quantity: equipment.quantity?.toString() || "",
					unit: equipment.unit || "",
					location: equipment.location || "",
					// Equipment-specific fields
					modelNumber: equipment.modelNumber || "",
					manufacturer: equipment.manufacturer || "",
					calibrationDate: equipment.calibrationDate ? equipment.calibrationDate.split('T')[0] : "",
					maintenanceSchedule: equipment.maintenanceSchedule || "",
					serialNumber: equipment.serialNumber || "",
					purchaseDate: equipment.purchaseDate ? equipment.purchaseDate.split('T')[0] : "",
					warrantyExpiry: equipment.warrantyExpiry ? equipment.warrantyExpiry.split('T')[0] : "",
					condition: equipment.condition || "Good",
					// Additional fields
					reorderLevel: equipment.reorderLevel?.toString() || "",
					supplier: equipment.supplier || "",
					lastMaintenanceDate: equipment.lastMaintenanceDate ? equipment.lastMaintenanceDate.split('T')[0] : "",
					nextMaintenanceDate: equipment.nextMaintenanceDate ? equipment.nextMaintenanceDate.split('T')[0] : "",
					maintenanceNotes: equipment.maintenanceNotes || "",
					userManual: equipment.userManual || "",
					technicalSpecs: equipment.technicalSpecs || ""
				});
			} catch (e) {
				console.error('Error loading equipment:', e);
				if (active) setError(e?.response?.data?.message || "Failed to load equipment");
			} finally {
				if (active) setLoading(false);
			}
		})();
		return () => { active = false; };
	}, [id]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((f) => ({ ...f, [name]: value }));
	};

	const validate = () => {
		if (!form.itemName.trim()) return "Equipment name is required";
		if (form.quantity === "" || isNaN(Number(form.quantity))) return "Quantity must be a number";
		if (Number(form.quantity) < 0) return "Quantity cannot be negative";
		if (!form.unit.trim()) return "Unit is required";
		if (!form.location.trim()) return "Location is required";
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
			const updateData = {
				itemName: form.itemName.trim(),
				quantity: Number(form.quantity),
				unit: form.unit.trim(),
				location: form.location.trim(),
				condition: form.condition
			};

			// Add optional fields if provided
			if (form.modelNumber) updateData.modelNumber = form.modelNumber.trim();
			if (form.manufacturer) updateData.manufacturer = form.manufacturer.trim();
			if (form.calibrationDate) updateData.calibrationDate = form.calibrationDate;
			if (form.maintenanceSchedule) updateData.maintenanceSchedule = form.maintenanceSchedule.trim();
			if (form.serialNumber) updateData.serialNumber = form.serialNumber.trim();
			if (form.purchaseDate) updateData.purchaseDate = form.purchaseDate;
			if (form.warrantyExpiry) updateData.warrantyExpiry = form.warrantyExpiry;
			if (form.reorderLevel) updateData.reorderLevel = Number(form.reorderLevel);
			if (form.supplier) updateData.supplier = form.supplier.trim();
			if (form.lastMaintenanceDate) updateData.lastMaintenanceDate = form.lastMaintenanceDate;
			if (form.nextMaintenanceDate) updateData.nextMaintenanceDate = form.nextMaintenanceDate;
			if (form.maintenanceNotes) updateData.maintenanceNotes = form.maintenanceNotes.trim();
			if (form.userManual) updateData.userManual = form.userManual.trim();
			if (form.technicalSpecs) updateData.technicalSpecs = form.technicalSpecs.trim();

			const response = await equipmentApi.put(`/${id}`, updateData);
			console.log('Equipment updated successfully:', response.data);
			
			alert("✅ Equipment updated successfully!");
			setTimeout(() => {
				navigate("/equipment-inventory", { replace: true });
			}, 100);
		} catch (err) {
			console.error('Equipment update error:', err);
			console.error('Error response:', err.response?.data);
			const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || "Failed to update equipment";
			setError(msg);
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="medicine-container">
				<div className="medicine-loading">
					Loading equipment details...
				</div>
			</div>
		);
	}

	return (
		<div className="medicine-container">
			<div className="medicine-card">
				<h2 className="medicine-title">Update Equipment</h2>

				{error && (
					<div className="medicine-error">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="medicine-form" noValidate>
					<div className="medicine-field">
						<label htmlFor="itemName">Equipment Name *</label>
						<input
							id="itemName"
							type="text"
							name="itemName"
							value={form.itemName}
							onChange={handleChange}
							placeholder="Enter equipment name"
							required
							disabled={submitting}
						/>
					</div>

					<div className="medicine-field">
						<label htmlFor="quantity">Quantity *</label>
						<input
							id="quantity"
							type="number"
							name="quantity"
							value={form.quantity}
							onChange={handleChange}
							placeholder="Enter quantity"
							min="0"
							required
							disabled={submitting}
						/>
					</div>

					<div className="medicine-field">
						<label htmlFor="unit">Unit *</label>
						<input
							id="unit"
							type="text"
							name="unit"
							value={form.unit}
							onChange={handleChange}
							placeholder="Enter unit (e.g., units, pieces, sets)"
							required
							disabled={submitting}
						/>
					</div>

					<div className="medicine-field">
						<label htmlFor="location">Location *</label>
						<input
							id="location"
							type="text"
							name="location"
							value={form.location}
							onChange={handleChange}
							placeholder="Enter location"
							required
							disabled={submitting}
						/>
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
							onChange={handleChange}
							placeholder="e.g. XYZ-2000"
							disabled={submitting}
						/>
					</div>
					<div className="medicine-field">
						<label htmlFor="manufacturer">Manufacturer</label>
						<input
							id="manufacturer"
							name="manufacturer"
							value={form.manufacturer}
							onChange={handleChange}
							placeholder="e.g. Acme Corp"
							disabled={submitting}
						/>
					</div>
					<div className="medicine-field">
						<label htmlFor="serialNumber">Serial Number</label>
						<input
							id="serialNumber"
							name="serialNumber"
							value={form.serialNumber}
							onChange={handleChange}
							placeholder="e.g. SN123456789"
							disabled={submitting}
						/>
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
						<input
							id="maintenanceSchedule"
							name="maintenanceSchedule"
							value={form.maintenanceSchedule}
							onChange={handleChange}
							placeholder="e.g. Monthly, Quarterly, Annual"
							disabled={submitting}
						/>
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
							{submitting ? "Updating..." : "UPDATE EQUIPMENT"}
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