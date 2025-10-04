const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  itemName: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
  category: { type: String, enum: ["Medicine", "Lab"], required: true }, // type renamed for clarity
  status: { type: String, default: "Available" }, // centralized status here
  expiryDate: { type: Date },
  location: { type: String }
}, { timestamps: true });

const Inventory = mongoose.model("Inventory", inventorySchema);

module.exports = Inventory;