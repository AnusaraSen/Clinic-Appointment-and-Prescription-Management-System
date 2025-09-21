import React, { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useEffect } from 'react'
import { AlertProvider } from './pages/clinical-workflow/prescriptions/AlertProvider'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AddPrescription from './pages/clinical-workflow/prescriptions/AddPrescription'
import AllPrescriptions from './pages/clinical-workflow/prescriptions/AllPrescriptions'
import UpdatePrescription from './pages/clinical-workflow/prescriptions/UpdatePrescription'
import DeletePrescription from './pages/clinical-workflow/prescriptions/DeletePrescription'
import NavBar from './components/NavBar'
import AddPatient from './pages/clinical-workflow/medical_records/AddPatient'
import AllPatients from './pages/clinical-workflow/medical_records/AllPatients'
import UpdatePatient from './pages/clinical-workflow/medical_records/UpdatePatient'
import DeletePatient from './pages/clinical-workflow/medical_records/DeletePatient'
import ClinicalDashboard from './pages/clinical-workflow/Dashboard_availability/Dashboard'
import DoctorProfile from './pages/clinical-workflow/Dashboard_availability/DoctorProfile'
import DoctorAvailability from './pages/clinical-workflow/Dashboard_availability/DoctorAvailability'
import Home from './pages/Home'
import InventoryDashboard from './pages/pharmacy-inventory/InventoryDashboard'
import AllActivities from './pages/pharmacy-inventory/AllActivities'
import LowStockItems from './pages/pharmacy-inventory/LowStockItems'
import MedicineList from './pages/pharmacy-inventory/Medicine-Inventory/MedicineList'
import InsertMedicine from './pages/pharmacy-inventory/Medicine-Inventory/InsertMedicine'
import UpdateMedicine from './pages/pharmacy-inventory/Medicine-Inventory/UpdateMedicine'
import DeleteMedicine from './pages/pharmacy-inventory/Medicine-Inventory/DeleteMedicine'
import LabItemList from './pages/pharmacy-inventory/Lab-Inventory/LabItemList'
import InsertLabItem from './pages/pharmacy-inventory/Lab-Inventory/InsertLabItem'
import UpdateLabItem from './pages/pharmacy-inventory/Lab-Inventory/UpdateLabItem'
import DeleteLabItem from './pages/pharmacy-inventory/Lab-Inventory/DeleteLabItem'
import OrdersPage from './pages/pharmacy-inventory/OrdersPage'
import PharmacistDashboard from './pages/pharmacy-inventory/PharmacistDashboard'
// Patient Interaction imports
import AddAppointments from "./pages/patient-interaction/AddAppointments";
import AllAppointments from "./pages/patient-interaction/AllAppointments";
import UpdateAppointments from "./pages/patient-interaction/UpdateAppointments";
import DeleteAppointments from "./pages/patient-interaction/DeleteAppointments";
import PatientProfile from "./pages/patient-interaction/PatientProfile";
import AppointmentDetails from "./pages/patient-interaction/AppointmentDetails";
import AddFeedback from "./pages/patient-interaction/AddFeedback";
import AllFeedback from "./pages/patient-interaction/AllFeedback";
import UpdateFeedback from "./pages/patient-interaction/UpdateFeedback";
import DeleteFeedback from "./pages/patient-interaction/DeleteFeedback";
import PatientDashboard from "./pages/patient-interaction/Dashboard";
import DoctorsPage from "./pages/patient-interaction/DoctorsPage";
import Prescriptions from "./pages/patient-interaction/Prescriptions";
import MedicalRecords from "./pages/patient-interaction/MedicalRecords";
import LabReports from "./pages/patient-interaction/LabReports";
import Support from "./pages/patient-interaction/Support";
import "./App.css";



