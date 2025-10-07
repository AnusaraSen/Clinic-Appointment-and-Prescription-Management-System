const mongoose = require("mongoose");

// ================= CHEMICAL INVENTORY =================
const chemicalSchema = new mongoose.Schema({
  chemical_id: { type: String, required: false }, // Auto-generated in controller
  itemName: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true },
  location: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  // Chemical-specific fields
  concentration: { type: String },
  phLevel: { type: String },
  hazardClass: { type: String },
  storageTemp: { type: String },
  // Inventory management
  reorderLevel: { type: Number, default: 10 },
  supplier: { type: String },
  batchNumber: { type: String },
  // Safety information
  safetyDataSheet: { type: String }, // URL or file path
  handlingInstructions: { type: String }
}, { timestamps: true });

// Create unique index on itemName to prevent duplicates
chemicalSchema.index({ itemName: 1 }, { unique: true });

const Chemical = mongoose.model("Chemical", chemicalSchema, "chemicals");

module.exports = Chemical;
