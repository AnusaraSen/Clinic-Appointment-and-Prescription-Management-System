import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import labApi from "../../../api/labApi";

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

	if (loading) return <p style={{ textAlign: "center", marginTop: 24 }}>Loading...</p>;
	if (error) return <p style={{ textAlign: "center", marginTop: 24 }}>{error}</p>;
	if (!item) return null;

	const boxStyle = {
		maxWidth: 560,
		margin: "40px auto",
		background: "#fff",
		padding: "32px 40px",
		borderRadius: 12,
		boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
		fontFamily: "system-ui, Arial, sans-serif"
	};
	const titleStyle = { margin: 0, fontSize: "1.6rem", fontWeight: 600, textAlign: "center", color: "#1e293b" };
	const btnBase = { border: "none", padding: "10px 20px", borderRadius: 6, fontSize: "0.95rem", cursor: "pointer", fontWeight: 600 };

	return (
		<div style={boxStyle}>
			<h1 style={titleStyle}>Delete Lab Item</h1>
			<p style={{ textAlign: "center", margin: "12px 0 20px", color: "#475569" }}>
				Are you sure you want to delete the following lab inventory item?
			</p>
			<div style={{ lineHeight: 1.7, marginBottom: 24, fontSize: ".95rem" }}>
				<strong>Name:</strong> {item.itemName}<br />
				<strong>Quantity:</strong> {item.quantity} {item.unit}<br />
				<strong>Location:</strong> {item.location || "-"}<br />
				<strong>Expiry Date:</strong> {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "-"}
			</div>
			<div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
				<button
					type="button"
					style={{ ...btnBase, background: "#dc2626", color: "#fff" }}
					onClick={handleDelete}
					disabled={deleting}
				>
					{deleting ? "Deleting..." : "Delete"}
				</button>
				<button
					type="button"
					style={{ ...btnBase, background: "#64748b", color: "#fff", fontWeight: 500 }}
					onClick={() => navigate(-1)}
					disabled={deleting}
				>
					Cancel
				</button>
			</div>
		</div>
	);
}

