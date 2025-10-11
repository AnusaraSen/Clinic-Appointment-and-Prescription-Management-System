// Test file to verify controller exports
const controller = require('./modules/workforce-facility/controllers/TechnicianWorkOrderController');

console.log('=== Controller Exports Test ===');
console.log('Available methods:', Object.keys(controller));
console.log('');
console.log('getMyWorkOrders:', typeof controller.getMyWorkOrders, controller.getMyWorkOrders ? '✓' : '✗');
console.log('startWorkOrder:', typeof controller.startWorkOrder, controller.startWorkOrder ? '✓' : '✗');
console.log('completeWorkOrder:', typeof controller.completeWorkOrder, controller.completeWorkOrder ? '✓' : '✗');
console.log('getDashboardStats:', typeof controller.getDashboardStats, controller.getDashboardStats ? '✓' : '✗');

// Test if they're actually functions
if (typeof controller.getMyWorkOrders === 'function') {
  console.log('\n✅ All exports are valid functions!');
} else {
  console.log('\n❌ Exports are NOT functions!');
}
