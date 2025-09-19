import React, { useState, Component } from 'react';
import { ClipboardListIcon, PackageIcon, ArrowUpIcon, AlertTriangleIcon, CheckCircleIcon, CalendarIcon, UserIcon, SearchIcon, PlusIcon, ClockIcon, BellIcon } from 'lucide-react';
// Sample data for dashboard metrics
const pharmacistMetrics = {
  pendingPrescriptions: 12,
  dispensedToday: 28,
  lowStockMedicines: 8,
  totalPatients: 156,
  comparedYesterday: 15 // percentage increase from yesterday
};
// Sample data for recent prescriptions
const recentPrescriptions = [{
  id: 1,
  patientName: 'John Smith',
  patientId: 'P-001',
  status: 'Pending',
  items: 3,
  timestamp: '10:23 AM'
}, {
  id: 2,
  patientName: 'Sarah Johnson',
  patientId: 'P-002',
  status: 'Pending',
  items: 1,
  timestamp: '09:45 AM'
}, {
  id: 3,
  patientName: 'Michael Brown',
  patientId: 'P-003',
  status: 'Dispensed',
  items: 2,
  timestamp: '09:15 AM'
}, {
  id: 4,
  patientName: 'Emily Davis',
  patientId: 'P-004',
  status: 'Pending',
  items: 4,
  timestamp: '08:50 AM'
}, {
  id: 5,
  patientName: 'Robert Wilson',
  patientId: 'P-005',
  status: 'Dispensed',
  items: 2,
  timestamp: 'Yesterday'
}];
// Sample data for low stock medicines
const lowStockMedicines = [{
  id: 1,
  name: 'Amoxicillin 500mg',
  quantity: 25,
  threshold: 50
}, {
  id: 2,
  name: 'Lisinopril 10mg',
  quantity: 15,
  threshold: 30
}, {
  id: 3,
  name: 'Metformin 850mg',
  quantity: 20,
  threshold: 40
}, {
  id: 4,
  name: 'Atorvastatin 20mg',
  quantity: 18,
  threshold: 30
}];
// Sample data for recent patients
const recentPatients = [{
  id: 'P-001',
  name: 'John Smith',
  lastVisit: 'Today',
  prescriptions: 12
}, {
  id: 'P-002',
  name: 'Sarah Johnson',
  lastVisit: 'Today',
  prescriptions: 8
}, {
  id: 'P-003',
  name: 'Michael Brown',
  lastVisit: 'Yesterday',
  prescriptions: 15
}, {
  id: 'P-004',
  name: 'Emily Davis',
  lastVisit: 'Yesterday',
  prescriptions: 6
}];
export function Dashboard() {
  const [dispensingSuccess, setDispensingSuccess] = useState<string | null>(null);
  const handleDispense = (patientName: string) => {
    setDispensingSuccess(patientName);
    // Reset success message after 3 seconds
    setTimeout(() => {
      setDispensingSuccess(null);
    }, 3000);
  };
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Pharmacist Dashboard
        </h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 flex items-center">
            <CalendarIcon size={16} className="mr-1" />
            {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
          </span>
          <button className="relative p-1.5 rounded-full bg-gray-100 hover:bg-gray-200">
            <BellIcon size={20} className="text-gray-600" />
            <span className="absolute top-0 right-0 w-4 h-4 bg-amber-500 rounded-full text-xs text-white flex items-center justify-center">
              {pharmacistMetrics.pendingPrescriptions}
            </span>
          </button>
        </div>
      </div>
      {dispensingSuccess && <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircleIcon size={20} className="mr-2" />
            <span>
              Medicines dispensed to <strong>{dispensingSuccess}</strong>{' '}
              successfully. Inventory has been updated.
            </span>
          </div>
          <button onClick={() => setDispensingSuccess(null)} className="text-green-600 hover:text-green-800">
            ×
          </button>
        </div>}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-md p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton label="Search Patient" icon={<SearchIcon size={20} />} />
          <QuickActionButton label="New Prescription" icon={<PlusIcon size={20} />} />
          <QuickActionButton label="Dispense Medicine" icon={<PackageIcon size={20} />} />
          <QuickActionButton label="View All Patients" icon={<UserIcon size={20} />} />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Pending Prescriptions" value={pharmacistMetrics.pendingPrescriptions} icon={<ClipboardListIcon className="text-amber-500" />} label="Require attention" bgColor="bg-amber-50" textColor="text-amber-700" actionLabel="Process" />
        <MetricCard title="Dispensed Today" value={pharmacistMetrics.dispensedToday} icon={<CheckCircleIcon className="text-green-500" />} change={pharmacistMetrics.comparedYesterday} label="vs. yesterday" bgColor="bg-green-50" textColor="text-green-700" />
        <MetricCard title="Low Stock Medicines" value={pharmacistMetrics.lowStockMedicines} icon={<AlertTriangleIcon className="text-red-500" />} label="Need reordering" bgColor="bg-red-50" textColor="text-red-700" actionLabel="View" />
        <MetricCard title="Total Patients" value={pharmacistMetrics.totalPatients} icon={<UserIcon className="text-blue-500" />} bgColor="bg-blue-50" textColor="text-blue-700" />
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Prescriptions */}
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Prescriptions
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentPrescriptions.map(prescription => <tr key={prescription.id} className="hover:bg-gray-50">
                    <td className="py-3 text-sm text-gray-800 font-medium">
                      {prescription.patientName}
                    </td>
                    <td className="py-3 text-sm text-gray-500">
                      {prescription.patientId}
                    </td>
                    <td className="py-3 text-sm text-gray-500">
                      <div className="flex items-center">
                        <ClockIcon size={14} className="mr-1 text-gray-400" />
                        {prescription.timestamp}
                      </div>
                    </td>
                    <td className="py-3 text-sm text-gray-500">
                      {prescription.items}
                    </td>
                    <td className="py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${prescription.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                        {prescription.status}
                      </span>
                    </td>
                    <td className="py-3 text-sm">
                      {prescription.status === 'Pending' ? <button onClick={() => handleDispense(prescription.patientName)} className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center">
                          <CheckCircleIcon size={14} className="mr-1" />
                          Dispense
                        </button> : <button className="text-gray-600 hover:text-gray-800 font-medium text-sm">
                          View
                        </button>}
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Low Stock Medicines */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Low Stock Medicines
              </h3>
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-1 rounded-full">
                {lowStockMedicines.length} items
              </span>
            </div>
            <div className="space-y-3">
              {lowStockMedicines.map(medicine => <div key={medicine.id} className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <p className="font-medium text-gray-800">{medicine.name}</p>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      Threshold: {medicine.threshold}
                    </p>
                    <p className="text-xs text-red-600 font-semibold">
                      Current: {medicine.quantity}
                    </p>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-red-600 h-1.5 rounded-full" style={{
                  width: `${medicine.quantity / medicine.threshold * 100}%`
                }}></div>
                  </div>
                </div>)}
            </div>
            <button className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All Low Stock
            </button>
          </div>

          {/* Recent Patients */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Recent Patients
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {recentPatients.map(patient => <div key={patient.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <UserIcon size={18} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{patient.name}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>ID: {patient.id}</span>
                      <span>{patient.lastVisit}</span>
                    </div>
                  </div>
                </div>)}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickAccessCard title="Prescriptions" description="View and process patient prescriptions" icon={<ClipboardListIcon size={24} className="text-blue-500" />} bgColor="bg-blue-50" linkText="Go to Prescriptions" linkTo="prescriptions" />
        <QuickAccessCard title="Dispensing Module" description="Dispense medicines to patients and update inventory" icon={<PackageIcon size={24} className="text-green-500" />} bgColor="bg-green-50" linkText="Go to Dispensing" linkTo="dispensing" />
      </div>
    </div>;
}
// Helper Components
type MetricCardProps = {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  change?: number;
  label?: string;
  bgColor?: string;
  textColor?: string;
  actionLabel?: string;
};
function MetricCard({
  title,
  value,
  icon,
  change,
  label,
  bgColor = 'bg-gray-50',
  textColor = 'text-gray-700',
  actionLabel
}: MetricCardProps) {
  return <div className={`rounded-xl shadow-sm p-6 ${bgColor} border border-gray-100`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={`text-2xl font-bold ${textColor} mt-2`}>{value}</p>
        </div>
        <div className="p-2 rounded-lg bg-white shadow-sm">{icon}</div>
      </div>
      {label && <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            {change !== undefined && <span className="mr-1 text-green-600 flex items-center">
                <ArrowUpIcon size={14} />
                {change}%
              </span>}
            <span className="text-xs text-gray-500">{label}</span>
          </div>
          {actionLabel && <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
              {actionLabel}
            </button>}
        </div>}
    </div>;
}
type QuickActionButtonProps = {
  label: string;
  icon: React.ReactNode;
};
function QuickActionButton({
  label,
  icon
}: QuickActionButtonProps) {
  return <button className="bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors rounded-lg p-3 text-center flex flex-col items-center justify-center">
      <div className="p-2 bg-white bg-opacity-90 rounded-full text-blue-600 mb-2">
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </button>;
}
type QuickAccessCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  linkText: string;
  linkTo: string;
};
function QuickAccessCard({
  title,
  description,
  icon,
  bgColor,
  linkText,
  linkTo
}: QuickAccessCardProps) {
  return <div className={`rounded-xl shadow-sm overflow-hidden ${bgColor} border border-gray-100`}>
      <div className="p-6">
        <div className="p-3 bg-white rounded-lg inline-block mb-4 shadow-sm">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center" onClick={() => {}}>
          {linkText}
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>;
}