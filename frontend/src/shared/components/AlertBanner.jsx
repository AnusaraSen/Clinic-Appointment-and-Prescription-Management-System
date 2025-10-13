import React from 'react';
import '../styles/Alerts.css';

const icons = { success: '✔', error: '✖', warning: '⚠', info: 'ℹ' };

export default function AlertBanner({ type='info', title, message, children, style, className }){
  return (
    <div className={`alert-banner ${type} ${className||''}`} style={style} role="alert">
      <div className="icon" aria-hidden>{icons[type] || icons.info}</div>
      <div>
        {title && <div className="title">{title}</div>}
        {message && <div className="message">{message}</div>}
        {children}
      </div>
    </div>
  );
}
