const mongoose = require('mongoose');
const User = require('../modules/workforce-facility/models/User');
const Counter = require('../models/Counter');
const Patient = require('../modules/workforce-facility/models/Patient');
const Doctor = require('../modules/workforce-facility/models/Doctor');
const Pharmacist = require('../modules/workforce-facility/models/Pharmacist');
const Administrator = require('../modules/workforce-facility/models/Administrator');
const InventoryManager = require('../modules/workforce-facility/models/InventoryManager');
const LabSupervisor = require('../modules/workforce-facility/models/LabSupervisor');
const LabStaff = require('../modules/workforce-facility/models/LabStaff');
const Technician = require('../modules/workforce-facility/models/Technician');

/**
 * UserCreationService - Handles cascade creation of users across multiple collections
 * 
 * This service ensures that when a user is created, corresponding entries are also
 * created in the appropriate role-specific collections with proper linking.
 */
class UserCreationService {
  
  /**
   * Role to model and collection mapping
   */
  static roleMapping = {
    'Patient': {
      model: Patient,
      collection: 'patients',
      idPrefix: 'PAT',
      idPattern: /^PAT-\d{4}$/
    },
    'Doctor': {
      model: Doctor,
      collection: 'doctors',
      idPrefix: 'DOC',
      idPattern: /^DOC-\d{4}$/
    },
    'Pharmacist': {
      model: Pharmacist,
      collection: 'pharmacists',
      idPrefix: 'PHA',
      idPattern: /^PHA-\d{4}$/
    },
    'Admin': {
      model: Administrator,
      collection: 'administrators',
      idPrefix: 'ADM',
      idPattern: /^ADM-\d{4}$/
    },
    'InventoryManager': {
      model: InventoryManager,
      collection: 'inventory_managers',
      idPrefix: 'INV',
      idPattern: /^INV-\d{4}$/
    },
    'LabSupervisor': {
      model: LabSupervisor,
      collection: 'lab_supervisors',
      idPrefix: 'LSUP',
      idPattern: /^LSUP-\d{4}$/
    },
    'LabStaff': {
      model: LabStaff,
      collection: 'lab_staff',
      idPrefix: 'LAB',
      idPattern: /^LAB-\d{4}$/
    },
    'Technician': {
      model: Technician,
      collection: 'technicians',
      idPrefix: 'T',
      idPattern: /^T\d{3}$/
    }
  };

  /**
   * Generate a unique role-specific ID
   * @param {string} role - User role
   * @param {Object} session - MongoDB session for transaction
   * @returns {Promise<string>} Generated unique ID
   */
  static async generateRoleSpecificId(role, session = null) {
    const mapping = this.roleMapping[role];
    if (!mapping) {
      throw new Error(`No mapping found for role: ${role}`);
    }

    const { model, idPrefix, idPattern } = mapping;
    
    // Find existing IDs to determine the next available number
    const existingDocs = await model.find(
      { [this.getRoleIdField(role)]: { $regex: idPattern } },
      { [this.getRoleIdField(role)]: 1 }
    ).session(session);

    // Extract numbers and find the maximum
    let maxNumber = 0;
    existingDocs.forEach(doc => {
      const idField = this.getRoleIdField(role);
      const id = doc[idField];
      
      if (role === 'Technician') {
        // Technician IDs are T### format
        const match = id.match(/^T(\d{3})$/);
        if (match) {
          maxNumber = Math.max(maxNumber, parseInt(match[1]));
        }
      } else {
        // Other roles are PREFIX-#### format
        const match = id.match(/^[A-Z]{2,4}-(\d{4})$/);
        if (match) {
          maxNumber = Math.max(maxNumber, parseInt(match[1]));
        }
      }
    });

    // Generate next ID
    const nextNumber = maxNumber + 1;
    
    if (role === 'Technician') {
      return `${idPrefix}${String(nextNumber).padStart(3, '0')}`;
    } else {
      return `${idPrefix}-${String(nextNumber).padStart(4, '0')}`;
    }
  }

  /**
   * Get the role-specific ID field name
   * @param {string} role - User role
   * @returns {string} Field name for the role-specific ID
   */
  static getRoleIdField(role) {
    const fieldMap = {
      'Patient': 'patient_id',
      'Doctor': 'doctor_id',
      'Pharmacist': 'pharmacist_id',
      'Admin': 'administrator_id',
      'InventoryManager': 'inventory_manager_id',
      'LabSupervisor': 'supervisor_id',
      'LabStaff': 'lab_staff_id',
      'Technician': 'technician_id'
    };
    
    return fieldMap[role];
  }

