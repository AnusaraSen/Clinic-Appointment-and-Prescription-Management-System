const mongoose = require('mongoose');

// ================= SUPPLIER =================
const supplierSchema = new mongoose.Schema({
  supplier_id: { type: String, required: true, unique: true },
  supplierName: { type: String, required: true },
  contactNumber: String,
  email: String,
  address: String,
  status: { type: String, default: "Active" }
  
});

const Supplier = mongoose.model("Supplier", supplierSchema, "supplier");

module.exports = Supplier;