const http = require('http');
const url = require('url');

const PORT = 5000;

// Mock data
const mockDashboardData = {
  success: true,
  data: {
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
  }
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  console.log(`${req.method} ${req.url}`);
  
  if (parsedUrl.pathname === '/api/pharmacist/dashboard') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockDashboardData));
  } else if (parsedUrl.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'OK',
      message: 'Server is healthy',
      timestamp: new Date().toISOString()
    }));
  } else if (parsedUrl.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'Pharmacy Backend API Server',
      status: 'Running',
      endpoints: [
        '/api/pharmacist/dashboard',
        '/health'
      ]
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      message: 'Endpoint not found',
      path: parsedUrl.pathname
    }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Simple Backend Server running on http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`💊 Dashboard: http://localhost:${PORT}/api/pharmacist/dashboard`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is in use, trying port ${PORT + 1}`);
    server.listen(PORT + 1);
  } else {
    console.error('Server error:', err);
  }
});