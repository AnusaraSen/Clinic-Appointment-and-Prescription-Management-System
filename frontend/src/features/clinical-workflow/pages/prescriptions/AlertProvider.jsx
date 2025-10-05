import React, { createContext, useContext, useState, useCallback } from 'react';
import '../../../../styles/clinical-workflow/ThemedAlerts.css';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const removeAlert = useCallback((id) => {
    setAlerts(a => a.filter(al => al.id !== id));
  }, []);

  const pushAlert = useCallback((message, type = 'info', ttl = 4000) => {
    const id = Date.now() + Math.random();
    setAlerts(a => [...a, { id, message, type }]);
    if (ttl > 0) {
      setTimeout(() => removeAlert(id), ttl);
    }
  }, [removeAlert]);

  const value = { pushAlert, removeAlert };

  return (
    <AlertContext.Provider value={value}>
      {children}
      <div className="themed-alert-viewport" role="region" aria-live="assertive">
        {alerts.map(a => (
          <div key={a.id} className={`themed-alert themed-alert-${a.type}`} onClick={() => removeAlert(a.id)}>
            <span className="themed-alert-msg">{a.message}</span>
            <button type="button" className="themed-alert-close" aria-label="Dismiss" onClick={(e)=>{ e.stopPropagation(); removeAlert(a.id);}}>&times;</button>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert must be used within AlertProvider');
  return ctx;
}
