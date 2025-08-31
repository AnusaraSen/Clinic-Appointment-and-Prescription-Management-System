/**
 * Response Formatting Middleware
 * Standardizes API response structure across all endpoints
 */

/**
 * Standard success response formatter
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const formatSuccessResponse = (data, message = 'Success', statusCode = 200) => {
  return (req, res, next) => {
    res.success = (responseData = data, responseMessage = message, code = statusCode) => {
      return res.status(code).json({
        success: true,
        message: responseMessage,
        data: responseData,
        timestamp: new Date().toISOString()
      });
    };
    next();
  };
};

/**
 * Standard error response formatter
 */
const formatErrorResponse = () => {
  return (req, res, next) => {
    res.error = (message = 'Internal Server Error', statusCode = 500, errors = null) => {
      const response = {
        success: false,
        message,
        data: null,
        timestamp: new Date().toISOString()
      };

      if (errors) {
        response.errors = errors;
      }

      if (process.env.NODE_ENV === 'development' && req.debugInfo) {
        response.debug = req.debugInfo;
      }

      return res.status(statusCode).json(response);
    };
    next();
  };
};

/**
 * Add pagination metadata to response
 */
const addPaginationMeta = () => {
  return (req, res, next) => {
    res.successWithPagination = (data, total, message = 'Success') => {
      const { page, limit } = req.pagination || { page: 1, limit: data.length };
      const totalPages = Math.ceil(total / limit);
      
      return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        timestamp: new Date().toISOString()
      });
    };
    next();
  };
};

/**
 * Catch async errors and pass to error handler
 * Wraps async route handlers to avoid try/catch in every function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  formatSuccessResponse,
  formatErrorResponse,
  addPaginationMeta,
  asyncHandler
};
