import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import chemicalApi from "../../../../../api/chemicalApi";
import "../../../../../styles/Medicine/UpdateMedicine.css";

export default function UpdateChemical() {
	const { id } = useParams();
	const navigate = useNavigate();
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
		batchNumber: "",
		safetyDataSheet: "",
		handlingInstructions: ""
	});
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		let active = true;
		(async () => {
			try {
				console.log('Loading chemical with ID:', id);
				const res = await chemicalApi.get(`/${id}`);
				console.log('API response:', res.data);
				if (!active) return;
				const chemical = res.data.data;
				console.log('Setting form data:', chemical);
				setForm({
					itemName: chemical.itemName || "",
					quantity: chemical.quantity?.toString() || "",
					unit: chemical.unit || "",
					location: chemical.location || "",
					expiryDate: chemical.expiryDate ? chemical.expiryDate.split('T')[0] : "",
					// Chemical-specific fields
					concentration: chemical.concentration || "",
					phLevel: chemical.phLevel || "",
					hazardClass: chemical.hazardClass || "",
					storageTemp: chemical.storageTemp || "",
					// Additional fields
					reorderLevel: chemical.reorderLevel?.toString() || "",
					supplier: chemical.supplier || "",
					batchNumber: chemical.batchNumber || "",
					safetyDataSheet: chemical.safetyDataSheet || "",
					handlingInstructions: chemical.handlingInstructions || ""
				});
			} catch (e) {
				console.error('Error loading chemical:', e);
				if (active) setError(e?.response?.data?.message || "Failed to load chemical");
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
			const updateData = {
				itemName: form.itemName.trim(),
				quantity: Number(form.quantity),
				unit: form.unit.trim(),
				location: form.location.trim(),
				expiryDate: form.expiryDate
			};

			// Add optional fields if provided
			if (form.concentration) updateData.concentration = form.concentration.trim();
			if (form.phLevel) updateData.phLevel = form.phLevel.trim();
			if (form.hazardClass) updateData.hazardClass = form.hazardClass.trim();
			if (form.storageTemp) updateData.storageTemp = form.storageTemp.trim();
			if (form.reorderLevel) updateData.reorderLevel = Number(form.reorderLevel);
			if (form.supplier) updateData.supplier = form.supplier.trim();
			if (form.batchNumber) updateData.batchNumber = form.batchNumber.trim();
			if (form.safetyDataSheet) updateData.safetyDataSheet = form.safetyDataSheet.trim();
			if (form.handlingInstructions) updateData.handlingInstructions = form.handlingInstructions.trim();

			const response = await chemicalApi.put(`/${id}`, updateData);
			console.log('Chemical updated successfully:', response.data);
			
			alert("✅ Chemical updated successfully!");
			setTimeout(() => {
				navigate("/chemical-inventory", { replace: true });
			}, 100);
		} catch (err) {
			console.error('Chemical update error:', err);
			console.error('Error response:', err.response?.data);
			const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || "Failed to update chemical";
			setError(msg);
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="medicine-container">
				<div className="medicine-loading">
					Loading chemical details...
				</div>
			</div>
		);
	}

	return (
		<div className="medicine-container">
			<div className="medicine-card">
				<h2 className="medicine-title">Update Chemical</h2>

				{error && (
					<div className="medicine-error">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="medicine-form" noValidate>
					<div className="medicine-field">
						<label htmlFor="itemName">Chemical Name *</label>
						<input
							id="itemName"
							type="text"
							name="itemName"
							value={form.itemName}
							onChange={handleChange}
							placeholder="Enter chemical name"
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
							placeholder="Enter unit (e.g., bottles, liters, kg)"
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
							placeholder="Enter storage location"
							required
							disabled={submitting}
						/>
					</div>

					<div className="medicine-field">
						<label htmlFor="expiryDate">Expiry Date *</label>
						<input
							id="expiryDate"
							type="date"
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
						<input
							id="concentration"
							name="concentration"
							value={form.concentration}
							onChange={handleChange}
							placeholder="e.g. 10%, 0.1M"
							disabled={submitting}
						/>
					</div>
					<div className="medicine-field">
						<label htmlFor="phLevel">pH Level</label>
						<input
							id="phLevel"
							name="phLevel"
							value={form.phLevel}
							onChange={handleChange}
							placeholder="e.g. 7.4, acidic, basic"
							disabled={submitting}
						/>
					</div>
					<div className="medicine-field">
						<label htmlFor="hazardClass">Hazard Class</label>
						<input
							id="hazardClass"
							name="hazardClass"
							value={form.hazardClass}
							onChange={handleChange}
							placeholder="e.g. Corrosive, Toxic, Flammable"
							disabled={submitting}
						/>
					</div>
					<div className="medicine-field">
						<label htmlFor="storageTemp">Storage Temperature</label>
						<input
							id="storageTemp"
							name="storageTemp"
							value={form.storageTemp}
							onChange={handleChange}
							placeholder="e.g. Room temp, 2-8°C, -20°C"
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
							onChange={handleChange}
							placeholder="e.g. B12345"
							disabled={submitting}
						/>
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
							{submitting ? "Updating..." : "UPDATE CHEMICAL"}
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