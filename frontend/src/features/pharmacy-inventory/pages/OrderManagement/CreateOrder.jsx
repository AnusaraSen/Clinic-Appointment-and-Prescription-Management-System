import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import orderApi from '../../../../api/orderApi';
import '../../../../styles/OrderManagement.css';

const todayStr = () => new Date().toLocaleDateString('en-GB');
const generateOrderNumber = () => {
	const d = new Date();
	const y = String(d.getFullYear()).slice(2);
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	const rnd = Math.random().toString(36).slice(2, 5).toUpperCase();
	return `ORD-${y}${m}${day}-${rnd}`;
};

const CreateOrder = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const prefillItems = useMemo(() => (location.state?.prefillItems || []), [location.state]);

	const [order, setOrder] = useState({
		orderNumber: generateOrderNumber(),
		supplier: '',
		supplierEmail: '',
		itemsText: '',
		date: todayStr(),
		status: 'Pending',
		category: '',
		quantity: '',
	});
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');
		const suppliers = useMemo(() => ([
			{ name: 'MediSupply Co.', email: 'orders@medisupply.example' },
			{ name: 'HealthMart', email: 'sales@healthmart.example' },
			{ name: 'PharmaDirect', email: 'sales@pharmadirect.example' },
			{ name: 'ChemLab Traders', email: 'orders@chemlab.example' },
			{ name: 'Global Medics', email: 'orders@globalmedics.example' },
		]), []);

	useEffect(() => {
		if (prefillItems.length) {
			const names = prefillItems.map((it) => it.name).join(', ');
			setOrder((o) => ({ ...o, itemsText: names }));
		}
	}, [prefillItems]);

		// Map UI categories to backend enum values (OrderItem.category: 'Medicine' | 'Lab')
		const mapCategoryForBackend = (c) => {
			const s = String(c || '').toLowerCase();
			return s.includes('medicine') ? 'Medicine' : 'Lab';
		};

		const submit = async (e) => {
		e.preventDefault();
		setError('');
		setSubmitting(true);
		try {
			// Build items: preserve UI category when navigating from modal, then map to backend enum
			const uiItems = (prefillItems && prefillItems.length > 0)
				? prefillItems.map((it) => ({ name: it.name, uiCategory: it.category || 'Medicines', quantity: 1 }))
				: order.itemsText
					.split(',')
					.map((s) => s.trim())
					.filter(Boolean)
					.map((n) => ({ name: n, uiCategory: 'Medicines', quantity: 1 }));

			// Client-side validation: supplier and at least one item
			if (!order.supplier) {
				throw new Error('Supplier is required');
			}
			if (!uiItems.length) {
				throw new Error('Please add at least one item');
			}

			const items = uiItems.map((it) => ({
				name: it.name,
				category: mapCategoryForBackend(it.uiCategory),
				quantity: it.quantity,
			}));

			const payload = {
					orderNumber: order.orderNumber || generateOrderNumber(),
					supplier: order.supplier,
					supplierEmail: order.supplierEmail,
				items,
				date: new Date(),
				status: order.status,
			};
			const res = await orderApi.create(payload);
			if (res.data?.success) {
				// Persist ordered items using UI categories so modal filtering stays consistent
				try {
					const raw = localStorage.getItem('orderedItems');
					const prev = raw ? JSON.parse(raw) : [];
					const mergedKeys = new Set([
						...prev.map((it) => `${it.name}|${it.category || ''}`),
						...uiItems.map((it) => `${it.name}|${it.uiCategory || ''}`),
					]);
					const toStore = Array.from(mergedKeys).map((key) => {
						const [name, category] = key.split('|');
						return { name, category };
					});
					localStorage.setItem('orderedItems', JSON.stringify(toStore));
				} catch {}
				navigate('/orders');
			} else {
				throw new Error('Failed to create order');
			}
		} catch (e1) {
			const msg = e1?.response?.data?.message || e1.message || 'Failed to create order';
			setError(msg);
		} finally {
			setSubmitting(false);
		}
	};

		return (
			<div className="order-form-page">
					<div className="order-form-header">
						<h2>Create New Order</h2>
						<p className="order-form-subtitle">Fill in supplier details and confirm the items you want to order.</p>
					</div>
					<form className="order-form" onSubmit={submit}>
						<div className="order-form-grid">
							<div className="form-field">
								<label htmlFor="orderNumber">Order Number</label>
								<input
									id="orderNumber"
									type="text"
									value={order.orderNumber}
									onChange={(e) => setOrder({ ...order, orderNumber: e.target.value })}
									placeholder="ORD-YYMMDD-XXX"
								/>
							</div>
							<div className="form-field">
								<label htmlFor="orderDate">Date</label>
								<input id="orderDate" type="text" value={order.date} readOnly />
							</div>

							<div className="form-field">
								<label htmlFor="supplier">Supplier</label>
								<select
									id="supplier"
									value={order.supplier}
									onChange={(e) => {
									  const name = e.target.value;
									  const sup = suppliers.find(s => s.name === name);
									  setOrder({ ...order, supplier: name, supplierEmail: sup?.email || '' });
									}}
								>
									<option value="">Select supplier</option>
									{suppliers.map(s => (
									  <option key={s.name} value={s.name}>{s.name}</option>
									))}
								</select>
							</div>
							<div className="form-field">
								<label htmlFor="supplierEmail">Supplier Email</label>
								<input
									id="supplierEmail"
									type="email"
									value={order.supplierEmail}
									onChange={(e) => setOrder({ ...order, supplierEmail: e.target.value })}
									placeholder="Auto-filled from supplier"
								/>
							</div>

							<div className="form-field">
								<label htmlFor="status">Status</label>
								<select id="status" value={order.status} onChange={(e) => setOrder({ ...order, status: e.target.value })}>
									<option>Pending</option>
									<option>Processing</option>
									<option>Delivered</option>
									<option>Cancelled</option>
								</select>
							</div>

							<div className="form-field">
								<label htmlFor="category">Category</label>
								<select 
									id="category" 
									value={order.category} 
									onChange={(e) => setOrder({ ...order, category: e.target.value })}
								>
									<option value="">Select category</option>
									<option value="Medicine">Medicine</option>
									<option value="Chemical">Chemical</option>
									<option value="Equipment">Equipment</option>
								</select>
							</div>

							{order.category && (
								<div className="form-field">
									<label htmlFor="quantity">Quantity</label>
									<input
										id="quantity"
										type="number"
										min="1"
										value={order.quantity}
										onChange={(e) => setOrder({ ...order, quantity: e.target.value })}
										placeholder="Enter quantity"
									/>
								</div>
							)}

							<div className="form-field col-span-2">
								<label htmlFor="itemsText">Items (comma separated)</label>
								<textarea
									id="itemsText"
									value={order.itemsText}
									onChange={(e) => setOrder({ ...order, itemsText: e.target.value })}
									rows={4}
								/>
								<div className="field-help">Example: Amoxicillin 500mg, Centrifuge Rotor, Ethanol AR</div>
							</div>
						</div>

						{error && <div className="orders-error" style={{ marginTop: 10 }}>{error}</div>}
						<div className="order-form-actions">
							<button type="button" className="btn" onClick={() => navigate('/orders')}>Cancel</button>
							<button type="submit" className="btn-primary" disabled={submitting}>
								✉️ Create & Send Order
							</button>
						</div>
					</form>
				</div>
		);
};

export default CreateOrder;

