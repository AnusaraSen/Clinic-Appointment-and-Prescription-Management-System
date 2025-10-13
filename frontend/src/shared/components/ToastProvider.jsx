import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toastService from '../services/toast';
import '../../styles/Alerts.css';

const ToastContext = createContext({});

const genId = (()=>{ let i=0; return ()=>`t_${Date.now()}_${++i}`; })();

const ICONS = {
  success: '✔',
  error: '✖',
  warning: '⚠',
  info: 'ℹ'
};

export const ToastProvider = ({ children, position = 'top-center', duration = 4000 }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const remove = useCallback((id) => {
    setToasts((t) => t.filter(x => x.id !== id));
    const timer = timers.current.get(id);
    if (timer) { clearTimeout(timer); timers.current.delete(id); }
  }, []);

  const push = useCallback(({ message, type = 'info', timeout, action }) => {
    const id = genId();
    const toast = { id, message, type, action };
    setToasts((t) => [...t, toast]);
    const ms = timeout ?? duration;
    if (ms > 0) {
      const timer = setTimeout(() => remove(id), ms);
      timers.current.set(id, timer);
    }
  }, [duration, remove]);

  useEffect(() => {
    // Register global handler for imperative use
    toastService.setHandler(push);
    return () => toastService.setHandler(null);
  }, [push]);

  const containerClass = useMemo(() => `toast-container ${position}`, [position]);

  return (
    <ToastContext.Provider value={{ push, remove }}>
      {children}
      <div className={containerClass} aria-live="polite" aria-atomic="true">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`} role="status">
            <div className="toast-icon" aria-hidden>{ICONS[t.type] || ICONS.info}</div>
            <div className="toast-content">{t.message}</div>
            {t.action && (
              <button className="toast-action" onClick={() => { t.action.onClick?.(); remove(t.id); }}>
                {t.action.label}
              </button>
            )}
            <button className="toast-close" aria-label="Dismiss" onClick={() => remove(t.id)}>×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastContext;
