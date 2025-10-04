import React, { useState, useEffect } from 'react';

// Minimal CreateWorkRequestModal to satisfy existing usage in MaintenanceManagementPage
// Expected props: isOpen, onClose, onSubmit, equipment, technicians
export const CreateWorkRequestModal = ({ isOpen, onClose, onSubmit, equipment = [], technicians = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    equipmentId: equipment && equipment.length ? equipment[0].id : null,
    technicianId: technicians && technicians.length ? technicians[0].id : null,
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        description: '',
        equipmentId: equipment && equipment.length ? equipment[0].id : null,
        technicianId: technicians && technicians.length ? technicians[0].id : null,
      });
    }
  }, [isOpen, equipment, technicians]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Create Work Request</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-sm font-medium">Title</label>
            <input name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium">Equipment</label>
            <select name="equipmentId" value={formData.equipmentId || ''} onChange={handleChange} className="mt-1 block w-full border rounded p-2">
              <option value="">-- Select equipment --</option>
              {(equipment || []).map((eq) => (
                <option key={eq.id} value={eq.id}>{eq.name || eq.label || `Equipment ${eq.id}`}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium">Assign Technician</label>
            <select name="technicianId" value={formData.technicianId || ''} onChange={handleChange} className="mt-1 block w-full border rounded p-2">
              <option value="">-- Select technician --</option>
              {(technicians || []).map((t) => (
                <option key={t.id} value={t.id}>{t.name || t.fullName || `Tech ${t.id}`}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};
