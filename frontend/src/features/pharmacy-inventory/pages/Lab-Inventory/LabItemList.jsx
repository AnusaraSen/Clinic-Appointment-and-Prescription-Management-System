import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import labApi from '../../../../api/labApi';
import '../../../../styles/labInventory/LabItemList.css';

const LabItemList = () => {
	const navigate = useNavigate();
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		let active = true;
		(async () => {
			try {
				const res = await labApi.get('/');
				if (!active) return;
				setItems(res.data?.data || []);
			} catch (e) {
				if (!active) return;
				setError(e?.response?.data?.message || 'Failed to load lab items');
			} finally {
				if (active) setLoading(false);
			}
		})();
		return () => { active = false; };
	}, []);

	if (loading) {
		return (
			<div className="lab-list-container">
				<div className="lab-list-card">
					<div className="lab-list-header">
						<h2>Lab Inventory</h2>
						<button className="lab-add-btn" disabled>
							Loading...
						</button>
					</div>
					<div className="lab-list-empty">Loading items...</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="lab-list-container">
				<div className="lab-list-card">
					<div className="lab-list-header">
						<h2>Lab Inventory</h2>
						<button className="lab-add-btn" onClick={() => navigate('/lab/add')}>+ Add Item</button>
					</div>
					<div className="lab-list-empty" style={{ color: '#dc2626' }}>{error}</div>
				</div>
			</div>
		);
	}

	return (
		<div className="lab-list-container">
			<div className="lab-list-card">
				<div className="lab-list-header">
					<h2>Lab Inventory</h2>
					<button className="lab-add-btn" onClick={() => navigate('/lab/add')}>+ Add Item</button>
				</div>
				{items.length === 0 ? (
					<div className="lab-list-empty">No lab items found</div>
				) : (
					<table className="lab-table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Quantity</th>
								<th>Location</th>
								<th>Expiry</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{items.map(item => (
								<tr key={item._id}>
									<td>{item.itemName}</td>
									<td>{item.quantity} {item.unit}</td>
									<td>{item.location || '-'}</td>
									<td>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '-'}</td>
									<td>
										<div className="lab-actions">
											<button className="lab-action" onClick={() => navigate(`/lab/edit/${item._id}`)}>Edit</button>
											<button className="lab-action danger" onClick={() => navigate(`/lab/delete/${item._id}`)}>Delete</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
};

export default LabItemList;
