/**
 * Safe Render Utility
 * Prevents React object rendering errors by safely converting objects to strings
 */

/**
 * Safely renders any value in React
 * @param {any} value - The value to render
 * @param {string} fallback - Fallback text if value is null/undefined
 * @returns {string} Safe string representation
 */
export const safeRender = (value, fallback = '') => {
  if (value === null || value === undefined) {
    return fallback;
  }
  
  if (typeof value === 'object') {
    // For objects, return a safe string representation
    if (Array.isArray(value)) {
      return value.map(item => safeRender(item)).join(', ');
    }
    
    // For regular objects, extract meaningful properties or stringify
    if (value.name) return value.name;
    if (value.title) return value.title;
    if (value.id) return value.id;
    
    // Last resort: stringify
    try {
      return JSON.stringify(value);
    } catch (e) {
      return '[Object]';
    }
  }
  
  return String(value);
};

/**
 * Safe Render Component
 * Use this component to safely render any value that might be an object
 */
export const SafeRender = ({ value, fallback = '', ...props }) => {
  return <span {...props}>{safeRender(value, fallback)}</span>;
};

/**
 * Safe technician name renderer
 */
export const safeTechnicianName = (technician) => {
  if (!technician) return 'Unassigned';
  if (typeof technician === 'string') return technician;
  if (typeof technician === 'object') {
    return technician.fullName || technician.name || `${technician.firstName || ''} ${technician.lastName || ''}`.trim() || 'Unknown Technician';
  }
  return String(technician);
};

/**
 * Safe technician status renderer
 */
export const safeTechnicianStatus = (technician) => {
  if (!technician) return 'N/A';
  if (typeof technician === 'object') {
    if (technician.isCurrentlyEmployed === false) return 'Not Employed';
    if (technician.availability === false) return 'Unavailable';
    return 'Available';
  }
  return String(technician);
};