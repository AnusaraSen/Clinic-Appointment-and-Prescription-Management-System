import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './components/layout/DashboardLayout.jsx'
import MaintenancePage from './pages/workforce-facility/MaintenancePage.jsx'
import AppointmentsPage from './pages/patient-interaction/AppointmentsPage.jsx'
import PrescriptionsPage from './pages/pharmacy-inventory/PrescriptionsPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}> 
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<div className="p-6">Welcome to Admin Dashboard</div>} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/prescriptions" element={<PrescriptionsPage />} />
          <Route path="/users" element={<div className="p-6">Users</div>} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/reports" element={<div className="p-6">Reports</div>} />
          <Route path="/settings" element={<div className="p-6">Settings</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App