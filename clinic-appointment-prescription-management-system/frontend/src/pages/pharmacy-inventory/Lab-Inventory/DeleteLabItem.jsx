import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import labApi from "../../../api/labApi";
import "../../../styles/labInventory/DeleteLabItem.css";

export default function DeleteLabItem() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [item, setItem] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		let active = true;
		(async () => {
			try {
				console.log('Fetching lab item with ID:', id);
				const res = await labApi.get(`/${id}`);
				console.log('API response:', res);
				console.log('API response data:', res.data);
				if (!active) return;
				// The API returns {success, data: item}, so use res.data.data
				setItem(res.data.data);
				console.log('Set item to:', res.data.data);
			} catch (e) {
				console.error('Error fetching lab item:', e);
				setError(e?.response?.data?.message || "Failed to load item");
			} finally {
				if (active) setLoading(false);
			}
		})();
		return () => { active = false; };
	}, [id]);

	const handleDelete = async () => {
		if (!window.confirm("Delete this lab item permanently?")) return;
		try {
			setDeleting(true);
			await labApi.delete(`/${id}`);
			alert("✅ Lab inventory item deleted successfully!");
			setTimeout(() => {
				navigate("/lab/list", { replace: true });
			}, 100);
		} catch (e) {
			alert(e?.response?.data?.message || "❌ Delete failed");
			setDeleting(false);
		}
	};

	if (loading) {
		return (
			<div className="medicine-container">
				<div className="medicine-card">
					<div className="medicine-title">Delete Lab Item</div>
					<div style={{ padding: "2rem", textAlign: "center", color: "#64748b", fontSize: "1.1rem" }}>
						Loading...
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="medicine-container">
				<div className="medicine-card">
					<div className="medicine-title">Delete Lab Item</div>
					<div style={{ padding: "2rem", textAlign: "center", color: "#dc2626", fontSize: "1.1rem" }}>
						{error}
					</div>
				</div>
			</div>
		);
	}

	if (!item) return null;

	return (
		<div className="medicine-container">
			<div className="medicine-card">
				<h2 className="medicine-title">Delete Lab Item</h2>
				<p style={{ textAlign: "center", marginBottom: 16, padding: "0 2.5rem", color: "#64748b", fontSize: "1rem" }}>
					Are you sure you want to delete the following lab inventory item?
				</p>

				<div className="medicine-details">
					<div className="detail-row">
						<span className="detail-label">Name:</span>
						<span className="detail-value">{item.itemName}</span>
					</div>
					<div className="detail-row">
						<span className="detail-label">Quantity:</span>
						<span className="detail-value">{item.quantity} {item.unit}</span>
					</div>
					<div className="detail-row">
						<span className="detail-label">Location:</span>
						<span className="detail-value">{item.location || "-"}</span>
					</div>
					<div className="detail-row">
						<span className="detail-label">Expiry Date:</span>
						<span className="detail-value">
							{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "-"}
						</span>
					</div>
				</div>

				<div style={{ display: "flex", gap: 12, justifyContent: "center", padding: "0 2.5rem 2.5rem" }}>
					<button
						type="button"
						className="medicine-btn"
						style={{ background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)" }}
						onClick={handleDelete}
						disabled={deleting}
					>
						{deleting ? "Deleting..." : "Delete"}
					</button>
					<button
						type="button"
						className="medicine-btn"
						style={{ background: "linear-gradient(135deg, #64748b 0%, #94a3b8 100%)" }}
						onClick={() => navigate(-1)}
						disabled={deleting}
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
}

