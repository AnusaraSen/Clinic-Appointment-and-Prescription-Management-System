import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './features/authentication/context/AuthContext';
import { Dashboard } from './features/admin-management/components/Dashboard';
import ProfessionalLayout from './shared/components/layout/ProfessionalLayout';
import MaintenanceManagementPage from './features/equipment-maintenance/pages/MaintenanceManagementPage';
import UsersPage from './features/admin-management/pages/UsersPage';
import TechnicianDashboard from './features/equipment-maintenance/pages/TechnicianDashboard';
import AuthPage from './features/authentication/pages/AuthPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ContactPage from './pages/ContactPage';
import ServicesPage from './pages/ServicesPage';
import AppointmentsPage from './pages/AppointmentsPage';
import RoleProtectedRoute from './components/RoleProtectedRoute';


// Role-based Dashboard imports
import RoleDashboardRouter from "./features/Lab-Workflow/components/RoleDashboardRouter";
// Dashboard Page imports
import AdminDashboardPage from './features/admin-management/pages/AdminDashboardPage';
import ClinicalDashboardPage from './features/clinical-workflow/pages/ClinicalDashboardPage';
import PatientDashboardPage from './features/patient-interaction/pages/PatientDashboardPage';
import PharmacistDashboardPage from './features/pharmacy-inventory/pages/PharmacistDashboardPage';
import InventoryDashboardPage from './features/pharmacy-inventory/pages/InventoryDashboardPage';
import LabAssistantDashboardPage from './features/Lab-Workflow/pages/LabAssistantDashboardPage';
import LabSupervisorDashboardPage from './features/Lab-Workflow/pages/LabSupervisorDashboardPage';
// Lab Test imports - COMMENTED OUT MISSING COMPONENTS
// import LabTestsPage from "./features/Lab-Workflow/components/LabTestsPage";
// import LabTestDetailsPage from "./features/Lab-Workflow/components/LabTestDetailsPage";
// import EditLabTestPage from "./features/Lab-Workflow/components/EditLabTestPage";
import AddLabTestPage from "./features/Lab-Workflow/components/AddLabTestPage";
// import ProcessLabTestPage from "./features/Lab-Workflow/components/ProcessLabTestPage";
import TestResultPage from "./features/Lab-Workflow/components/TestResultPage";
import UploadTestResult from "./features/Lab-Workflow/components/UploadTestResultPage";
// import EditTestResult from "./features/Lab-Workflow/components/EditTestResult";
// import LabTestResultsPage from "./features/Lab-Workflow/components/LabTestResultsPage";
// import AddTestResultPage from "./features/Lab-Workflow/components/AddTestResultPage";
// import TestResultDetailsPage from "./features/Lab-Workflow/components/TestResultDetailsPage";
import TaskListPage from "./features/Lab-Workflow/components/TaskListPage";
// import AddTaskPage from "./features/Lab-Workflow/components/AddTaskPage";
// import EditTaskPage from "./features/Lab-Workflow/components/EditTaskPage";

// Placeholder imports for missing components
import {
  LabTestsPage,
  LabTestDetailsPage,
  EditLabTestPage,
  ProcessLabTestPage,
  EditTestResult,
  LabTestResultsPage,
  AddTestResultPage,
  TestResultDetailsPage,
  AddTaskPage,
  EditTaskPage
} from './components/PlaceholderComponents';

//Doctor-Patient-Pharmacist
import { AlertProvider } from './features/clinical-workflow/pages/prescriptions/AlertProvider';
import AddPrescription from './features/clinical-workflow/pages/prescriptions/AddPrescription';
import AllPrescriptions from './features/clinical-workflow/pages/prescriptions/AllPrescriptions';
import UpdatePrescription from './features/clinical-workflow/pages/prescriptions/UpdatePrescription';
import DeletePrescription from './features/clinical-workflow/pages/prescriptions/DeletePrescription';
import NavBar from './components/NavBar';
import AddPatient from './features/clinical-workflow/pages/medical-records/AddPatient';
import AllPatients from './features/clinical-workflow/pages/medical-records/AllPatients';
import UpdatePatient from './features/clinical-workflow/pages/medical-records/UpdatePatient';
import DeletePatient from './features/clinical-workflow/pages/medical-records/DeletePatient';
import ClinicalDashboard from './features/clinical-workflow/pages/Dashboard';
import DoctorProfile from './features/clinical-workflow/pages/DoctorProfile';
import DoctorAvailability from './features/clinical-workflow/pages/DoctorAvailability';
import DoctorAppointmentsWrapper from './features/clinical-workflow/pages/DoctorAppointmentsWrapper';

