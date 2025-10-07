import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import labApi from '../../../../api/labApi';
import '../../../../styles/labInventory/InsertLabItem.css';

export default function InsertLabItem(){
  const navigate = useNavigate();
  const [form, setForm] = useState({
    itemName: '',
    quantity: '',
    unit: '',
    location: '',
    expiryDate: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    if (!form.itemName.trim()) return 'Item name is required';
    if (form.quantity === '' || isNaN(Number(form.quantity))) return 'Quantity must be a number';
    if (!form.unit.trim()) return 'Unit is required';
    if (!form.location.trim()) return 'Location is required';
    if (!form.expiryDate) return 'Expiry date is required';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const v = validate();
    if (v) { setError(v); return; }
    try {
      setSubmitting(true);
      const payload = {
        itemName: form.itemName.trim(),
        quantity: Number(form.quantity),
        unit: form.unit.trim(),
        location: form.location.trim(),
        expiryDate: form.expiryDate
      };
      const res = await labApi.post('/', payload);
      alert('✅ Lab item added successfully!');
      navigate('/lab/list');
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to add item');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="medicine-container">
      <div className="medicine-card">
        <h2 className="medicine-title">Add Lab Item</h2>
        {error && (
          <div style={{ color: '#dc2626', textAlign: 'center', marginBottom: 12 }}>{error}</div>
        )}
        <form onSubmit={handleSubmit} className="medicine-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Item Name</label>
              <input name="itemName" value={form.itemName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input name="quantity" value={form.quantity} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Unit</label>
              <input name="unit" value={form.unit} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input name="location" value={form.location} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Expiry Date</label>
              <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} />
            </div>
          </div>

          <div className="medicine-actions">
            <button type="submit" className="medicine-btn" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </button>
            <button type="button" className="medicine-btn" style={{ background: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)' }} onClick={() => navigate(-1)} disabled={submitting}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
