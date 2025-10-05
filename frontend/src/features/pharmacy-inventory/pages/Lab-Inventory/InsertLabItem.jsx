import { useState } from "react";
import { useNavigate } from "react-router-dom";
import labApi from "../../../../api/labApi";
import "../../../../styles/LabInventory/InsertLabItem.css";

export default function InsertLabItem() {
	const navigate = useNavigate();
	const [form, setForm] = useState({
		itemName: "",
		quantity: "",
		unit: "",
		location: "",
		expiryDate: ""
	});
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((f) => ({ ...f, [name]: value }));
	};

	const validate = () => {
		if (!form.itemName.trim()) return "Item name is required";
		if (form.quantity === "" || isNaN(Number(form.quantity))) return "Quantity must be a number";
		if (Number(form.quantity) < 0) return "Quantity cannot be negative";
		if (!form.unit.trim()) return "Unit is required";
		if (!form.location.trim()) return "Location is required";
		if (!form.expiryDate) return "Expiry date is required";
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
			console.log('Submitting lab item:', {
				itemName: form.itemName.trim(),
				quantity: Number(form.quantity),
				unit: form.unit.trim(),
				location: form.location.trim(),
				expiryDate: form.expiryDate
			});
			const response = await labApi.post("/", {
				itemName: form.itemName.trim(),
				quantity: Number(form.quantity),
				unit: form.unit.trim(),
				location: form.location.trim(),
				expiryDate: form.expiryDate
			});
			console.log('Lab item created successfully:', response.data);
			navigate("/lab/list");
		} catch (err) {
			console.error('Error creating lab item:', err);
			if (err.response?.status === 409) {
				setError("An item with this name already exists. Please choose a different name.");
			} else if (err.response?.data?.message) {
				setError(err.response.data.message);
			} else {
				setError("Failed to add lab item. Please try again.");
			}
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="lab-item-container">
			<div className="lab-item-card">
				<h2 className="lab-item-title">Add Lab Inventory Item</h2>
				{error && <div className="lab-item-error">{error}</div>}
				<form onSubmit={handleSubmit} className="lab-item-form" noValidate>
					<div className="lab-item-field">
						<label htmlFor="itemName">Item Name</label>
						<input
							id="itemName"
							name="itemName"
							value={form.itemName}
							onChange={handleChange}
							placeholder="e.g. Disposable Syringes"
							required
							disabled={submitting}
						/>
					</div>
					<div className="lab-item-field">
						<label htmlFor="quantity">Quantity</label>
						<input
							type="number"
							id="quantity"
							name="quantity"
							value={form.quantity}
							onChange={handleChange}
							placeholder="e.g. 150"
							min={10}
							required
							disabled={submitting}
						/>
					</div>
					<div className="lab-item-field">
						<label htmlFor="unit">Unit</label>
						<input
							id="unit"
							name="unit"
							value={form.unit}
							onChange={handleChange}
							placeholder="e.g. boxes, ml, packs"
							required
							disabled={submitting}
						/>
					</div>
					<div className="lab-item-field">
						<label htmlFor="location">Location</label>
						<input
							id="location"
							name="location"
							value={form.location}
							onChange={handleChange}
							placeholder="e.g. Storage Room A"
							required
							disabled={submitting}
						/>
					</div>
					<div className="lab-item-field">
						<label htmlFor="expiryDate">Expiry Date</label>
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
					<div className="lab-item-actions">
						<button 
							type="submit" 
							className="lab-item-btn lab-item-btn-primary"
							disabled={submitting}
						>
							{submitting ? "Adding Item..." : "Add Item"}
						</button>
						<button
							type="button"
							className="lab-item-btn lab-item-btn-secondary"
							onClick={() => navigate("/lab/list")}
							disabled={submitting}
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}