  /**
   * Create default role-specific data based on user information
   * @param {Object} user - User document
   * @param {string} roleSpecificId - Generated role-specific ID
   * @returns {Object} Default data for the role-specific model
   */
  static createDefaultRoleData(user, roleSpecificId) {
    const role = user.role;
    const baseData = {
      [this.getRoleIdField(role)]: roleSpecificId,
      user: user._id,
      isActive: true,
      joinDate: new Date()
    };

    // Add role-specific defaults
    switch (role) {
      case 'Patient':
        return {
          ...baseData,
          registrationDate: new Date()
        };
        
      case 'Doctor':
        return {
          ...baseData,
          specialty: 'General Medicine',
          experience: 0,
          isAcceptingNewPatients: true,
          department: user.department || 'General Medicine'
        };
        
      case 'Pharmacist':
        return {
          ...baseData,
          experience: 0,
          department: user.department || 'Pharmacy',
          shift: 'morning',
          availabilityStatus: 'available'
        };
        
      case 'Admin':
        return {
          ...baseData,
          position: 'System Administrator',
          experience: 0,
          department: 'Information Technology',
          availabilityStatus: 'available'
        };
        
      case 'InventoryManager':
        return {
          ...baseData,
          experience: 0,
          department: 'Inventory Management',
          shift: 'morning',
          availabilityStatus: 'available'
        };
        
      case 'LabSupervisor':
        return {
          ...baseData,
          department: 'Laboratory',
          managedSections: ['General Lab', 'Testing'],
          notes: 'Lab supervisor responsible for overseeing laboratory operations'
        };
        
      case 'LabStaff':
        return {
          ...baseData,
          position: 'Lab Technician',
          department: 'Laboratory',
          shift: 'morning',
          notes: 'Lab staff member responsible for laboratory operations'
        };
        
      case 'Technician':
        return {
          ...baseData,
          firstName: user.name ? user.name.split(' ')[0] : '',
          lastName: user.name ? user.name.split(' ').slice(1).join(' ') : '',
          name: user.name,
          email: user.email,
          phone: user.phone,
          department: 'Maintenance',
          availabilityStatus: 'available',
          availability: true
        };
        
      default:
        return baseData;
    }
  }

  /**
   * Create a user with cascade creation to role-specific collection
   * @param {Object} userData - User data for creation
   * @returns {Promise<Object>} Result object with user and role-specific data
   */
  static async createUserWithRole(userData) {
    const session = await mongoose.startSession();
    
    try {
      const result = await session.withTransaction(async () => {
        // Step 1: Atomically increment user_id sequence using counters collection
        const counter = await Counter.findOneAndUpdate(
          { _id: 'user_id' },
          { $inc: { seq: 1 } },
          { new: true, upsert: true, session, setDefaultsOnInsert: true }
        );
        const userId = `USR-${String(counter.seq).padStart(4, '0')}`;
        
        // Defensive re-check (should never happen due to uniqueness + atomic counter)
        const existingSameId = await User.findOne({ user_id: userId }).session(session);
        if (existingSameId) {
          // Rare fallback: increment again
            const counter2 = await Counter.findOneAndUpdate(
              { _id: 'user_id' },
              { $inc: { seq: 1 } },
              { new: true, session }
            );
            console.warn('⚠️ Counter collision detected for', userId, 'advanced to', counter2.seq);
            // eslint-disable-next-line require-atomic-updates
            userId = `USR-${String(counter2.seq).padStart(4, '0')}`; // reassign for clarity
        }
        
        // Step 2: Create the main user
        const user = new User({
          ...userData,
          user_id: userId
        });
        await user.save({ session });

        console.log('✅ User created:', user.user_id, '| Role:', user.role);

        // Step 3: Check if role requires additional collection entry
        const roleMapping = this.roleMapping[user.role];
        if (!roleMapping) {
          console.log('ℹ️ No role-specific collection for role:', user.role);
          return {
            success: true,
            user: user,
            roleData: null,
            message: 'User created successfully'
          };
        }

        // Step 4: Generate role-specific ID
        const roleSpecificId = await this.generateRoleSpecificId(user.role, session);
        console.log('🔖 Generated role-specific ID:', roleSpecificId);

        // Step 5: Create role-specific data
        const roleData = this.createDefaultRoleData(user, roleSpecificId);
        const RoleModel = roleMapping.model;
        const roleDocument = new RoleModel(roleData);
        await roleDocument.save({ session });

        console.log('✅ Role-specific entry created in:', roleMapping.collection);

        return {
          success: true,
          user: user,
          roleData: roleDocument,
          message: `User and ${user.role.toLowerCase()} profile created successfully`
        };
      });

      return result;

    } catch (error) {
      console.error('❌ Error in cascade user creation:', error);
      throw new Error(`Failed to create user with role: ${error.message}`);
    } finally {
      await session.endSession();
    }
  }