// Clinical pages with sidebar navigation
import MedicalRecordsPage from './features/clinical-workflow/pages/MedicalRecordsPage';
import PrescriptionsPage from './features/clinical-workflow/pages/PrescriptionsPage';
import DoctorCalendarPage from './features/clinical-workflow/pages/DoctorCalendarPage';
import DoctorProfilePage from './features/clinical-workflow/pages/DoctorProfilePage';
import PatientHistoryPage from './features/clinical-workflow/pages/PatientHistoryPage';
import Home from './pages/Home'
import InventoryDashboard from './features/pharmacy-inventory/pages/InventoryDashboard'
import AllActivities from './features/pharmacy-inventory/pages/AllActivities'
import LowStockItems from './features/pharmacy-inventory/pages/LowStockItems'
import MedicineList from './features/pharmacy-inventory/pages/Medicine-Inventory/MedicineList'
import InsertMedicine from './features/pharmacy-inventory/pages/Medicine-Inventory/InsertMedicine'
import UpdateMedicine from './features/pharmacy-inventory/pages/Medicine-Inventory/UpdateMedicine'
import DeleteMedicine from './features/pharmacy-inventory/pages/Medicine-Inventory/DeleteMedicine'
import ChemicalList from './features/pharmacy-inventory/pages/Lab-Inventory/Chemical-inventory/ChemicalList'
import InsertChemical from './features/pharmacy-inventory/pages/Lab-Inventory/Chemical-inventory/InsertChemical'
import UpdateChemical from './features/pharmacy-inventory/pages/Lab-Inventory/Chemical-inventory/UpdateChemical'
import EquipmentList from './features/pharmacy-inventory/pages/Lab-Inventory/Equipment-Inventory/EquipmentList';
import InsertEquipment from './features/pharmacy-inventory/pages/Lab-Inventory/Equipment-Inventory/InsertEquipment';
import UpdateEquipment from './features/pharmacy-inventory/pages/Lab-Inventory/Equipment-Inventory/UpdateEquipment';
import LabItemList from './features/pharmacy-inventory/pages/Lab-Inventory/LabItemList'
import InsertLabItem from './features/pharmacy-inventory/pages/Lab-Inventory/InsertLabItem'
import UpdateLabItem from './features/pharmacy-inventory/pages/Lab-Inventory/UpdateLabItem'
import DeleteLabItem from './features/pharmacy-inventory/pages/Lab-Inventory/DeleteLabItem'
import OrdersPage from './features/pharmacy-inventory/pages/OrdersPage'
import CreateOrder from './features/pharmacy-inventory/pages/OrderManagement/CreateOrder'
import UpdateOrder from './features/pharmacy-inventory/pages/OrderManagement/UpdateOrder'
import PharmacistDashboard from './features/pharmacy-inventory/pages/PharmacistDashboard'
import PrescriptionDetails from './features/pharmacy-inventory/components/PrescriptionDetails';
import InventoryLayout from './features/pharmacy-inventory/components/InventoryLayout';
// Patient Interaction imports
import AddAppointments from "./features/patient-interaction/pages/AddAppointments";
import AllAppointments from "./features/patient-interaction/pages/AllAppointments";
import UpdateAppointments from "./features/patient-interaction/pages/UpdateAppointments";
import DeleteAppointments from "./features/patient-interaction/pages/DeleteAppointments";
import PatientProfile from "./features/patient-interaction/pages/PatientProfile";
import AppointmentDetails from "./features/patient-interaction/pages/AppointmentDetails";
import AddFeedback from "./features/patient-interaction/pages/AddFeedback";
import MyFeedback from "./features/patient-interaction/pages/MyFeedback";
import TestFeedback from "./features/patient-interaction/pages/TestFeedback";
import SimpleFeedback from "./features/patient-interaction/pages/SimpleFeedback";
import UpdateFeedback from "./features/patient-interaction/pages/UpdateFeedback";
import DeleteFeedback from "./features/patient-interaction/pages/DeleteFeedback";
import PatientDashboard from "./features/patient-interaction/pages/Dashboard";
import DoctorsPage from "./features/patient-interaction/pages/DoctorsPage";
import CompletedVisits from "./features/patient-interaction/pages/CompletedVisits";
import Prescriptions from "./features/patient-interaction/pages/Prescriptions";
import MedicalRecords from "./features/patient-interaction/pages/MedicalRecords";
import LabReports from "./features/patient-interaction/pages/LabReports";
import Support from "./features/patient-interaction/pages/Support";
import "./App.css";
import AppointmentPrescriptions from './features/patient-interaction/pages/AppointmentPrescriptions';


