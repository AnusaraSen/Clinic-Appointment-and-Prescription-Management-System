// models/labInventoryModel.js
const mongoose = require("mongoose");

// ================= LAB INVENTORY =================
const labInventorySchema = new mongoose.Schema({
  lab_item_id: { type: String, required: false }, // Auto-generated in controller
  itemName: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true },
  location: { type: String },
  expiryDate: { type: Date }
}, { timestamps: true });

const LabInventory = mongoose.model("LabInventory", labInventorySchema, "lab_inventory");

module.exports = LabInventory;