  /**
   * Update a user and sync changes to role-specific collection
   * @param {string} userId - User ID to update
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Result object
   */
  static async updateUserWithRole(userId, updateData) {
    const session = await mongoose.startSession();
    
    try {
      const result = await session.withTransaction(async () => {
        // Step 1: Update the main user
        const user = await User.findByIdAndUpdate(
          userId, 
          updateData, 
          { new: true, session }
        );

        if (!user) {
          throw new Error('User not found');
        }

        // Step 2: Update role-specific collection if it exists
        const roleMapping = this.roleMapping[user.role];
        if (roleMapping) {
          const RoleModel = roleMapping.model;
          const roleDocument = await RoleModel.findOneAndUpdate(
            { user: userId },
            { 
              name: user.name,
              email: user.email,
              phone: user.phone
            },
            { new: true, session }
          );

          console.log('✅ Role-specific data updated for:', user.role);
          return {
            success: true,
            user: user,
            roleData: roleDocument,
            message: 'User and role data updated successfully'
          };
        }

        return {
          success: true,
          user: user,
          roleData: null,
          message: 'User updated successfully'
        };
      });

      return result;

    } catch (error) {
      console.error('❌ Error in cascade user update:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    } finally {
      await session.endSession();
    }
  }

  /**
   * Delete a user and cascade delete from role-specific collection
   * @param {string} userId - User ID to delete
   * @returns {Promise<Object>} Result object
   */
  static async deleteUserWithRole(userId) {
    const session = await mongoose.startSession();
    
    try {
      const result = await session.withTransaction(async () => {
        // Step 1: Find the user first to get the role
        const user = await User.findById(userId).session(session);
        if (!user) {
          throw new Error('User not found');
        }

        // Step 2: Delete from role-specific collection if it exists
        const roleMapping = this.roleMapping[user.role];
        if (roleMapping) {
          const RoleModel = roleMapping.model;
          await RoleModel.findOneAndDelete({ user: userId }).session(session);
          console.log('✅ Role-specific data deleted for:', user.role);
        }

        // Step 3: Delete the main user
        await User.findByIdAndDelete(userId).session(session);
        console.log('✅ User deleted:', user.user_id);

        return {
          success: true,
          message: 'User and role data deleted successfully'
        };
      });

      return result;

    } catch (error) {
      console.error('❌ Error in cascade user deletion:', error);
      throw new Error(`Failed to delete user: ${error.message}`);
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get user with populated role-specific data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User with role data
   */
  static async getUserWithRoleData(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const roleMapping = this.roleMapping[user.role];
      if (!roleMapping) {
        return {
          success: true,
          user: user,
          roleData: null
        };
      }

      const RoleModel = roleMapping.model;
      const roleData = await RoleModel.findOne({ user: userId });

      return {
        success: true,
        user: user,
        roleData: roleData
      };

    } catch (error) {
      console.error('❌ Error fetching user with role data:', error);
      throw new Error(`Failed to fetch user data: ${error.message}`);
    }
  }

  /**
   * Get all supported roles
   * @returns {Array<string>} Array of supported roles
   */
  static getSupportedRoles() {
    return Object.keys(this.roleMapping);
  }

  /**
   * Check if a role has cascade creation support
   * @param {string} role - Role to check
   * @returns {boolean} True if role has cascade support
   */
  static hasRoleSupport(role) {
    return this.roleMapping.hasOwnProperty(role);
  }
}

module.exports = UserCreationService;