// Simple ProtectedRoute replacement for now
const ProtectedRoute = ({ children }) => {
  try {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <Navigate to="/auth" replace />;
    }

    return children;
  } catch (error) {
    console.error('Error in ProtectedRoute:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Authentication error occurred. Please refresh the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
};

// Role-based dashboard redirect
const DashboardRedirect = () => {
  try {
    const { user } = useAuth();
    
    console.log('DashboardRedirect: Current user:', user);
    console.log('DashboardRedirect: User role:', user?.role);
    
    // Redirect technicians to their specialized dashboard
    if (user?.role === 'Technician') {
      console.log('DashboardRedirect: Redirecting technician to /technician-dashboard');
      return <Navigate to="/technician-dashboard" replace />;
    }
    
    // Redirect inventory managers to inventory dashboard
    if (user?.role === 'InventoryManager') {
      return <Navigate to="/inventory-dashboard" replace />;
    }
    
    // Redirect lab supervisors to lab workflow dashboard
    if (user?.role === 'LabSupervisor') {
      return <Navigate to="/lab-workflow/dashboard" replace />;
    }
    
    // Redirect lab staff (assistants) to lab workflow dashboard 
    if (user?.role === 'LabStaff' || user?.role === 'LabAssistant') {
      return <Navigate to="/lab-workflow/dashboard" replace />;
    }
    
    console.log('DashboardRedirect: No role match, going to default dashboard');
    // All other users go to the main dashboard
    return (
      <ProfessionalLayout>
        <Dashboard />
      </ProfessionalLayout>
    );
  } catch (error) {
    console.error('Error in DashboardRedirect:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Dashboard loading error. Please try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
};

// Simple PublicRoute replacement for now
const PublicRoute = ({ children }) => {
  try {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (isAuthenticated) {
      return <Navigate to="/" replace />;
    }

    return children;
  } catch (error) {
    console.error('Error in PublicRoute:', error);
    return children; // Allow access to public routes on error
  }
};

function App() {
  const [globalSearch, setGlobalSearch] = useState('');
  
  return (
      <div className="App">
        <AlertProvider>

        <Routes>
        
        {/* Public routes */}
        <Route 
          path="/auth" 
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } 
        />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/users" 
          element={
            <ProtectedRoute>
              <ProfessionalLayout>
                <UsersPage />
              </ProfessionalLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/maintenance" 
          element={
            <ProtectedRoute>
              <ProfessionalLayout>
                <MaintenanceManagementPage />
              </ProfessionalLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/technician-dashboard" 
          element={
            <ProtectedRoute>
              <ProfessionalLayout>
                <TechnicianDashboard />
              </ProfessionalLayout>
            </ProtectedRoute>
          } 
        />
        
        {/* Legacy redirects */}
        <Route path="/work-requests" element={<Navigate to="/maintenance?tab=work-requests" replace />} />
        <Route path="/equipment" element={<Navigate to="/maintenance?tab=equipment" replace />} />
        <Route path="/technicians" element={<Navigate to="/maintenance?tab=technicians" replace />} />
        <Route path="/calendar" element={<Navigate to="/maintenance?tab=calendar" replace />} />
        
        {/* Default redirect */}
        <Route path="/home" element={<Navigate to="/" replace />} />
        
        {/* Role-based Dashboard Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <RoleProtectedRoute allowedRoles={['Admin', 'Administrator']}>
              <AdminDashboardPage />
            </RoleProtectedRoute>
          } 
        />
        
        <Route 
          path="/clinical/dashboard" 
          element={
            <RoleProtectedRoute allowedRoles={['Doctor', 'Clinician', 'Physician']}>
              <ClinicalDashboardPage />
            </RoleProtectedRoute>
          } 
        />
        
        <Route 
          path="/patient/dashboard" 
          element={
            <RoleProtectedRoute allowedRoles={['Patient']}>
              <PatientDashboardPage />
            </RoleProtectedRoute>
          } 
        />
        
        <Route 
          path="/pharmacist/dashboard-old" 
          element={<PharmacistDashboardPage />} 
        />
        
        <Route 
          path="/inventory/dashboard" 
          element={
            <RoleProtectedRoute allowedRoles={['Inventory Manager', 'Pharmacist', 'Admin']}>
              <InventoryDashboardPage />
            </RoleProtectedRoute>
          } 
        />
        
        <Route 
          path="/lab/assistant/dashboard" 
          element={
            <RoleProtectedRoute allowedRoles={['Lab Assistant', 'LabAssistant', 'Lab Technician']}>
              <LabAssistantDashboardPage />
            </RoleProtectedRoute>
          } 
        />
        
        <Route 
          path="/lab/supervisor/dashboard" 
          element={
            <RoleProtectedRoute allowedRoles={['Lab Supervisor', 'LabSupervisor', 'Lab Manager']}>
              <LabSupervisorDashboardPage />
            </RoleProtectedRoute>
          } 
        />
        
        {/* Lab Workflow Routes */}
        <Route 
          path="/lab-workflow/dashboard" 
          element={
            <ProtectedRoute>
              <ProfessionalLayout>
                <RoleDashboardRouter />
              </ProfessionalLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/lab-workflow/lab-tests" 
          element={
            <ProtectedRoute>
              <ProfessionalLayout>
                <LabTestsPage />
              </ProfessionalLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/lab-workflow/lab-tests/new" 
          element={
            <ProtectedRoute>
              <ProfessionalLayout>
                <AddLabTestPage />
              </ProfessionalLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/lab-workflow/lab-tests/:id" 
          element={
            <ProtectedRoute>
              <ProfessionalLayout>
                <LabTestDetailsPage />
              </ProfessionalLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/lab-workflow/lab-tests/:id/edit" 
          element={
            <ProtectedRoute>
              <ProfessionalLayout>
                <EditLabTestPage />
              </ProfessionalLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/lab-workflow/lab-tests/:id/results" 
          element={
            <ProtectedRoute>
              <ProfessionalLayout>
                <LabTestResultsPage />
              </ProfessionalLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/lab-workflow/lab-tests/:id/results/new" 
          element={
            <ProtectedRoute>
              <ProfessionalLayout>
                <AddTestResultPage />
              </ProfessionalLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/lab-workflow/lab-tests/:id/results/:resultId/edit" 
          element={
            <ProtectedRoute>
              <ProfessionalLayout>
                <EditTestResult />
              </ProfessionalLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/lab-workflow/process-test/:testId" 
          element={
            <ProtectedRoute>
              <ProfessionalLayout>
                <ProcessLabTestPage />
              </ProfessionalLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/lab-workflow/test-result/:testId" 
          element={
            <ProtectedRoute>
              <ProfessionalLayout>
                <TestResultDetailsPage />
              </ProfessionalLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/lab-workflow/test-result/:testId/upload" 
          element={
            <ProtectedRoute>
              <ProfessionalLayout>
                <UploadTestResult />
              </ProfessionalLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/lab-workflow/test-results" 
          element={
            <ProtectedRoute>
              <ProfessionalLayout>
                <TestResultPage />
              </ProfessionalLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/lab-workflow/tasks" 
          element={
            <ProtectedRoute>
              <ProfessionalLayout>
                <TaskListPage />
              </ProfessionalLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/lab-workflow/tasks/new" 
          element={
            <ProtectedRoute>
              <ProfessionalLayout>
                <AddTaskPage />
              </ProfessionalLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/lab-workflow/tasks/:id/edit" 
          element={
            <ProtectedRoute>
              <ProfessionalLayout>
                <EditTaskPage />
              </ProfessionalLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/add-task" 
          element={
            <ProtectedRoute>
              <ProfessionalLayout>
                <AddTaskPage />
              </ProfessionalLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/tasks" 
          element={
            <ProtectedRoute>
              <ProfessionalLayout>
                <TaskListPage />
              </ProfessionalLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/tasks/:id" 
          element={
            <ProtectedRoute>
              <ProfessionalLayout>
                <TaskListPage />
              </ProfessionalLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/tasks/:id/edit" 
          element={
            <ProtectedRoute>
              <ProfessionalLayout>
                <EditTaskPage />
              </ProfessionalLayout>
            </ProtectedRoute>
          } 
        />
        
        {/* Legacy lab workflow redirects */}
        <Route path="/lab-workflow/lab-test-list" element={<Navigate to="/lab-workflow/lab-tests" replace />} />
        <Route path="/lab-workflow/add-lab-test" element={<Navigate to="/lab-workflow/lab-tests/new" replace />} />
        <Route path="/lab-workflow/lab-test-details/:id" element={<Navigate to="/lab-workflow/lab-tests/:id" replace />} />
        
        {/* Home Route */}
        <Route path="/" element={<Home />} />
        
        {/* Public Pages */}
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
          
          {/* Clinical Workflow Routes with Sidebar */}
          <Route path="/clinical/dashboard" element={<ClinicalDashboard />} />
          <Route path="/admin-dashboard" element={<ClinicalDashboard />} />
          <Route path="/doctor-profile" element={<DoctorProfilePage />} />
          <Route path="/doctor-availability" element={<DoctorCalendarPage />} />
          <Route path="/doctor-appointments" element={<DoctorAppointmentsWrapper />} />

          <Route path="/pharmacist/PrescriptionDetails" element={<PrescriptionDetails />} />
          
          {/* Prescription Routes with Sidebar */}
          <Route path="/prescription/add" element={<AddPrescription />} />
          <Route path="/addPrescription" element={<AddPrescription />} />
          <Route path="/prescription/all" element={<PrescriptionsPage search={globalSearch} />} />
          <Route path="/allPrescriptions" element={<PrescriptionsPage search={globalSearch} />} />
          <Route path="/prescription/update/:id" element={<UpdatePrescription />} />
          <Route path="/prescription/delete/:id" element={<DeletePrescription />} />

          {/* Patient Routes with Sidebar */}
          <Route path="/patient/add" element={<AddPatient />} />
          <Route path="/addPatient" element={<AddPatient />} />
          <Route path="/patient/all" element={<MedicalRecordsPage search={globalSearch} />} />
          <Route path="/getPatient" element={<MedicalRecordsPage search={globalSearch} />} />
          <Route path="/patient/history/:patientId" element={<PatientHistoryPage />} />
          <Route path="/patient/update/:id" element={<UpdatePatient />} />
          <Route path="/updatePatient/:id" element={<UpdatePatient />} />
          <Route path="/patient/delete/:id" element={<DeletePatient />} />
          <Route path="/deletePatient/:id" element={<DeletePatient />} />

          {/* Pharmacy/Inventory Routes with persistent sidebar */}
          <Route path="/inventory-dashboard" element={<InventoryLayout><InventoryDashboard /></InventoryLayout>} />
          <Route path="/lab/Pdashboard" element={<InventoryLayout><InventoryDashboard /></InventoryLayout>} />
          <Route path="/activities" element={<InventoryLayout><AllActivities /></InventoryLayout>} />
          <Route path="/low-stock-items" element={<InventoryLayout><LowStockItems /></InventoryLayout>} />
          
          {/* Chemical Inventory Routes (aliases for sidebar) */}
          <Route path="/chemical-inventory" element={<InventoryLayout><ChemicalList /></InventoryLayout>} />
          <Route path="/chemical-inventory/add" element={<InventoryLayout><InsertChemical /></InventoryLayout>} />
          <Route path="/chemical-inventory/edit/:id" element={<InventoryLayout><UpdateChemical /></InventoryLayout>} />

          {/* Medicine Inventory Routes (alias for sidebar) */}
          <Route path="/medicine-inventory" element={<InventoryLayout><MedicineList /></InventoryLayout>} />

          {/* Equipment Inventory Routes (aliases for sidebar) */}
          <Route path="/equipment-inventory" element={<InventoryLayout><EquipmentList /></InventoryLayout>} />
          <Route path="/equipment-inventory/add" element={<InventoryLayout><InsertEquipment /></InventoryLayout>} />
          <Route path="/equipment-inventory/edit/:id" element={<InventoryLayout><UpdateEquipment /></InventoryLayout>} />
          
          {/* Medicine Inventory Routes */}
          <Route path="/medicine/list" element={<MedicineList />} />
          <Route path="/medicine/add" element={<InventoryLayout><InsertMedicine /></InventoryLayout>} />
          <Route path="/medicine/edit/:id" element={<InventoryLayout><UpdateMedicine /></InventoryLayout>} />
          <Route path="/medicine/delete/:id" element={<InventoryLayout><DeleteMedicine /></InventoryLayout>} />
          
          {/* Lab Inventory Routes */}
          <Route path="/lab/list" element={<LabItemList />} />
          <Route path="/lab/add" element={<InsertLabItem />} />
          <Route path="/lab/edit/:id" element={<UpdateLabItem />} />
          <Route path="/lab/delete/:id" element={<DeleteLabItem />} />
          
          {/* Order Management Routes */}
          <Route path="/orders/*" element={<InventoryLayout><OrdersPage /></InventoryLayout>} />
          <Route path="/orders/new" element={<InventoryLayout><CreateOrder /></InventoryLayout>} />
          <Route path="/orders/edit/:id" element={<InventoryLayout><UpdateOrder /></InventoryLayout>} />
          <Route path="/order-management" element={<Navigate to="/orders" replace />} />
          <Route path="/pharmacist/dashboard" element={<PharmacistDashboard />} />
          <Route path="/pharmacist/prescriptions" element={<PharmacistDashboard />} />
          <Route path="/pharmacist/dispensing" element={<PharmacistDashboard />} />
          <Route path="/pharmacist/profile" element={<PharmacistDashboard />} />

          {/* Patient Interaction Routes */}
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/completed-visits" element={<CompletedVisits />} />
          <Route path="/patient/appointments" element={<AllAppointments />} />
          <Route path="/appointments/add" element={<AddAppointments />} />
          <Route path="/appointments/update/:id" element={<UpdateAppointments />} />
          <Route path="/appointments/delete/:id" element={<DeleteAppointments />} />
          
          {/* Additional appointment routes for query parameter navigation */}
          <Route path="/update" element={<UpdateAppointments />} />
          <Route path="/delete" element={<DeleteAppointments />} />
          
          {/* Feedback Routes */}
          <Route path="/feedback" element={<MyFeedback />} />
          <Route path="/feedback/test" element={<TestFeedback />} />
          <Route path="/feedback/simple" element={<SimpleFeedback />} />
          <Route path="/feedback/update" element={<UpdateFeedback />} />
          <Route path="/feedback/delete" element={<DeleteFeedback />} />
          
          {/* Patient Profile and Details */}
          <Route path="/patient/:id" element={<PatientProfile />} />
          <Route path="/appointment/:id" element={<AppointmentDetails />} />
          <Route path="/appointment/:appointmentId/prescriptions" element={<AppointmentPrescriptions />} />
          
          {/* Dashboard Sub-routes */}
          <Route path="/dashboard/patient" element={<PatientDashboard />} />
          <Route path="/dashboard/prescriptions" element={<Prescriptions />} />
          <Route path="/dashboard/medical-records" element={<MedicalRecords />} />
          <Route path="/dashboard/lab-reports" element={<LabReports />} />
          <Route path="/dashboard/support" element={<Support />} />
          <Route path="/doctors" element={<DoctorsPage />} />

          {/* Catch all route - moved to end */}
          <Route path="*" element={<Navigate to="/" replace />} />
      
        </Routes>
        {/* NavBar moved outside Routes */}
        <NavBar search={globalSearch} onSearchChange={setGlobalSearch} />
        </AlertProvider>
      </div>
  );
}

export default App;
