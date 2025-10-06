import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import orderApi from '../../../../api/orderApi';
import '../../../../styles/OrderManagement.css';

const UpdateOrder = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [order, setOrder] = useState({ orderNumber: '', supplier: '', supplierEmail: '', itemsText: '', date: '', status: 'Pending' });
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		const load = async () => {
			try {
				const res = await orderApi.get(id);
				const o = res.data.data;
				setOrder({
					orderNumber: o.orderNumber || '',
					supplier: o.supplier || '',
					supplierEmail: o.supplierEmail || '',
					itemsText: (o.items || []).map(i => i.name).join(', '),
					date: o.date ? new Date(o.date).toLocaleDateString('en-GB') : '',
					status: o.status || 'Pending',
				});
			} catch (e) {
				setError(e.message || 'Failed to load order');
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [id]);

	const submit = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError('');
		try {
			const payload = {
				orderNumber: order.orderNumber,
				supplier: order.supplier,
				supplierEmail: order.supplierEmail,
				items: order.itemsText
					.split(',')
					.map((s) => s.trim())
					.filter(Boolean)
					.map((n) => ({ name: n, category: 'Medicine', quantity: 1 })),
				status: order.status,
			};
			await orderApi.update(id, payload);
			navigate('/orders');
		} catch (e1) {
			setError(e1.message || 'Failed to save order');
		} finally {
			setSaving(false);
		}
	};

		return (
			<div className="order-form-page">
					<h2>Edit Order</h2>
					{loading ? (
						<div>Loading...</div>
					) : (
						<form className="order-form" onSubmit={submit}>
							<label>Order Number
								<input type="text" value={order.orderNumber} onChange={(e) => setOrder({ ...order, orderNumber: e.target.value })} />
							</label>
							<label>Supplier
								<input type="text" value={order.supplier} onChange={(e) => setOrder({ ...order, supplier: e.target.value })} />
							</label>
							<label>Supplier Email
								<input type="email" value={order.supplierEmail} onChange={(e) => setOrder({ ...order, supplierEmail: e.target.value })} />
							</label>
							<label>Items (comma separated)
								<textarea rows={4} value={order.itemsText} onChange={(e) => setOrder({ ...order, itemsText: e.target.value })} />
							</label>
							<label>Date
								<input type="text" value={order.date} readOnly />
							</label>
							<label>Status
								<select value={order.status} onChange={(e) => setOrder({ ...order, status: e.target.value })}>
									<option>Pending</option>
									<option>Processing</option>
									<option>Delivered</option>
									<option>Cancelled</option>
								</select>
							</label>
							{error && <div className="orders-error" style={{ marginTop: 10 }}>{error}</div>}
							<div className="order-form-actions">
								<button type="button" className="btn" onClick={() => navigate('/orders')}>Cancel</button>
								<button type="submit" className="btn-primary" disabled={saving}>Save Changes</button>
							</div>
						</form>
								)}
					</div>
	);
};

export default UpdateOrder;

