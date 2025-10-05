const mongoose = require('mongoose');

/**
 * InventoryManager Schema
 * Stores basic inventory manager information linked to User
 */
const inventoryManagerSchema = new mongoose.Schema({
  inventory_manager_id: {
    type: String,
    required: [true, 'Inventory Manager ID is required'],
    uppercase: true,
    trim: true,
    match: [/^INV-\d{4}$/, 'Inventory Manager ID must match INV-#### format']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Basic Professional Information
  department: {
    type: String,
    trim: true,
    default: 'Inventory Management'
  },
  managedAreas: [{
    type: String,
    trim: true
  }],
  // Basic Contact Information
  officePhone: {
    type: String,
    trim: true
  },
  officeLocation: {
    type: String,
    trim: true
  },
  // Basic Notes
  notes: {
    type: String,
    trim: true,
    maxLength: 500
  },
  // Status Information
  joinDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  }
});

/* Indexes */
inventoryManagerSchema.index({ inventory_manager_id: 1 }, { unique: true });
inventoryManagerSchema.index({ user: 1 }, { unique: true });
inventoryManagerSchema.index({ department: 1 });
inventoryManagerSchema.index({ isActive: 1 });

/* Export model */
const InventoryManager = mongoose.model('InventoryManager', inventoryManagerSchema, 'inventory_manager');
module.exports = InventoryManager;