import React, { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react';
// Sample data for medicine inventory
const initialMedicines = [{
  id: 1,
  name: 'Amoxicillin',
  quantity: 120,
  category: 'Antibiotics',
  expiry: '2024-08-15',
  supplier: 'PharmaCorp'
}, {
  id: 2,
  name: 'Ibuprofen',
  quantity: 200,
  category: 'Pain Relief',
  expiry: '2025-03-22',
  supplier: 'MediSource'
}, {
  id: 3,
  name: 'Lisinopril',
  quantity: 90,
  category: 'Blood Pressure',
  expiry: '2024-11-10',
  supplier: 'HealthDrug'
}, {
  id: 4,
  name: 'Metformin',
  quantity: 150,
  category: 'Diabetes',
  expiry: '2024-09-28',
  supplier: 'PharmaCorp'
}, {
  id: 5,
  name: 'Atorvastatin',
  quantity: 80,
  category: 'Cholesterol',
  expiry: '2025-01-15',
  supplier: 'MediSource'
}];
type Medicine = {
  id: number;
  name: string;
  quantity: number;
  category: string;
  expiry: string;
  supplier: string;
};
export function MedicineInventory() {
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentMedicine, setCurrentMedicine] = useState<Medicine | null>(null);
  const [newMedicine, setNewMedicine] = useState<Omit<Medicine, 'id'>>({
    name: '',
    quantity: 0,
    category: '',
    expiry: '',
    supplier: ''
  });
  const handleAddMedicine = () => {
    const id = medicines.length > 0 ? Math.max(...medicines.map(med => med.id)) + 1 : 1;
    setMedicines([...medicines, {
      id,
      ...newMedicine
    }]);
    setNewMedicine({
      name: '',
      quantity: 0,
      category: '',
      expiry: '',
      supplier: ''
    });
    setIsAddModalOpen(false);
  };
  const handleEditMedicine = () => {
    if (currentMedicine) {
      setMedicines(medicines.map(med => med.id === currentMedicine.id ? currentMedicine : med));
      setIsEditModalOpen(false);
      setCurrentMedicine(null);
    }
  };
  const handleDeleteMedicine = (id: number) => {
    setMedicines(medicines.filter(med => med.id !== id));
  };
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Medicine Inventory</h2>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
          <PlusIcon size={18} className="mr-1" />
          Add Medicine
        </button>
      </div>
      {/* Inventory Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expiry Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {medicines.map(medicine => <tr key={medicine.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {medicine.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {medicine.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {medicine.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {medicine.expiry}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {medicine.supplier}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => {
                setCurrentMedicine(medicine);
                setIsEditModalOpen(true);
              }} className="text-indigo-600 hover:text-indigo-900 mr-3">
                    <PencilIcon size={18} />
                  </button>
                  <button onClick={() => handleDeleteMedicine(medicine.id)} className="text-red-600 hover:text-red-900">
                    <TrashIcon size={18} />
                  </button>
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>
      {/* Add Medicine Modal */}
      {isAddModalOpen && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Medicine</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicine Name
                </label>
                <input type="text" value={newMedicine.name} onChange={e => setNewMedicine({
              ...newMedicine,
              name: e.target.value
            })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input type="number" value={newMedicine.quantity} onChange={e => setNewMedicine({
              ...newMedicine,
              quantity: parseInt(e.target.value)
            })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input type="text" value={newMedicine.category} onChange={e => setNewMedicine({
              ...newMedicine,
              category: e.target.value
            })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input type="date" value={newMedicine.expiry} onChange={e => setNewMedicine({
              ...newMedicine,
              expiry: e.target.value
            })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier
                </label>
                <input type="text" value={newMedicine.supplier} onChange={e => setNewMedicine({
              ...newMedicine,
              supplier: e.target.value
            })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleAddMedicine} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Add Medicine
              </button>
            </div>
          </div>
        </div>}
      {/* Edit Medicine Modal */}
      {isEditModalOpen && currentMedicine && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Medicine</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicine Name
                </label>
                <input type="text" value={currentMedicine.name} onChange={e => setCurrentMedicine({
              ...currentMedicine,
              name: e.target.value
            })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input type="number" value={currentMedicine.quantity} onChange={e => setCurrentMedicine({
              ...currentMedicine,
              quantity: parseInt(e.target.value)
            })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input type="text" value={currentMedicine.category} onChange={e => setCurrentMedicine({
              ...currentMedicine,
              category: e.target.value
            })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input type="date" value={currentMedicine.expiry} onChange={e => setCurrentMedicine({
              ...currentMedicine,
              expiry: e.target.value
            })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier
                </label>
                <input type="text" value={currentMedicine.supplier} onChange={e => setCurrentMedicine({
              ...currentMedicine,
              supplier: e.target.value
            })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleEditMedicine} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          </div>
        </div>}
    </div>;
}