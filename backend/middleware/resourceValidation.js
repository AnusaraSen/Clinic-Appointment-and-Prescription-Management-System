/**
 * Resource Existence Middleware
 * Checks if referenced resources exist before processing requests
 */

const User = require('../modules/workforce-facility/models/User');
const Technician = require('../modules/workforce-facility/models/Technician');
const Equipment = require('../modules/workforce-facility/models/equipments');
const MaintenanceRequest = require('../modules/workforce-facility/models/MaintenanceRequests');

/**
 * Check if a user exists by ID
 * @param {string} paramName - Request parameter containing user ID (default: 'reportedBy' from body)
 * @param {string} source - Where to find the ID ('params', 'body', 'query')
 */
const checkUserExists = (paramName = 'reportedBy', source = 'body') => {
  return async (req, res, next) => {
    const userId = req[source][paramName];
    
    if (!userId) {
      return next(); // Skip if ID not provided (let validation handle it)
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: `User not found`,
          data: null
        });
      }
      
      req.foundUser = user;
      next();
    } catch (error) {
      req.debugInfo = error.message;
      return res.status(500).json({
        success: false,
        message: 'Error checking user existence',
        data: null
      });
    }
  };
};

/**
 * Check if a technician exists and can accept new requests
 * @param {string} paramName - Request parameter containing technician ID
 * @param {string} source - Where to find the ID ('params', 'body', 'query')
 * @param {boolean} checkAvailability - Whether to check if technician can accept new requests
 */
const checkTechnicianExists = (paramName = 'technicianId', source = 'body', checkAvailability = true) => {
  return async (req, res, next) => {
    const technicianId = req[source][paramName];
    
    if (!technicianId) {
      return next();
    }

    try {
      const technician = await Technician.findById(technicianId);
      if (!technician) {
        return res.status(404).json({
          success: false,
          message: 'Technician not found',
          data: null
        });
      }

      if (checkAvailability) {
        const canAccept = technician.canAcceptNewRequest();
        if (!canAccept) {
          return res.status(400).json({
            success: false,
            message: 'Technician is not available or at capacity',
            data: null
          });
        }
      }
      
      req.foundTechnician = technician;
      next();
    } catch (error) {
      req.debugInfo = error.message;
      return res.status(500).json({
        success: false,
        message: 'Error checking technician availability',
        data: null
      });
    }
  };
};

/**
 * Check if equipment items exist
 * @param {string} paramName - Request parameter containing equipment ID array
 * @param {string} source - Where to find the IDs ('body', 'query')
 */
const checkEquipmentExists = (paramName = 'equipment', source = 'body') => {
  return async (req, res, next) => {
    const equipmentIds = req[source][paramName];
    
    if (!equipmentIds || !Array.isArray(equipmentIds) || equipmentIds.length === 0) {
      return next();
    }

    try {
      const equipment = await Equipment.find({ _id: { $in: equipmentIds } });
      
      if (equipment.length !== equipmentIds.length) {
        const foundIds = equipment.map(eq => eq._id.toString());
        const missingIds = equipmentIds.filter(id => !foundIds.includes(id));
        
        return res.status(404).json({
          success: false,
          message: `Equipment not found: ${missingIds.join(', ')}`,
          data: null
        });
      }
      
      req.foundEquipment = equipment;
      next();
    } catch (error) {
      req.debugInfo = error.message;
      return res.status(500).json({
        success: false,
        message: 'Error checking equipment existence',
        data: null
      });
    }
  };
};

/**
 * Check if maintenance request exists
 * @param {string} paramName - Request parameter containing maintenance request ID
 * @param {string} source - Where to find the ID ('params', 'body')
 */
const checkMaintenanceRequestExists = (paramName = 'id', source = 'params') => {
  return async (req, res, next) => {
    const requestId = req[source][paramName];
    
    if (!requestId) {
      return next();
    }

    try {
      const maintenanceRequest = await MaintenanceRequest.findById(requestId);
      if (!maintenanceRequest) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance request not found',
          data: null
        });
      }
      
      req.foundMaintenanceRequest = maintenanceRequest;
      next();
    } catch (error) {
      req.debugInfo = error.message;
      return res.status(500).json({
        success: false,
        message: 'Error checking maintenance request existence',
        data: null
      });
    }
  };
};

module.exports = {
  checkUserExists,
  checkTechnicianExists,
  checkEquipmentExists,
  checkMaintenanceRequestExists
};
