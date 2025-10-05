const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: 0,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    manufacturer: {
      type: String,
      required: [true, 'Manufacturer name is required'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medicine', medicineSchema);
