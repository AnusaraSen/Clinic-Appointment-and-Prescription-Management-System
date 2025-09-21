import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import labApi from "../../../api/labApi";
import "../../../styles/Medicine/UpdateMedicine.css";

export default function UpdateLabItem() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [form, setForm] = useState({
		itemName: "",
		quantity: "",
		unit: "",
		location: "",
		expiryDate: ""
	});
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		let active = true;
		(async () => {
			try {
				console.log('Loading lab item with ID:', id);
				const res = await labApi.get(`/${id}`);
				console.log('API response:', res.data);
				if (!active) return;
				const item = res.data.data;
				console.log('Setting form data:', item);
				setForm({
					itemName: item.itemName || "",
					quantity: item.quantity?.toString() || "",
					unit: item.unit || "",
					location: item.location || "",
					expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : ""
				});
			} catch (e) {
				console.error('Error loading lab item:', e);
				if (active) setError(e?.response?.data?.message || "Failed to load item");
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
			console.log('Updating lab item:', {
				itemName: form.itemName.trim(),
				quantity: Number(form.quantity),
				unit: form.unit.trim(),
				location: form.location.trim(),
				expiryDate: form.expiryDate
			});
			const response = await labApi.put(`/${id}`, {
				itemName: form.itemName.trim(),
				quantity: Number(form.quantity),
				unit: form.unit.trim(),
				location: form.location.trim(),
				expiryDate: form.expiryDate
			});
			console.log('Lab item updated successfully:', response.data);
			
			alert("✅ Lab inventory item updated successfully!");
			setTimeout(() => {
				navigate("/lab/list", { replace: true });
			}, 100);
		} catch (err) {
			console.error('Lab item update error:', err);
			console.error('Error response:', err.response?.data);
			const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || "Failed to update item";
			setError(msg);
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="medicine-container">
				<div className="medicine-loading">
					Loading lab item details...
				</div>
			</div>
		);
	}

	return (
		<div className="medicine-container">
			<div className="medicine-card">
				<h2 className="medicine-title">Update Lab Item</h2>

				{error && (
					<div className="medicine-error">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="medicine-form" noValidate>
					<div className="medicine-field">
						<label htmlFor="itemName">Item Name</label>
						<input
							id="itemName"
							type="text"
							name="itemName"
							value={form.itemName}
							onChange={handleChange}
							placeholder="Enter item name"
							required
							disabled={submitting}
						/>
					</div>

					<div className="medicine-field">
						<label htmlFor="quantity">Quantity</label>
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
						<label htmlFor="unit">Unit</label>
						<input
							id="unit"
							type="text"
							name="unit"
							value={form.unit}
							onChange={handleChange}
							placeholder="Enter unit (e.g., boxes, ml, packs)"
							required
							disabled={submitting}
						/>
					</div>

					<div className="medicine-field">
						<label htmlFor="location">Location</label>
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
						<label htmlFor="expiryDate">Expiry Date</label>
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

					<div className="medicine-actions">
						<button 
							type="submit" 
							className="medicine-btn medicine-btn-primary"
							disabled={submitting}
						>
							{submitting ? "Updating..." : "UPDATE LAB ITEM"}
						</button>
						<button
							type="button"
							className="medicine-btn medicine-btn-secondary"
							onClick={() => navigate("/lab/list")}
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

