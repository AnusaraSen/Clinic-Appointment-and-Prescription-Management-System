import React, { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react';
// Sample data for lab inventory
const initialLabItems = [{
  id: 1,
  name: 'Test Tubes',
  quantity: 500,
  category: 'Glassware',
  location: 'Storage A'
}, {
  id: 2,
  name: 'Microscope Slides',
  quantity: 200,
  category: 'Supplies',
  location: 'Cabinet B'
}, {
  id: 3,
  name: 'Petri Dishes',
  quantity: 150,
  category: 'Glassware',
  location: 'Storage A'
}, {
  id: 4,
  name: 'Pipettes',
  quantity: 100,
  category: 'Tools',
  location: 'Drawer C'
}, {
  id: 5,
  name: 'Centrifuge Tubes',
  quantity: 300,
  category: 'Supplies',
  location: 'Storage D'
}];
type LabItem = {
  id: number;
  name: string;
  quantity: number;
  category: string;
  location: string;
};
export function LabInventory() {
  const [labItems, setLabItems] = useState<LabItem[]>(initialLabItems);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<LabItem | null>(null);
  const [newItem, setNewItem] = useState<Omit<LabItem, 'id'>>({
    name: '',
    quantity: 0,
    category: '',
    location: ''
  });
  const handleAddItem = () => {
    const id = labItems.length > 0 ? Math.max(...labItems.map(item => item.id)) + 1 : 1;
    setLabItems([...labItems, {
      id,
      ...newItem
    }]);
    setNewItem({
      name: '',
      quantity: 0,
      category: '',
      location: ''
    });
    setIsAddModalOpen(false);
  };
  const handleEditItem = () => {
    if (currentItem) {
      setLabItems(labItems.map(item => item.id === currentItem.id ? currentItem : item));
      setIsEditModalOpen(false);
      setCurrentItem(null);
    }
  };
  const handleDeleteItem = (id: number) => {
    setLabItems(labItems.filter(item => item.id !== id));
  };
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Lab Inventory</h2>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
          <PlusIcon size={18} className="mr-1" />
          Add Item
        </button>
      </div>
      {/* Inventory Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {labItems.map(item => <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => {
                setCurrentItem(item);
                setIsEditModalOpen(true);
              }} className="text-indigo-600 hover:text-indigo-900 mr-3">
                    <PencilIcon size={18} />
                  </button>
                  <button onClick={() => handleDeleteItem(item.id)} className="text-red-600 hover:text-red-900">
                    <TrashIcon size={18} />
                  </button>
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>
      {/* Add Item Modal */}
      {isAddModalOpen && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Lab Item</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name
                </label>
                <input type="text" value={newItem.name} onChange={e => setNewItem({
              ...newItem,
              name: e.target.value
            })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input type="number" value={newItem.quantity} onChange={e => setNewItem({
              ...newItem,
              quantity: parseInt(e.target.value)
            })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input type="text" value={newItem.category} onChange={e => setNewItem({
              ...newItem,
              category: e.target.value
            })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input type="text" value={newItem.location} onChange={e => setNewItem({
              ...newItem,
              location: e.target.value
            })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleAddItem} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Add Item
              </button>
            </div>
          </div>
        </div>}
      {/* Edit Item Modal */}
      {isEditModalOpen && currentItem && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Lab Item</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name
                </label>
                <input type="text" value={currentItem.name} onChange={e => setCurrentItem({
              ...currentItem,
              name: e.target.value
            })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input type="number" value={currentItem.quantity} onChange={e => setCurrentItem({
              ...currentItem,
              quantity: parseInt(e.target.value)
            })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input type="text" value={currentItem.category} onChange={e => setCurrentItem({
              ...currentItem,
              category: e.target.value
            })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input type="text" value={currentItem.location} onChange={e => setCurrentItem({
              ...currentItem,
              location: e.target.value
            })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleEditItem} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          </div>
        </div>}
    </div>;
}