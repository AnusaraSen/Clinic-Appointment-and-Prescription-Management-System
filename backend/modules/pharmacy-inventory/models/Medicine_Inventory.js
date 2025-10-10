const mongoose = require('mongoose');


const medicineSchema = new mongoose.Schema({
  medicine_id: { type: String, required: true, unique: true },
  inventory: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory" },
  medicineName: { type: String, required: true, trim: true },
  batchNumber: { type: String },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0, default: 0 },
  strength: { type: String },
  genericName: { type: String },
  expiryDate: { type: Date },
  manufactureDate: { type: Date },
  dosageForm: { type: String },
  reorderLevel: { type: Number, required: false, default: 5 }, // Default reorder level
}, { timestamps: true, strict: false });

const Medicine = mongoose.model("Medicine", medicineSchema, "medicine_inventory");

module.exports = Medicine;