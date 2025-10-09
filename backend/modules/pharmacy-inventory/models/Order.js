const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: ['Medicine', 'Lab'], required: true },
    quantity: { type: Number, required: true, min: 1 },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    supplier: { type: String, required: true, trim: true },
    supplierEmail: { type: String, trim: true },
    items: { type: [orderItemSchema], default: [] },
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Delivered', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema, 'orders');