function App() {
const [count, setCount] = useState(0)

const [globalSearch, setGlobalSearch] = useState('');
  return (
    <Router>
      <AlertProvider>
      <div className="App">
         <NavBar search={globalSearch} onSearchChange={setGlobalSearch} />

         <Routes>
          {/* Home Route */}
          <Route path="/" element={<Home />} />
          
          {/* Clinical Workflow Routes */}
          <Route path="/clinical/dashboard" element={<ClinicalDashboard />} />
          <Route path="/dashboard" element={<ClinicalDashboard />} />
          <Route path="/doctor-profile" element={<DoctorProfile />} />
          <Route path="/doctor-availability" element={<DoctorAvailability />} />
          
          {/* Prescription Routes */}
          <Route path="/prescription/add" element={<AddPrescription />} />
          <Route path="/addPrescription" element={<AddPrescription />} />
          <Route path="/prescription/all" element={<AllPrescriptions search={globalSearch} />} />
          <Route path="/allPrescriptions" element={<AllPrescriptions search={globalSearch} />} />
          <Route path="/prescription/update/:id" element={<UpdatePrescription />} />
          <Route path="/prescription/delete/:id" element={<DeletePrescription />} />

          {/* Patient Routes */}
          <Route path="/patient/add" element={<AddPatient />} />
          <Route path="/addPatient" element={<AddPatient />} />
          <Route path="/patient/all" element={<AllPatients search={globalSearch} />} />
          <Route path="/getPatient" element={<AllPatients search={globalSearch} />} />
          <Route path="/patient/update/:id" element={<UpdatePatient />} />
          <Route path="/updatePatient/:id" element={<UpdatePatient />} />
          <Route path="/patient/delete/:id" element={<DeletePatient />} />
          <Route path="/deletePatient/:id" element={<DeletePatient />} />

          {/* Pharmacy Inventory Routes */}
          <Route path="/inventory-dashboard" element={<InventoryDashboard />} />
          <Route path="/lab/Pdashboard" element={<InventoryDashboard />} />
          <Route path="/activities" element={<AllActivities />} />
          <Route path="/low-stock-items" element={<LowStockItems />} />
          
          {/* Medicine Inventory Routes */}
          <Route path="/medicine/list" element={<MedicineList />} />
          <Route path="/medicine/add" element={<InsertMedicine />} />
          <Route path="/medicine/edit/:id" element={<UpdateMedicine />} />
          <Route path="/medicine/delete/:id" element={<DeleteMedicine />} />
          
          {/* Lab Inventory Routes */}
          <Route path="/lab/list" element={<LabItemList />} />
          <Route path="/lab/add" element={<InsertLabItem />} />
          <Route path="/lab/edit/:id" element={<UpdateLabItem />} />
          <Route path="/lab/delete/:id" element={<DeleteLabItem />} />
          
          {/* Order Management Routes */}
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/pharmacist/dashboard" element={<PharmacistDashboard />} />

          {/* Patient Interaction Routes */}
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/appointments" element={<AllAppointments />} />
          <Route path="/appointments/add" element={<AddAppointments />} />
          <Route path="/appointments/update/:id" element={<UpdateAppointments />} />
          <Route path="/appointments/delete/:id" element={<DeleteAppointments />} />
          
          {/* Feedback Routes */}
          <Route path="/feedback" element={<AllFeedback />} />
          <Route path="/feedback/add" element={<AddFeedback />} />
          <Route path="/feedback/update/:id" element={<UpdateFeedback />} />
          <Route path="/feedback/delete/:id" element={<DeleteFeedback />} />
          
          {/* Patient Profile and Details */}
          <Route path="/patient/:id" element={<PatientProfile />} />
          <Route path="/appointment/:id" element={<AppointmentDetails />} />
          
          {/* Dashboard Sub-routes */}
          <Route path="/dashboard/patient" element={<PatientDashboard />} />
          <Route path="/dashboard/prescriptions" element={<Prescriptions />} />
          <Route path="/dashboard/medical-records" element={<MedicalRecords />} />
          <Route path="/dashboard/lab-reports" element={<LabReports />} />
          <Route path="/dashboard/support" element={<Support />} />
          <Route path="/doctors" element={<DoctorsPage />} />

        </Routes>
  </div>
  </AlertProvider>
    </Router>
  );
}

export default App
