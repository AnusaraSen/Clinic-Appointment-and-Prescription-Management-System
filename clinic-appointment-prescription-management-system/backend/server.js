const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());


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

const patientRouter = require('./modules/clinical-workflow/routes/patients.js');
app.use('/patient', patientRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});