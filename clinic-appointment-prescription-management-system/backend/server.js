const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

// Route imports
const medicineRoutes = require('./modules/pharmacy-inventory/routes/medicineRoutes');
const labInventoryRoutes = require('./modules/pharmacy-inventory/routes/labInventoryRoutes');
const authRoutes = require('./modules/user/routes/authRoutes');
const pharmacistRoutes = require('./modules/workforce-facility/routes/pharmacistRoutes');
const prescriptionRoutes = require('./modules/clinical-workflow/routes/prescriptionRoutes');


// Initialize app and config
const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

<<<<<<< Updated upstream
// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log('Request received:', req.method, req.url);
  next();
});

// Database connection
const URL = process.env.MONGODB_URL;

mongoose.connect(URL)
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

// Routes
app.use("/api/medicines", medicineRoutes);
app.use("/api/lab-inventory", labInventoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pharmacist", pharmacistRoutes);
app.use("/api/prescriptions", prescriptionRoutes);

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
=======
// Connect to database
connectDB()
  .then(() => {
    console.log('✅ Database connection established');
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  });

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
>>>>>>> Stashed changes
