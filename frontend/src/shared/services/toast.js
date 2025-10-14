// Simple global toast service used by ToastProvider
// Usage: import toast from '@/shared/services/toast'; toast.success('Saved!');

let handler = null;

const setHandler = (fn) => { handler = fn; };

const show = (message, options = {}) => {
  if (handler) handler({ message, ...options });
  else console.warn('Toast handler not registered yet:', message, options);
};

const api = {
  setHandler,
  show,
  success: (message, opts={}) => show(message, { ...opts, type: 'success' }),
  error:   (message, opts={}) => show(message, { ...opts, type: 'error' }),
  warning: (message, opts={}) => show(message, { ...opts, type: 'warning' }),
  info:    (message, opts={}) => show(message, { ...opts, type: 'info' }),
  // Semantic helpers
  create:  (message='Created successfully', opts={}) => show(message, { ...opts, type: 'success' }),
  update:  (message='Updated successfully', opts={}) => show(message, { ...opts, type: 'info' }),
  deleted: (message='Deleted successfully', opts={}) => show(message, { ...opts, type: 'error' }),
};

export default api;
