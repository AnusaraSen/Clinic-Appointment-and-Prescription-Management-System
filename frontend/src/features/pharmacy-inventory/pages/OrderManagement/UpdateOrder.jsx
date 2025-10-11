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
		<div style={{
			minHeight: '100vh',
			backgroundColor: '#f3f4f6',
			padding: '2rem'
		}}>
			<div style={{
				maxWidth: '800px',
				margin: '0 auto',
				backgroundColor: 'white',
				borderRadius: '12px',
				boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
				padding: '2rem'
			}}>
				<h2 style={{
					fontSize: '1.875rem',
					fontWeight: '700',
					color: '#1f2937',
					marginBottom: '2rem'
				}}>Edit Order</h2>
				
				{loading ? (
					<div style={{
						textAlign: 'center',
						padding: '2rem',
						color: '#6b7280'
					}}>Loading...</div>
				) : (
					<form onSubmit={submit}>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
							{/* Order Number */}
							<div>
								<label style={{
									display: 'block',
									fontSize: '0.875rem',
									fontWeight: '600',
									color: '#047857',
									marginBottom: '0.5rem'
								}}>Order Number</label>
								<input
									type="text"
									value={order.orderNumber}
									onChange={(e) => setOrder({ ...order, orderNumber: e.target.value })}
									style={{
										width: '100%',
										padding: '0.75rem',
										border: '1px solid #d1d5db',
										borderRadius: '8px',
										fontSize: '1rem',
										outline: 'none',
										transition: 'all 0.2s',
										backgroundColor: '#f9fafb'
									}}
									onFocus={(e) => e.target.style.borderColor = '#047857'}
									onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
								/>
							</div>

							{/* Date */}
							<div>
								<label style={{
									display: 'block',
									fontSize: '0.875rem',
									fontWeight: '600',
									color: '#047857',
									marginBottom: '0.5rem'
								}}>Date</label>
								<input
									type="text"
									value={order.date}
									readOnly
									style={{
										width: '100%',
										padding: '0.75rem',
										border: '1px solid #d1d5db',
										borderRadius: '8px',
										fontSize: '1rem',
										backgroundColor: '#f9fafb',
										color: '#6b7280',
										cursor: 'not-allowed'
									}}
								/>
							</div>

							{/* Supplier */}
							<div>
								<label style={{
									display: 'block',
									fontSize: '0.875rem',
									fontWeight: '600',
									color: '#047857',
									marginBottom: '0.5rem'
								}}>Supplier</label>
								<select
									value={order.supplier}
									onChange={(e) => setOrder({ ...order, supplier: e.target.value })}
									style={{
										width: '100%',
										padding: '0.75rem',
										border: '1px solid #d1d5db',
										borderRadius: '8px',
										fontSize: '1rem',
										outline: 'none',
										backgroundColor: 'white',
										cursor: 'pointer'
									}}
									onFocus={(e) => e.target.style.borderColor = '#047857'}
									onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
								>
									<option value="">Select supplier</option>
									<option value="Supplier A">Supplier A</option>
									<option value="Supplier B">Supplier B</option>
									<option value="Supplier C">Supplier C</option>
								</select>
							</div>

							{/* Supplier Email */}
							<div>
								<label style={{
									display: 'block',
									fontSize: '0.875rem',
									fontWeight: '600',
									color: '#047857',
									marginBottom: '0.5rem'
								}}>Supplier Email</label>
								<input
									type="email"
									value={order.supplierEmail}
									placeholder="Auto-filled from supplier"
									readOnly
									style={{
										width: '100%',
										padding: '0.75rem',
										border: '1px solid #d1d5db',
										borderRadius: '8px',
										fontSize: '1rem',
										backgroundColor: '#f9fafb',
										color: '#9ca3af'
									}}
								/>
							</div>

							{/* Status */}
							<div>
								<label style={{
									display: 'block',
									fontSize: '0.875rem',
									fontWeight: '600',
									color: '#047857',
									marginBottom: '0.5rem'
								}}>Status</label>
								<select
									value={order.status}
									onChange={(e) => setOrder({ ...order, status: e.target.value })}
									style={{
										width: '100%',
										padding: '0.75rem',
										border: '1px solid #d1d5db',
										borderRadius: '8px',
										fontSize: '1rem',
										outline: 'none',
										backgroundColor: 'white',
										cursor: 'pointer'
									}}
									onFocus={(e) => e.target.style.borderColor = '#047857'}
									onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
								>
									<option value="Pending">Pending</option>
									<option value="Processing">Processing</option>
									<option value="Delivered">Delivered</option>
									<option value="Cancelled">Cancelled</option>
								</select>
							</div>

							{/* Items */}
							<div>
								<label style={{
									display: 'block',
									fontSize: '0.875rem',
									fontWeight: '600',
									color: '#047857',
									marginBottom: '0.5rem'
								}}>Items (comma separated)</label>
								<textarea
									rows={4}
									value={order.itemsText}
									onChange={(e) => setOrder({ ...order, itemsText: e.target.value })}
									style={{
										width: '100%',
										padding: '0.75rem',
										border: '1px solid #d1d5db',
										borderRadius: '8px',
										fontSize: '1rem',
										outline: 'none',
										resize: 'vertical',
										fontFamily: 'inherit'
									}}
									onFocus={(e) => e.target.style.borderColor = '#047857'}
									onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
								/>
							</div>

							{/* Error Message */}
							{error && (
								<div style={{
									padding: '0.75rem',
									backgroundColor: '#fee2e2',
									color: '#991b1b',
									borderRadius: '8px',
									fontSize: '0.875rem',
									border: '1px solid #fca5a5'
								}}>
									{error}
								</div>
							)}

							{/* Action Buttons */}
							<div style={{
								display: 'flex',
								gap: '1rem',
								marginTop: '1rem'
							}}>
								<button
									type="button"
									onClick={() => navigate('/orders')}
									style={{
										flex: 1,
										padding: '0.75rem',
										backgroundColor: '#f3f4f6',
										color: '#374151',
										border: 'none',
										borderRadius: '8px',
										fontSize: '1rem',
										fontWeight: '600',
										cursor: 'pointer',
										transition: 'all 0.2s'
									}}
									onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
									onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={saving}
									style={{
										flex: 1,
										padding: '0.75rem',
										backgroundColor: saving ? '#9ca3af' : '#047857',
										color: 'white',
										border: 'none',
										borderRadius: '8px',
										fontSize: '1rem',
										fontWeight: '600',
										cursor: saving ? 'not-allowed' : 'pointer',
										transition: 'all 0.2s'
									}}
									onMouseEnter={(e) => !saving && (e.target.style.backgroundColor = '#065f46')}
									onMouseLeave={(e) => !saving && (e.target.style.backgroundColor = '#047857')}
								>
									{saving ? 'Saving...' : 'Save Changes'}
								</button>
							</div>
						</div>
					</form>
				)}
			</div>
		</div>
	);
};

export default UpdateOrder;

