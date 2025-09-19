import React, { useState } from 'react';
import { SearchIcon, CheckCircleIcon, AlertTriangleIcon, ClipboardListIcon, MailIcon, ArrowRightIcon, PackageIcon } from 'lucide-react';
// Sample data for medicines in inventory
const initialMedicineInventory = [{
  id: 1,
  name: 'Amoxicillin 500mg',
  quantity: 120,
  category: 'Antibiotics',
  expiryDate: '2024-05-15',
  threshold: 50
}, {
  id: 2,
  name: 'Ibuprofen 400mg',
  quantity: 200,
  category: 'Pain Relief',
  expiryDate: '2024-08-22',
  threshold: 75
}, {
  id: 3,
  name: 'Lisinopril 10mg',
  quantity: 25,
  category: 'Blood Pressure',
  expiryDate: '2024-03-10',
  threshold: 50
}, {
  id: 4,
  name: 'Metformin 850mg',
  quantity: 40,
  category: 'Diabetes',
  expiryDate: '2024-06-28',
  threshold: 75
}, {
  id: 5,
  name: 'Atorvastatin 20mg',
  quantity: 80,
  category: 'Cholesterol',
  expiryDate: '2024-09-15',
  threshold: 40
}, {
  id: 6,
  name: 'Omeprazole 20mg',
  quantity: 110,
  category: 'Gastric',
  expiryDate: '2024-07-20',
  threshold: 50
}, {
  id: 7,
  name: 'Loratadine 10mg',
  quantity: 30,
  category: 'Allergy',
  expiryDate: '2023-11-30',
  threshold: 40
}, {
  id: 8,
  name: 'Acetaminophen 500mg',
  quantity: 250,
  category: 'Pain Relief',
  expiryDate: '2024-04-15',
  threshold: 100
}];
// Sample data for patients
const patients = [{
  id: 'P-001',
  name: 'John Smith'
}, {
  id: 'P-002',
  name: 'Sarah Johnson'
}, {
  id: 'P-003',
  name: 'Michael Brown'
}, {
  id: 'P-004',
  name: 'Lisa Davis'
}, {
  id: 'P-005',
  name: 'David Wilson'
}];
// Sample data for prescriptions
const initialPrescriptions = [{
  id: 1,
  patientId: 'P-001',
  patientName: 'John Smith',
  prescribedBy: 'Dr. Robert Chen',
  date: '2023-05-10',
  status: 'New',
  medications: [{
    name: 'Amoxicillin 500mg',
    dosage: '500mg',
    frequency: '3 times daily',
    duration: '7 days',
    quantity: 21
  }, {
    name: 'Ibuprofen 400mg',
    dosage: '400mg',
    frequency: 'As needed',
    duration: '5 days',
    quantity: 10
  }]
}, {
  id: 2,
  patientId: 'P-002',
  patientName: 'Sarah Johnson',
  prescribedBy: 'Dr. Emily Wilson',
  date: '2023-05-09',
  status: 'New',
  medications: [{
    name: 'Lisinopril 10mg',
    dosage: '10mg',
    frequency: 'Once daily',
    duration: '30 days',
    quantity: 30
  }]
}];
type Medicine = {
  id: number;
  name: string;
  quantity: number;
  category: string;
  expiryDate: string;
  threshold: number;
};
type Patient = {
  id: string;
  name: string;
};
type DispensedItem = {
  medicineId: number;
  medicineName: string;
  quantity: number;
};
type Prescription = {
  id: number;
  patientId: string;
  patientName: string;
  prescribedBy: string;
  date: string;
  status: 'New' | 'Dispensed';
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
  }[];
};
export function DispensingModule() {
  const [medicineInventory, setMedicineInventory] = useState<Medicine[]>(initialMedicineInventory);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialPrescriptions);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [dispensedItems, setDispensedItems] = useState<DispensedItem[]>([]);
  const [dispensingSuccess, setDispensingSuccess] = useState(false);
  const [lowStockAlert, setLowStockAlert] = useState<string | null>(null);
  const [dispensingHistory, setDispensingHistory] = useState<{
    patient: Patient;
    items: DispensedItem[];
    date: string;
  }[]>([]);
  // Filter medicines based on search query
  const filteredMedicines = searchQuery ? medicineInventory.filter(med => med.name.toLowerCase().includes(searchQuery.toLowerCase()) || med.category.toLowerCase().includes(searchQuery.toLowerCase())) : medicineInventory;
  // Get patient prescriptions
  const patientPrescriptions = selectedPatient ? prescriptions.filter(p => p.patientId === selectedPatient.id && p.status === 'New') : [];
  const handleAddToDispense = (medicine: Medicine) => {
    const existingItem = dispensedItems.find(item => item.medicineId === medicine.id);
    if (existingItem) {
      setDispensedItems(dispensedItems.map(item => item.medicineId === medicine.id ? {
        ...item,
        quantity: item.quantity + 1
      } : item));
    } else {
      setDispensedItems([...dispensedItems, {
        medicineId: medicine.id,
        medicineName: medicine.name,
        quantity: 1
      }]);
    }
  };
  const handleRemoveFromDispense = (medicineId: number) => {
    setDispensedItems(dispensedItems.filter(item => item.medicineId !== medicineId));
  };
  const handleUpdateQuantity = (medicineId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromDispense(medicineId);
      return;
    }
    const medicine = medicineInventory.find(med => med.id === medicineId);
    if (medicine && quantity > medicine.quantity) {
      alert(`Only ${medicine.quantity} units available in inventory.`);
      return;
    }
    setDispensedItems(dispensedItems.map(item => item.medicineId === medicineId ? {
      ...item,
      quantity
    } : item));
  };
  const handleSelectPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    // Add prescription items to dispensed items
    const newDispensedItems: DispensedItem[] = [];
    prescription.medications.forEach(med => {
      const medicine = medicineInventory.find(m => m.name === med.name);
      if (medicine) {
        newDispensedItems.push({
          medicineId: medicine.id,
          medicineName: medicine.name,
          quantity: med.quantity
        });
      }
    });
    setDispensedItems(newDispensedItems);
  };
  const handleDispense = () => {
    if (!selectedPatient) {
      alert('Please select a patient.');
      return;
    }
    if (dispensedItems.length === 0) {
      alert('Please add at least one medicine to dispense.');
      return;
    }
    // Update inventory
    const updatedInventory = medicineInventory.map(medicine => {
      const dispensedItem = dispensedItems.find(item => item.medicineId === medicine.id);
      if (dispensedItem) {
        const newQuantity = medicine.quantity - dispensedItem.quantity;
        // Check if the new quantity is below threshold
        if (newQuantity <= medicine.threshold && newQuantity > 0) {
          setLowStockAlert(medicine.name);
          setTimeout(() => setLowStockAlert(null), 5000);
        }
        return {
          ...medicine,
          quantity: newQuantity
        };
      }
      return medicine;
    });
    setMedicineInventory(updatedInventory);
    // Update prescription status if dispensing from prescription
    if (selectedPrescription) {
      setPrescriptions(prescriptions.map(p => p.id === selectedPrescription.id ? {
        ...p,
        status: 'Dispensed'
      } : p));
    }
    // Add to dispensing history
    setDispensingHistory([...dispensingHistory, {
      patient: selectedPatient,
      items: [...dispensedItems],
      date: new Date().toISOString().split('T')[0]
    }]);
    // Show success message
    setDispensingSuccess(true);
    // Reset form
    setTimeout(() => {
      setDispensedItems([]);
      setSelectedPrescription(null);
      setDispensingSuccess(false);
    }, 2000);
  };
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Dispensing Module</h2>
      </div>
      {dispensingSuccess && <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircleIcon size={20} className="mr-2" />
            <span>
              Medicines dispensed successfully. Inventory has been updated.
            </span>
          </div>
          <button onClick={() => setDispensingSuccess(false)} className="text-green-600 hover:text-green-800">
            ×
          </button>
        </div>}
      {lowStockAlert && <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangleIcon size={20} className="mr-2" />
            <span>
              <strong>{lowStockAlert}</strong> is now below the threshold level.
              Consider reordering.
            </span>
          </div>
          <button onClick={() => setLowStockAlert(null)} className="text-amber-600 hover:text-amber-800">
            ×
          </button>
        </div>}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Medicine Selection */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Select Medicines</h3>
            <div className="relative">
              <input type="text" placeholder="Search medicines by name or category..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              <SearchIcon className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>
          {/* Medicine Inventory Table */}
          <div className="overflow-y-auto max-h-96 border border-gray-200 rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medicine Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMedicines.map(medicine => {
                const isExpired = new Date(medicine.expiryDate) < new Date();
                const isLowStock = medicine.quantity <= medicine.threshold;
                return <tr key={medicine.id} className={`${isExpired ? 'bg-red-50' : isLowStock ? 'bg-amber-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {medicine.name}
                        {isExpired && <span className="ml-2 text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full">
                            Expired
                          </span>}
                        {!isExpired && isLowStock && <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                            Low Stock
                          </span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {medicine.category}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isLowStock ? 'text-amber-600' : 'text-gray-500'}`}>
                        {medicine.quantity}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isExpired ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                        {new Date(medicine.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleAddToDispense(medicine)} disabled={medicine.quantity <= 0 || isExpired} className={`px-3 py-1 rounded-md ${medicine.quantity <= 0 || isExpired ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                          Add
                        </button>
                      </td>
                    </tr>;
              })}
                {filteredMedicines.length === 0 && <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No medicines found.
                    </td>
                  </tr>}
              </tbody>
            </table>
          </div>
        </div>
        {/* Right Column - Dispensing Form */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Dispense Medicines</h3>
            {/* Patient Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Patient
              </label>
              <select value={selectedPatient?.id || ''} onChange={e => {
              const patientId = e.target.value;
              const patient = patients.find(p => p.id === patientId);
              setSelectedPatient(patient || null);
              setSelectedPrescription(null);
              setDispensedItems([]);
            }} className="w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="">-- Select Patient --</option>
                {patients.map(patient => <option key={patient.id} value={patient.id}>
                    {patient.name} ({patient.id})
                  </option>)}
              </select>
            </div>
            {/* Patient Prescriptions */}
            {selectedPatient && patientPrescriptions.length > 0 && <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prescriptions
                </label>
                <div className="space-y-2">
                  {patientPrescriptions.map(prescription => <div key={prescription.id} className={`border p-3 rounded-lg cursor-pointer ${selectedPrescription?.id === prescription.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`} onClick={() => handleSelectPrescription(prescription)}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium">
                            Prescribed by: {prescription.prescribedBy}
                          </p>
                          <p className="text-xs text-gray-500">
                            Date: {prescription.date}
                          </p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                          {prescription.medications.length} items
                        </span>
                      </div>
                    </div>)}
                </div>
              </div>}
            {/* Dispensing List */}
            <div className="border border-gray-200 rounded-md p-3 mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Medicines to Dispense
              </h4>
              {dispensedItems.length === 0 ? <p className="text-sm text-gray-500">No medicines added yet.</p> : <div className="space-y-3">
                  {dispensedItems.map(item => {
                const medicine = medicineInventory.find(med => med.id === item.medicineId);
                return <div key={item.medicineId} className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">
                            {item.medicineName}
                          </p>
                          <p className="text-xs text-gray-500">
                            Available: {medicine?.quantity || 0}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <button onClick={() => handleUpdateQuantity(item.medicineId, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-l-md hover:bg-gray-300">
                            -
                          </button>
                          <input type="number" min="1" max={medicine?.quantity || 1} value={item.quantity} onChange={e => handleUpdateQuantity(item.medicineId, parseInt(e.target.value) || 0)} className="w-10 h-6 text-center border-t border-b border-gray-300" />
                          <button onClick={() => handleUpdateQuantity(item.medicineId, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-r-md hover:bg-gray-300" disabled={item.quantity >= (medicine?.quantity || 0)}>
                            +
                          </button>
                          <button onClick={() => handleRemoveFromDispense(item.medicineId)} className="ml-2 text-red-600 hover:text-red-800">
                            ×
                          </button>
                        </div>
                      </div>;
              })}
                </div>}
            </div>
            {/* Dispense Button */}
            <button onClick={handleDispense} disabled={!selectedPatient || dispensedItems.length === 0 || dispensingSuccess} className={`w-full py-2 rounded-md ${!selectedPatient || dispensedItems.length === 0 || dispensingSuccess ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}>
              {dispensingSuccess ? <span className="flex items-center justify-center">
                  <CheckCircleIcon size={18} className="mr-1" />
                  Dispensed Successfully!
                </span> : <span className="flex items-center justify-center">
                  <PackageIcon size={18} className="mr-1" />
                  Dispense Medicines
                </span>}
            </button>
          </div>
          {/* Recent Dispensing History */}
          {dispensingHistory.length > 0 && <div className="bg-white p-6 rounded-lg shadow-sm">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Recent Dispensing History
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {dispensingHistory.slice().reverse().map((record, index) => <div key={index} className="border border-gray-200 rounded-md p-2 text-sm">
                      <div className="flex justify-between">
                        <p className="font-medium">{record.patient.name}</p>
                        <p className="text-gray-500">{record.date}</p>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {record.items.map(item => `${item.medicineName} (${item.quantity})`).join(', ')}
                      </p>
                    </div>)}
              </div>
            </div>}
        </div>
      </div>
    </div>;
}