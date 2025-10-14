import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './features/authentication/context/AuthContext'
import { ToastProvider } from './shared/components/ToastProvider.jsx'
import './styles/Alerts.css'
// Removed ErrorBoundary per requirement
import './index.css'
import App from './App.jsx'

// Optional: route default window.alert through themed toast
import toast from './shared/services/toast';
// Route native alerts to themed toast
window.alert = (msg) => toast.info(String(msg));
// Optional: expose toast for quick debugging from console
window.toast = toast;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
