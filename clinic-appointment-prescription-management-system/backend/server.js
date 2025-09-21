const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const app = express();
// Load .env from this directory explicitly to avoid cwd issues when starting server
dotenv.config({ path: path.resolve(__dirname, '.env') });

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`, req.body);
    next();
});

const URL = process.env.MONGODB_URL;

mongoose.connect(URL)
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

// Route imports - clinical workflow
const prescriptionRouter = require('./modules/clinical-workflow/routes/prescriptions.js');
app.use('/prescription', prescriptionRouter);

const patientRouter = require('./modules/clinical-workflow/routes/Medical_Records.js');
app.use('/patient', patientRouter);

const dashboardRouter = require('./modules/clinical-workflow/routes/dashboard.js');
app.use('/dashboard', dashboardRouter);

const availabilityRoutes = require('./modules/clinical-workflow/routes/AvailabilityRoutes');
app.use('/api/availability', availabilityRoutes);

// Route imports - pharmacy inventory
const medicineRoutes = require('./modules/pharmacy-inventory/routes/medicineRoutes');
const labInventoryRoutes = require('./modules/pharmacy-inventory/routes/labInventoryRoutes');
const authRoutes = require('./modules/user/routes/authRoutes');
const pharmacistRoutes = require('./modules/workforce-facility/routes/pharmacistRoutes');

// Routes - pharmacy
app.use("/api/medicines", medicineRoutes);
app.use("/api/lab-inventory", labInventoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pharmacist", pharmacistRoutes);

// Route imports - patient interaction (converted to CommonJS temporarily)
const appointmentRouter = require("./modules/patient-interaction/routes/appointments.js");
const feedbackRouter = require("./modules/patient-interaction/routes/feedbacks.js");
const prescriptionsRouter = require("./modules/patient-interaction/routes/prescriptions.js");
const patientsRouter = require("./modules/patient-interaction/routes/patients.js");

app.use("/appointment", appointmentRouter);
app.use("/appointments", appointmentRouter);
app.use("/feedback", feedbackRouter);
app.use("/prescriptions", prescriptionsRouter);
app.use("/patients", patientsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Backend server is running!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});