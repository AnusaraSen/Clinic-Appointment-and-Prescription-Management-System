import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import chemicalApi from "../../../../../api/chemicalApi";
import "../../../../../styles/Medicine/MedicineForm.css";

function generateChemicalBatchNumber() {
	const d = new Date();
	const y = String(d.getFullYear()).slice(2);
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
	return `CH-${y}${m}${day}-${rnd}`;
}

export default function InsertChemical() {
	const navigate = useNavigate();

	const UNIT_OPTIONS = useMemo(() => [
		"g",
		"kg",
		"mg",
		"µg",
		"ml",
		"L",
		"bottles",
		"vials",
		"tubes",
	], []);

	const PH_LEVEL_OPTIONS = useMemo(() => [
		"1-3 (Strongly acidic)",
		"4-6 (Acidic)",
		"7 (Neutral)",
		"8-10 (Basic)",
		"11-14 (Strongly basic)",
	], []);

	const STORAGE_TEMP_OPTIONS = useMemo(() => [
		"Room temperature (20-25°C)",
		"Refrigerated (2-8°C)",
		"Frozen (-20°C)",
		"Deep frozen (-80°C)",
	], []);

	const LOCATION_OPTIONS = useMemo(() => [
		"Chemical Storage A",
		"Chemical Storage B",
		"Flammable Cabinet",
		"Acid Cabinet",
		"Base Cabinet",
		"Refrigerator 1",
		"Refrigerator 2",
		"Freezer -20°C",
		"Freezer -80°C",
	], []);

	const CONCENTRATION_OPTIONS = useMemo(() => [
		"0.1 M",
		"0.5 M",
		"1 M",
		"5%",
		"10%",
		"25%",
		"50%",
		"100%",
		"Saturated",
	], []);

	const HAZARD_CLASS_OPTIONS = useMemo(() => [
		"Flammable",
		"Corrosive",
		"Toxic",
		"Oxidizer",
		"Irritant",
		"Explosive",
		"Compressed Gas",
		"Environmental Hazard",
	], []);
	const [form, setForm] = useState({
		itemName: "",
		quantity: "",
		unit: "",
		location: "",
		expiryDate: "",
		// Chemical-specific fields
		concentration: "",
		phLevel: "",
		hazardClass: "",
		storageTemp: "",
		// Additional fields
		reorderLevel: "",
		supplier: "",
		batchNumber: generateChemicalBatchNumber(),
		safetyDataSheet: "",
		handlingInstructions: ""
	});
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((f) => ({ ...f, [name]: value }));
	};

	const validate = () => {
		if (!form.itemName.trim()) return "Chemical name is required";
		if (form.quantity === "" || isNaN(Number(form.quantity))) return "Quantity must be a number";
		if (Number(form.quantity) < 0) return "Quantity cannot be negative";
		if (!form.unit.trim()) return "Unit is required";
		if (!form.location.trim()) return "Location is required";
		if (!form.expiryDate) return "Expiry date is required";
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
				unit: form.unit.trim(),
				location: form.location.trim(),
				expiryDate: form.expiryDate
			};

			// Add optional fields if provided
			if (form.concentration) submissionData.concentration = form.concentration.trim();
			if (form.phLevel) submissionData.phLevel = form.phLevel.trim();
			if (form.hazardClass) submissionData.hazardClass = form.hazardClass.trim();
			if (form.storageTemp) submissionData.storageTemp = form.storageTemp.trim();
			if (form.reorderLevel) submissionData.reorderLevel = Number(form.reorderLevel);
			if (form.supplier) submissionData.supplier = form.supplier.trim();
			if (form.batchNumber) submissionData.batchNumber = form.batchNumber.trim();
			if (form.safetyDataSheet) submissionData.safetyDataSheet = form.safetyDataSheet.trim();
			if (form.handlingInstructions) submissionData.handlingInstructions = form.handlingInstructions.trim();

			const response = await chemicalApi.post("/", submissionData);
			console.log('Chemical created successfully:', response.data);
			
			alert("✅ Chemical added successfully!");
			navigate("/chemical-inventory");
		} catch (err) {
			console.error('Error creating chemical:', err);
			if (err.response?.status === 409 || err.response?.data?.message?.includes('already exists')) {
				setError("A chemical with this name already exists. Please choose a different name.");
			} else if (err.response?.data?.message) {
				setError(err.response.data.message);
			} else {
				setError("Failed to add chemical. Please try again.");
			}
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="medicine-container">
			<div className="medicine-card">
				<h2 className="medicine-title">Add Chemical</h2>
				{error && <div className="medicine-error">{error}</div>}
				<form onSubmit={handleSubmit} className="medicine-form" noValidate>
					<div className="medicine-field">
						<label htmlFor="itemName">Chemical Name *</label>
						<input
							id="itemName"
							name="itemName"
							value={form.itemName}
							onChange={handleChange}
							placeholder="e.g. Sodium Chloride"
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
							placeholder="e.g. 100"
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
							{UNIT_OPTIONS.map((opt) => (
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
							<option value="">Select storage location</option>
							{LOCATION_OPTIONS.map((opt) => (
								<option key={opt} value={opt}>{opt}</option>
							))}
						</select>
					</div>
					
					<div className="medicine-field">
						<label htmlFor="expiryDate">Expiry Date *</label>
						<input
							type="date"
							id="expiryDate"
							name="expiryDate"
							value={form.expiryDate}
							onChange={handleChange}
							required
							disabled={submitting}
						/>
					</div>

					{/* Chemical-specific fields */}
					<div className="medicine-field">
						<label htmlFor="concentration">Concentration</label>
						<select
							id="concentration"
							name="concentration"
							value={form.concentration}
							onChange={handleChange}
							disabled={submitting}
						>
							<option value="">Select concentration</option>
							{CONCENTRATION_OPTIONS.map((opt) => (
								<option key={opt} value={opt}>{opt}</option>
							))}
						</select>
					</div>
					
					<div className="medicine-field">
						<label htmlFor="phLevel">pH Level</label>
						<select
							id="phLevel"
							name="phLevel"
							value={form.phLevel}
							onChange={handleChange}
							disabled={submitting}
						>
							<option value="">Select pH range</option>
							{PH_LEVEL_OPTIONS.map((opt) => (
								<option key={opt} value={opt}>{opt}</option>
							))}
						</select>
					</div>
					
					<div className="medicine-field">
						<label htmlFor="hazardClass">Hazard Class</label>
						<select
							id="hazardClass"
							name="hazardClass"
							value={form.hazardClass}
							onChange={handleChange}
							disabled={submitting}
						>
							<option value="">Select hazard class</option>
							{HAZARD_CLASS_OPTIONS.map((opt) => (
								<option key={opt} value={opt}>{opt}</option>
							))}
						</select>
					</div>
					
					<div className="medicine-field">
						<label htmlFor="storageTemp">Storage Temperature</label>
						<select
							id="storageTemp"
							name="storageTemp"
							value={form.storageTemp}
							onChange={handleChange}
							disabled={submitting}
						>
							<option value="">Select storage temperature</option>
							{STORAGE_TEMP_OPTIONS.map((opt) => (
								<option key={opt} value={opt}>{opt}</option>
							))}
						</select>
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
							placeholder="e.g. 10"
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
							placeholder="e.g. ChemCorp Inc."
							disabled={submitting}
						/>
					</div>
					
					<div className="medicine-field">
						<label htmlFor="batchNumber">Batch Number</label>
						<input
							id="batchNumber"
							name="batchNumber"
							value={form.batchNumber}
							readOnly
							placeholder="Auto-generated batch number"
							disabled={submitting}
						/>
						<div style={{ color: "#64748b", fontSize: 12 }}>Auto-generated (duplicates allowed)</div>
					</div>
					
					<div className="medicine-field" style={{ gridColumn: '1 / -1' }}>
						<label htmlFor="safetyDataSheet">Safety Data Sheet URL</label>
						<input
							id="safetyDataSheet"
							name="safetyDataSheet"
							value={form.safetyDataSheet}
							onChange={handleChange}
							placeholder="e.g. https://example.com/sds/chemical.pdf"
							disabled={submitting}
						/>
					</div>
					
					<div className="medicine-field" style={{ gridColumn: '1 / -1' }}>
						<label htmlFor="handlingInstructions">Handling Instructions</label>
						<textarea
							id="handlingInstructions"
							name="handlingInstructions"
							value={form.handlingInstructions}
							onChange={handleChange}
							placeholder="Special handling instructions..."
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
							{submitting ? "Adding..." : "ADD CHEMICAL"}
						</button>
						<button
							type="button"
							className="medicine-btn medicine-btn-secondary"
							onClick={() => navigate("/chemical-inventory")}
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