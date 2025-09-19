import React, { useState } from 'react';
import { CheckIcon, EyeIcon } from 'lucide-react';
// Sample data for prescriptions
const initialPrescriptions = [{
  id: 1,
  patientName: 'John Smith',
  patientId: 'P-001',
  prescribedBy: 'Dr. Robert Chen',
  date: '2023-05-10',
  status: 'New',
  medications: [{
    name: 'Amoxicillin',
    dosage: '500mg',
    frequency: '3 times daily',
    duration: '7 days'
  }, {
    name: 'Ibuprofen',
    dosage: '400mg',
    frequency: 'As needed',
    duration: '5 days'
  }]
}, {
  id: 2,
  patientName: 'Sarah Johnson',
  patientId: 'P-002',
  prescribedBy: 'Dr. Emily Wilson',
  date: '2023-05-09',
  status: 'New',
  medications: [{
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    duration: '30 days'
  }]
}, {
  id: 3,
  patientName: 'Michael Brown',
  patientId: 'P-003',
  prescribedBy: 'Dr. James Lee',
  date: '2023-05-08',
  status: 'Dispensed',
  medications: [{
    name: 'Metformin',
    dosage: '850mg',
    frequency: 'Twice daily',
    duration: '30 days'
  }, {
    name: 'Atorvastatin',
    dosage: '20mg',
    frequency: 'Once daily at night',
    duration: '30 days'
  }]
}, {
  id: 4,
  patientName: 'Lisa Davis',
  patientId: 'P-004',
  prescribedBy: 'Dr. Robert Chen',
  date: '2023-05-07',
  status: 'Dispensed',
  medications: [{
    name: 'Amoxicillin',
    dosage: '250mg',
    frequency: '3 times daily',
    duration: '5 days'
  }]
}, {
  id: 5,
  patientName: 'David Wilson',
  patientId: 'P-005',
  prescribedBy: 'Dr. Emily Wilson',
  date: '2023-05-06',
  status: 'Dispensed',
  medications: [{
    name: 'Ibuprofen',
    dosage: '600mg',
    frequency: '3 times daily',
    duration: '3 days'
  }, {
    name: 'Omeprazole',
    dosage: '20mg',
    frequency: 'Once daily',
    duration: '7 days'
  }]
}];
type Medication = {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
};
type Prescription = {
  id: number;
  patientName: string;
  patientId: string;
  prescribedBy: string;
  date: string;
  status: 'New' | 'Dispensed';
  medications: Medication[];
};
export function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialPrescriptions);
  const [viewPrescription, setViewPrescription] = useState<Prescription | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const handleMarkAsDispensed = (id: number) => {
    setPrescriptions(prescriptions.map(prescription => prescription.id === id ? {
      ...prescription,
      status: 'Dispensed'
    } : prescription));
  };
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-green-100 text-green-800';
      case 'Dispensed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Prescriptions</h2>
        <div className="flex space-x-2">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
            All
          </button>
          <button className="bg-green-100 border border-green-200 text-green-800 px-4 py-2 rounded-lg hover:bg-green-200">
            New
          </button>
          <button className="bg-blue-100 border border-blue-200 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200">
            Dispensed
          </button>
        </div>
      </div>
      {/* Prescriptions Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prescribed By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {prescriptions.map(prescription => <tr key={prescription.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {prescription.patientName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {prescription.patientId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {prescription.prescribedBy}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {prescription.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(prescription.status)}`}>
                    {prescription.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => {
                setViewPrescription(prescription);
                setIsViewModalOpen(true);
              }} className="text-indigo-600 hover:text-indigo-900 mr-3">
                    <EyeIcon size={18} />
                  </button>
                  {prescription.status === 'New' && <button onClick={() => handleMarkAsDispensed(prescription.id)} className="text-green-600 hover:text-green-900">
                      <CheckIcon size={18} />
                    </button>}
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>
      {/* View Prescription Modal */}
      {isViewModalOpen && viewPrescription && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Prescription Details</h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(viewPrescription.status)}`}>
                {viewPrescription.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Patient</p>
                <p className="font-medium">{viewPrescription.patientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Patient ID</p>
                <p className="font-medium">{viewPrescription.patientId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Prescribed By</p>
                <p className="font-medium">{viewPrescription.prescribedBy}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{viewPrescription.date}</p>
              </div>
            </div>
            <h4 className="font-medium mb-2">Medications</h4>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              {viewPrescription.medications.map((med, index) => <div key={index} className={`${index > 0 ? 'border-t border-gray-200 pt-3 mt-3' : ''}`}>
                  <p className="font-medium text-blue-800">{med.name}</p>
                  <div className="grid grid-cols-3 gap-2 mt-1 text-sm">
                    <p>
                      <span className="text-gray-500">Dosage:</span>{' '}
                      {med.dosage}
                    </p>
                    <p>
                      <span className="text-gray-500">Frequency:</span>{' '}
                      {med.frequency}
                    </p>
                    <p>
                      <span className="text-gray-500">Duration:</span>{' '}
                      {med.duration}
                    </p>
                  </div>
                </div>)}
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                Close
              </button>
              {viewPrescription.status === 'New' && <button onClick={() => {
            handleMarkAsDispensed(viewPrescription.id);
            setIsViewModalOpen(false);
          }} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center">
                  <CheckIcon size={18} className="mr-1" />
                  Mark as Dispensed
                </button>}
            </div>
          </div>
        </div>}
    </div>;
}