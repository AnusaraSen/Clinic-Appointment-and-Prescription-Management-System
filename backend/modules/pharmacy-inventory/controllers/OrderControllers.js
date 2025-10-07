const Order = require('../models/Order');
const Medicine = require('../models/Medicine_Inventory');
const Chemical = require('../models/Chemical');
const Equipment = require('../models/Equipment');

// Helper to generate an order number like ORD-YYYYMM-###
const generateOrderNumber = async () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `ORD-${y}${m}-`;

  // Count existing orders this month to increment
  const monthStart = new Date(y, now.getMonth(), 1);
  const monthEnd = new Date(y, now.getMonth() + 1, 1);
  const count = await Order.countDocuments({ createdAt: { $gte: monthStart, $lt: monthEnd } });
  return `${prefix}${String(count + 1).padStart(3, '0')}`;
};

// GET /api/orders
const listOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/:id
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/orders
const createOrder = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.orderNumber) {
      payload.orderNumber = await generateOrderNumber();
    }
    const order = await Order.create(payload);
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/orders/:id
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/orders/:id
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/low-stock
// Suggest low-stock and expired items from medicine, chemicals, and equipment
const lowStock = async (req, res) => {
  try {
    const thresholdDefault = Number(req.query.threshold || 50);
    const medicines = await Medicine.find().select('medicineName quantity strength reorderLevel expiryDate').lean();
    const chemicals = await Chemical.find().select('itemName quantity reorderLevel expiryDate').lean();
    const equipment = await Equipment.find().select('itemName quantity reorderLevel').lean();

    const low = [];
    const now = new Date();
    medicines.forEach((m) => {
      const threshold = Number(m.reorderLevel ?? thresholdDefault);
      const isLow = (m.quantity || 0) < threshold;
      const isExpired = m.expiryDate ? new Date(m.expiryDate) < now : false;
      if (isLow || isExpired) {
        low.push({
          name: m.medicineName + (m.strength ? ` ${m.strength}` : ''),
          category: 'Medicine',
          quantity: m.quantity || 0,
          threshold,
          reason: isExpired ? 'Expired' : 'Low Stock',
        });
      }
    });
    chemicals.forEach((c) => {
      const threshold = Number(c.reorderLevel ?? thresholdDefault);
      const isLow = (c.quantity || 0) < threshold;
      const isExpired = c.expiryDate ? new Date(c.expiryDate) < now : false;
      if (isLow || isExpired) {
        low.push({ name: c.itemName, category: 'Chemical', quantity: c.quantity || 0, threshold, reason: isExpired ? 'Expired' : 'Low Stock' });
      }
    });
    equipment.forEach((e) => {
      const threshold = Number(e.reorderLevel ?? thresholdDefault);
      const isLow = (e.quantity || 0) < threshold;
      if (isLow) {
        low.push({ name: e.itemName, category: 'Equipment', quantity: e.quantity || 0, threshold, reason: 'Low Stock' });
      }
    });

    res.json({ success: true, data: low });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  listOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  lowStock,
};
