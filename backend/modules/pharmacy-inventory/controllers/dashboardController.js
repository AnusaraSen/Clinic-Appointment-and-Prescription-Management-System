const Medicine = require('../models/Medicine_Inventory');
const Chemical = require('../models/Chemical');
const Equipment = require('../models/Equipment');
const Order = require('../models/Order');

// GET /api/pharmacy-dashboard/summary
// Returns realistic, aggregated stats for the inventory dashboard
exports.getPharmacyDashboardSummary = async (req, res) => {
  try {
    const now = new Date();

    // Fetch in parallel
    const [medicines, chemicals, equipment, orders] = await Promise.all([
      Medicine.find().lean(),
      Chemical.find().lean(),
      Equipment.find().lean(),
      Order.find({ date: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) } }).lean(),
    ]);

    // Helpers
    const isExpired = (d) => d && new Date(d) < now;
    const toNumber = (v) => (typeof v === 'number' ? v : Number(v || 0));

    // Medicines KPIs
    const medTotal = medicines.length;
    const medExpired = medicines.filter((m) => isExpired(m.expiryDate)).length;
    const medLowStock = medicines.filter((m) => toNumber(m.quantity) <= toNumber(m.reorderLevel || m.threshold || 0)).length;
    const medOutOfStock = medicines.filter((m) => toNumber(m.quantity) === 0).length;

    // Chemicals KPIs
    const chemTotal = chemicals.length;
    const chemExpired = chemicals.filter((c) => isExpired(c.expiryDate)).length;
    const chemLowStock = chemicals.filter((c) => toNumber(c.quantity) <= toNumber(c.reorderLevel || 0)).length;

    // Equipment KPIs
    const eqTotal = equipment.length;
    const eqLowStock = equipment.filter((e) => toNumber(e.quantity) <= toNumber(e.reorderLevel || 0)).length;
    const eqNeedsMaintenance = equipment.filter((e) => e.nextMaintenanceDate && new Date(e.nextMaintenanceDate) <= now).length;
    const eqOutOfService = equipment.filter((e) => ["Out of Service", "Needs Repair"].includes(e.condition)).length;

    // Ordering stats (current month)
    const ordersCount = orders.length;
    const ordersPending = orders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length;

    // Low/Expired items breakdown for realistic widgets
    const lowExpiredItems = [
      ...medicines
        .filter((m) => isExpired(m.expiryDate) || toNumber(m.quantity) <= toNumber(m.reorderLevel || m.threshold || 0))
        .map((m) => ({ name: m.medicineName || m.name || m.genericName || 'Medicine', category: 'Medicine', quantity: toNumber(m.quantity), threshold: toNumber(m.reorderLevel || m.threshold || 0), reason: isExpired(m.expiryDate) ? 'Expired' : 'Low Stock' })),
      ...chemicals
        .filter((c) => isExpired(c.expiryDate) || toNumber(c.quantity) <= toNumber(c.reorderLevel || 0))
        .map((c) => ({ name: c.chemicalName || c.name || 'Chemical', category: 'Lab', quantity: toNumber(c.quantity), threshold: toNumber(c.reorderLevel || 0), reason: isExpired(c.expiryDate) ? 'Expired' : 'Low Stock' })),
      ...equipment
        .filter((e) => toNumber(e.quantity) <= toNumber(e.reorderLevel || 0))
        .map((e) => ({ name: e.itemName || e.name || 'Equipment', category: 'Lab', quantity: toNumber(e.quantity), threshold: toNumber(e.reorderLevel || 0), reason: 'Low Stock' })),
    ];

    res.json({
      success: true,
      data: {
        kpis: {
          medicines: { total: medTotal, expired: medExpired, lowStock: medLowStock, outOfStock: medOutOfStock },
          chemicals: { total: chemTotal, expired: chemExpired, lowStock: chemLowStock },
          equipment: { total: eqTotal, lowStock: eqLowStock, needsMaintenance: eqNeedsMaintenance, outOfService: eqOutOfService },
          orders: { monthCount: ordersCount, pending: ordersPending },
        },
        lowExpiredItems,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
