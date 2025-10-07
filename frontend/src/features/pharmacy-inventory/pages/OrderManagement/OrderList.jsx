import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import orderApi from '../../../../api/orderApi';
import '../../../../styles/OrderManagement.css';

const StatusBadge = ({ status }) => {
	const map = {
		Pending: { bg: '#fef3c7', color: '#92400e' },
		Processing: { bg: '#dbeafe', color: '#1e40af' },
		Delivered: { bg: '#dcfce7', color: '#166534' },
		Cancelled: { bg: '#fee2e2', color: '#991b1b' },
	};
	const s = map[status] || map.Pending;
	return (
		<span style={{ background: s.bg, color: s.color, padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
			{status}
		</span>
	);
};

const OrderList = () => {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [lowStockOpen, setLowStockOpen] = useState(false);
	const [lowStockItems, setLowStockItems] = useState([]);
	const navigate = useNavigate();

	// Normalize category names to consistent buckets used in UI
	const normalizeCategory = (raw) => {
		const s = String(raw || '').toLowerCase().trim();
		if (['medicine', 'medicines', 'drug', 'drugs'].includes(s)) return 'Medicines';
		if (['equipment', 'equipments', 'lab equipment', 'laboratory equipment'].includes(s)) return 'Equipment';
		if (['chemical', 'chemicals', 'reagent', 'reagents'].includes(s)) return 'Chemicals';
		return 'Others';
	};

	// Build a Set of ordered item keys (name|category) from localStorage to filter modal items
	const orderedItemSet = useMemo(() => {
		try {
			const raw = localStorage.getItem('orderedItems');
			const arr = raw ? JSON.parse(raw) : [];
			return new Set(arr.map((it) => `${it.name}|${normalizeCategory(it.category)}`));
		} catch {
			return new Set();
		}
	}, [lowStockOpen]);

	const load = async () => {
		try {
			setLoading(true);
			const res = await orderApi.list();
			setOrders(res.data.data || []);
		} catch (e) {
			setError(e.message || 'Failed to load orders');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { load(); }, []);

	const openLowStock = async () => {
		const res = await orderApi.lowStock();
		const all = (res.data.data || []).map((it) => ({ ...it, category: normalizeCategory(it.category) }));
		// Filter out items that have already been ordered from this modal (persisted in localStorage)
		const filtered = all.filter((it) => !orderedItemSet.has(`${it.name}|${it.category}`));
		setLowStockItems(filtered);
		setLowStockOpen(true);
	};

	const handleDelete = async (id) => {
		if (!window.confirm('Delete this order?')) return;
		await orderApi.delete(id);
		setOrders((prev) => prev.filter((o) => o._id !== id));
	};

		return (
			<div className="orders-page">
					<div className="orders-header">
						<h2>Order Management</h2>
						<div className="orders-actions">
											<button className="btn-warning" onClick={openLowStock}>
												⚠️ Order Low/Expired Items
											</button>
							<button className="btn-primary" onClick={() => navigate('/orders/new')}>
								+ New Order
							</button>
						</div>
					</div>

					{error && <div className="orders-error">{error}</div>}

					<div className="orders-table-wrapper">
						<table className="orders-table">
							<thead>
								<tr>
									<th>Order #</th>
									<th>Supplier</th>
									<th>Items</th>
									<th>Date</th>
									<th>Status</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{loading ? (
									<tr><td colSpan="6" style={{ padding: 20 }}>Loading...</td></tr>
								) : orders.length === 0 ? (
									<tr><td colSpan="6" style={{ padding: 20 }}>No orders yet</td></tr>
								) : (
									orders.map((o) => (
										<tr key={o._id}>
											<td>{o.orderNumber}</td>
											<td>
												<div style={{ display: 'flex', flexDirection: 'column' }}>
													<span style={{ fontWeight: 600 }}>{o.supplier}</span>
													{o.supplierEmail && (
														<span style={{ fontSize: 12, color: '#6b7280' }}>{o.supplierEmail}</span>
													)}
												</div>
											</td>
											<td>{(o.items || []).map(i => i.name).join(', ')}</td>
											<td>{o.date ? new Date(o.date).toISOString().slice(0,10) : ''}</td>
											<td><StatusBadge status={o.status} /></td>
											<td>
												<div className="orders-row-actions">
													{o.status === 'Delivered' && <span title="Delivered">✔️</span>}
													<Link to={`/orders/edit/${o._id}`} title="Edit">✏️</Link>
													<button className="icon-btn danger" title="Delete" onClick={() => handleDelete(o._id)}>🗑️</button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					{lowStockOpen && (
						<div className="modal-backdrop" onClick={() => setLowStockOpen(false)}>
							<div className="modal" onClick={(e) => e.stopPropagation()}>
								<div className="modal-header">
									  <h3>Low Stock / Expired Items</h3>
									<button className="icon-btn" onClick={() => setLowStockOpen(false)}>✖</button>
								</div>
								<div className="modal-body">
									{(() => {
										if (!lowStockItems.length) {
											return <div style={{ padding: 12, color: '#16a34a', fontWeight: 600 }}>All set! No items need ordering.</div>;
										}
										// Group items by category
										const groups = lowStockItems.reduce((acc, it) => {
											const cat = normalizeCategory(it.category);
											acc[cat] = acc[cat] || [];
											acc[cat].push(it);
											return acc;
										}, {});

										const orderedCatNames = ['Medicines', 'Equipment', 'Chemicals'];
										const catNames = [
											...orderedCatNames.filter((cat) => groups[cat]?.length),
											...Object.keys(groups).filter((k) => !orderedCatNames.includes(k)),
										];

										return (
											<div className="low-stock-groups">
												{catNames.map((cat) => (
													<div key={cat} style={{ marginBottom: 18 }}>
														<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
															<h4 style={{ margin: 0 }}>{cat}</h4>
															<button
																className="btn-primary btn-sm"
																disabled={!groups[cat] || groups[cat].length === 0}
																onClick={() => navigate('/orders/new', { state: { prefillItems: groups[cat].map((it) => ({ ...it, category: normalizeCategory(it.category) })) } })}
															>
																🛒 Order All {cat}
															</button>
														</div>
														<table className="low-stock-table">
															<thead>
																<tr>
																	<th>Item Name</th>
																	<th>Category</th>
																	<th>Quantity</th>
																	<th>Threshold</th>
																	<th>Reason</th>
																	<th>Action</th>
																</tr>
															</thead>
															<tbody>
																{(groups[cat] || []).map((it, idx) => (
																	<tr key={`${cat}-${idx}`}>
																		<td style={{ fontWeight: 600 }}>{it.name}</td>
																		<td>{it.category}</td>
																		<td style={{ color: '#dc2626', fontWeight: 700 }}>{it.quantity}</td>
																		<td>{it.threshold}</td>
																		<td>{it.reason || (it.quantity < it.threshold ? 'Low Stock' : '')}</td>
																		<td>
																			<button className="btn-primary btn-sm" onClick={() => navigate('/orders/new', { state: { prefillItems: [{ ...it, category: normalizeCategory(it.category) }] } })}>
																				🛒 Order
																			</button>
																		</td>
																	</tr>
																))}
															</tbody>
														</table>
													</div>
												))}
											</div>
										);
									})()}
								</div>
								<div className="modal-footer">
									<button className="btn" onClick={() => setLowStockOpen(false)}>Close</button>
								</div>
							</div>
						</div>
					)}
				</div>
	);
};

export default OrderList;

