/**
 * Query Processing Middleware
 * Handles common query parameter parsing, filtering, pagination, and sorting
 */

/**
 * Parse and sanitize query parameters for filtering
 * @param {Array} allowedFilters - Array of allowed filter field names
 */
const parseFilters = (allowedFilters = []) => {
  return (req, res, next) => {
    const filters = {};
    
    // Only include allowed filter fields
    allowedFilters.forEach(field => {
      if (req.query[field] !== undefined) {
        filters[field] = req.query[field];
      }
    });

    req.filters = filters;
    next();
  };
};

/**
 * Parse pagination parameters
 * @param {number} defaultLimit - Default page size
 * @param {number} maxLimit - Maximum allowed page size
 */
const parsePagination = (defaultLimit = 20, maxLimit = 100) => {
  return (req, res, next) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit) || defaultLimit));
    const skip = (page - 1) * limit;

    req.pagination = { page, limit, skip };
    next();
  };
};

/**
 * Parse sorting parameters
 * @param {Object} allowedSorts - Object mapping sort keys to MongoDB field names
 * @param {string} defaultSort - Default sort field
 */
const parseSort = (allowedSorts = {}, defaultSort = '-createdAt') => {
  return (req, res, next) => {
    let sortField = req.query.sort || defaultSort;
    
    // Handle ascending/descending prefixes
    const isDescending = sortField.startsWith('-');
    const fieldName = isDescending ? sortField.slice(1) : sortField;
    
    // Map to allowed field or use default
    const mappedField = allowedSorts[fieldName] || allowedSorts[defaultSort.replace('-', '')] || 'createdAt';
    
    req.sort = isDescending ? `-${mappedField}` : mappedField;
    next();
  };
};

/**
 * Standard populate configuration for maintenance requests
 */
const populateMaintenanceRequest = (req, res, next) => {
  req.populateConfig = [
    { path: 'reportedBy', select: 'name email role' },
    { path: 'assignedTo', select: 'name specialization phone availability' },
    { path: 'equipment', select: 'name location type status' }
  ];
  next();
};

/**
 * Apply filters, pagination, and sorting to a Mongoose query
 */
const applyQueryOptions = (query, req) => {
  // Apply filters
  if (req.filters) {
    query = query.find(req.filters);
  }

  // Apply population
  if (req.populateConfig) {
    req.populateConfig.forEach(config => {
      query = query.populate(config);
    });
  }

  // Apply sorting
  if (req.sort) {
    query = query.sort(req.sort);
  }

  // Apply pagination
  if (req.pagination) {
    query = query.skip(req.pagination.skip).limit(req.pagination.limit);
  }

  return query;
};

module.exports = {
  parseFilters,
  parsePagination,
  parseSort,
  populateMaintenanceRequest,
  applyQueryOptions
};
