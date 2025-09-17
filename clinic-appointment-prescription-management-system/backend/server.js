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


const prescriptionRouter = require('./modules/clinical-workflow/routes/prescriptions.js');
app.use('/prescription', prescriptionRouter);

const patientRouter = require('./modules/clinical-workflow/routes/Medical_Records.js');
app.use('/patient', patientRouter);

const dashboardRouter = require('./modules/clinical-workflow/routes/dashboard.js');
app.use('/dashboard', dashboardRouter);

const availabilityRoutes = require('./modules/clinical-workflow/routes/AvailabilityRoutes');
app.use('/api/availability', availabilityRoutes);

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Backend server is running!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});