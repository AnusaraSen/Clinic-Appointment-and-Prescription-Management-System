const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data for pharmacist dashboard
const mockDashboardData = {
  statistics: {
    totalPrescriptions: 156,
    newPrescriptions: 12,
    pendingPrescriptions: 8,
    dispensedToday: 45
  },
  recentPrescriptions: [
    {
      id: 'P-001',
      patientName: 'John Smith',
      prescriptionId: 'RX-2024-001',
      doctorName: 'Dr. Brown',
      status: 'Pending',
      dateIssued: new Date().toISOString()
    }
  ],
  lowStockMedicines: [
    {
      name: 'Amlodipine 500mg',
      quantity: 25,
      threshold: 50,
      status: 'Low Stock'
    }
  ]
};

// Routes
app.get('/api/pharmacist/dashboard', (req, res) => {
  console.log('Dashboard API called');
  res.json({
    success: true,
    data: mockDashboardData
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend API is working!',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is healthy',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Pharmacy Management System Backend',
    status: 'Running',
    port: PORT
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`💊 Dashboard API: http://localhost:${PORT}/api/pharmacist/dashboard`);
});