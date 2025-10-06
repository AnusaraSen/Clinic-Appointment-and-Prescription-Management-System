const mongoose = require("mongoose");

// ================= EQUIPMENT INVENTORY =================
const equipmentSchema = new mongoose.Schema({
  equipment_id: { type: String, required: false }, // Auto-generated in controller
  itemName: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true },
  location: { type: String, required: true },
  // Equipment-specific fields
  modelNumber: { type: String },
  manufacturer: { type: String },
  calibrationDate: { type: Date },
  maintenanceSchedule: { type: String },
  serialNumber: { type: String },
  purchaseDate: { type: Date },
  warrantyExpiry: { type: Date },
  // Inventory management
  reorderLevel: { type: Number, default: 5 }, // Usually lower for equipment
  supplier: { type: String },
  condition: { 
    type: String, 
    enum: ['Excellent', 'Good', 'Fair', 'Needs Repair', 'Out of Service'],
    default: 'Good'
  },
  // Maintenance tracking
  lastMaintenanceDate: { type: Date },
  nextMaintenanceDate: { type: Date },
  maintenanceNotes: { type: String },
  // Documentation
  userManual: { type: String }, // URL or file path
  technicalSpecs: { type: String }
}, { timestamps: true });

// Create unique index on itemName to prevent duplicates
equipmentSchema.index({ itemName: 1 }, { unique: true });

// Use a unique model name to avoid collisions with workforce-facility's 'Equipment' model
const InventoryEquipment = mongoose.models?.InventoryEquipment 
  || mongoose.model("InventoryEquipment", equipmentSchema, "equipment");

module.exports = InventoryEquipment;
