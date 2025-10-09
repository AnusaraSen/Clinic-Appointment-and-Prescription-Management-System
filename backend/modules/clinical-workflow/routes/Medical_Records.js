const router = require('express').Router();
const Patient = require('../models/Medical_Records.js');
const { validatePatient } = require('../../patient-interaction/routes/validation');
const Prescription = require('../models/Prescription'); // for history aggregation
const PDFDocument = require('pdfkit');

// For file upload (photo)
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Add photo-only endpoints for patients (migrated from PhotoRoute.js)

// Add/Update patient photo by patient ID (POST/PUT)
router.post('/addPhoto/:id', async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ error: 'Image data is required' });
        }
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        patient.photo = image;
        // mimeType, size, createdAt will be set by pre-save hook
        await patient.save();
        res.status(201).json({
            success: true,
            id: patient._id,
            message: 'Photo added to patient successfully'
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all patient photos (for gallery)
router.get('/photos', async (req, res) => {
    try {
        const patients = await Patient.find({ photo: { $exists: true, $ne: null } }).sort({ createdAt: -1 });
        res.json(patients.map(p => ({
            _id: p._id,
            photo: p.photo,
            mimeType: p.mimeType,
            size: p.size,
            createdAt: p.createdAt,
            patient_ID: p.patient_ID,
            patient_name: p.patient_name
        })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch patient photos' });
    }
});

// Get single patient photo by patient ID
router.get('/photo/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient || !patient.photo) {
            return res.status(404).json({ error: 'Photo not found' });
        }
        res.json({
            _id: patient._id,
            photo: patient.photo,
            mimeType: patient.mimeType,
            size: patient.size,
            createdAt: patient.createdAt,
            patient_ID: patient.patient_ID,
            patient_name: patient.patient_name
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch photo' });
    }
});

// Update patient photo by patient ID
router.put('/updatePhoto/:id', async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ error: 'Image data is required' });
        }
        const patient = await Patient.findByIdAndUpdate(
            req.params.id,
            { photo: image },
            { new: true, runValidators: true }
        );
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.json({
            id: patient._id,
            mimeType: patient.mimeType,
            size: patient.size,
            createdAt: patient.createdAt
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete patient photo by patient ID
router.delete('/deletePhoto/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient || !patient.photo) {
            return res.status(404).json({ error: 'Photo not found' });
        }
        patient.photo = undefined;
        patient.mimeType = undefined;
        patient.size = undefined;
        await patient.save();
        res.json({ id: patient._id, message: 'Photo deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete photo' });
    }
});


// Create a new patient (with optional photo)
router.route('/add').post(upload.single('photo'), validatePatient, (req, res) => {


    // Normalize patient_ID (NIC) to avoid duplicates differing only by case/whitespace
    const rawPatientId = req.body.patient_ID || '';
    const patient_ID = rawPatientId.trim();
        const patient_name = req.body.patient_name;
        const patient_age = Number(req.body.patient_age);
        const Gender = req.body.Gender;
        const Email = req.body.Email;
        const Emergency_Contact = req.body.Emergency_Contact;
        const Allergies = req.body.Allergies;
        const Current_medical_conditions = req.body.Current_medical_conditions;
        const Past_surgeries = req.body.Past_surgeries;
        const Blood_group = req.body.Blood_group;
        const Smoking_status = req.body.Smoking_status;
        const Alcohol_consumption = req.body.Alcohol_consumption;

        let photo = '';
        if (req.file) {
            // Always save as data URL
            photo = `data:image/jpeg;base64,${req.file.buffer.toString('base64')}`;
        }

        const newPatient = new Patient({
            patient_ID,
            patient_name,
            patient_age,
            Gender,
            Email,
            Emergency_Contact,
            Allergies,
            Current_medical_conditions,
            Past_surgeries,
            Blood_group,
            Smoking_status,
            Alcohol_consumption,
            photo
        });

    newPatient.save()
        .then(() => {
            res.json('Patient added successfully');
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json('Error: ' + err);
        });
});


// Get all patients

router.route('/get').get( async (req, res) => {

    await Patient.find().then((patients) => {
        res.json(patients);
    }).catch((err) => {
        console.error(err);
        res.status(500).json('Error: ' + err);
    }
    );
});


// Get a patient by ID

router.route('/get/:id').get(async (req,res) =>{

    await Patient.findById(req.params.id)
    .then((patient) => {
        res.status(200).send({ status: "Patient fetched successfully", Patient: patient });
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json('Error: ' + err);
    })
});


// updating a patient (with optional photo upload)
router.route('/update/:id').put(upload.single('photo'), validatePatient, async (req, res) => {
    const userId = req.params.id;

    // If using multipart/form-data (with file), fields are in req.body, file in req.file
    const {
        patient_ID,
        patient_name,
        patient_age,
        Gender,
        Email,
        Emergency_Contact,
        Allergies,
        Current_medical_conditions,
        Past_surgeries,
        Blood_group,
        Smoking_status,
        Alcohol_consumption
    } = req.body;

    let updatePatient = {
        patient_ID,
        patient_name,
        patient_age,
        Gender,
        Email,
        Emergency_Contact,
        Allergies,
        Current_medical_conditions,
        Past_surgeries,
        Blood_group,
        Smoking_status,
        Alcohol_consumption
    };

    // If a new photo is uploaded, update it
    if (req.file) {
        updatePatient.photo = `data:image/jpeg;base64,${req.file.buffer.toString('base64')}`;
    }

    await Patient.findByIdAndUpdate(userId, updatePatient)
        .then(() => {
            res.status(200).send({ status: "Patient updated successfully" });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json('Error: ' + err);
        });
});


//deleting a patient

router.route('/delete/:id').delete(async (req, res) => {

    let userId = req.params.id;

    await Patient.findByIdAndDelete(userId).then(() => {
        res.status(200).send({ status: "Patient deleted successfully" });
    })
    .catch((err) => {   
        console.error(err);
        res.status(500).json('Error: ' + err);
    }
    );
});


module.exports = router;

// Combined patient history endpoint by patient_ID (NIC/code)
router.get('/history/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        if (!patientId) return res.status(400).json({ message: 'patientId is required' });
        // Normalize inbound patientId (trim + case-insensitive search)
        const normalized = patientId.trim();
        // First attempt exact match (trimmed)
        let patient = await Patient.findOne({ patient_ID: normalized });
        if (!patient) {
            // Fallback: case-insensitive match (regex anchored)
            const regex = new RegExp(`^${normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
            patient = await Patient.findOne({ patient_ID: regex });
        }
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        const prescriptions = await Prescription.find({ patient_ID: patient.patient_ID }).sort({ Date: -1 });
        return res.json({ patient, prescriptions, prescriptionCount: prescriptions.length });
    } catch (error) {
        console.error('Error fetching patient history', error);
        return res.status(500).json({ message: 'Failed to fetch patient history' });
    }
});

// PDF export for patient history
router.get('/history/:patientId/export/pdf', async (req, res) => {
    try {
        const { patientId } = req.params;
        if (!patientId) return res.status(400).json({ message: 'patientId is required' });
        const patient = await Patient.findOne({ patient_ID: patientId });
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        const prescriptions = await Prescription.find({ patient_ID: patientId }).sort({ Date: -1 });

        // Setup PDF
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="patient_${patientId}_history.pdf"`);
        doc.pipe(res);

        doc.fontSize(18).text('Patient History', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#555').text(`Generated: ${new Date().toLocaleString()}`);
        doc.moveDown();

        doc.fillColor('#000').fontSize(12).text('Patient Details', { underline: true });
        doc.fontSize(10);
        const details = [
            ['Patient ID', patient.patient_ID],
            ['Name', patient.patient_name],
            ['Age', patient.patient_age],
            ['Gender', patient.Gender],
            ['Blood Group', patient.Blood_group],
            ['Email', patient.Email],
            ['Emergency Contact', patient.Emergency_Contact],
            ['Allergies', patient.Allergies || '-'],
            ['Current Conditions', patient.Current_medical_conditions || '-'],
            ['Past Surgeries', patient.Past_surgeries || '-'],
        ];
        details.forEach(([k,v]) => doc.text(`${k}: ${v ?? '-'}`));
        doc.moveDown();

        doc.fontSize(12).text(`Prescriptions (${prescriptions.length})`, { underline: true });
        doc.moveDown(0.5);

        prescriptions.forEach((p, idx) => {
            doc.fontSize(11).fillColor('#000').text(`${idx+1}. Date: ${p.Date ? new Date(p.Date).toLocaleDateString() : '-'}`);
            doc.fontSize(10).fillColor('#000');
            if (p.doctor_Name) doc.text(`Doctor: ${p.doctor_Name}`);
            if (p.Diagnosis) doc.text(`Diagnosis: ${p.Diagnosis}`);
            if (p.Symptoms) doc.text(`Symptoms: ${p.Symptoms}`);
            if (p.Instructions) doc.text(`Instructions: ${p.Instructions}`);
            if (Array.isArray(p.Medicines) && p.Medicines.length) {
                doc.text('Medicines:');
                p.Medicines.forEach(m => {
                    const line = ` - ${m.Medicine_Name || m.name || 'Unknown'} | ${m.Dosage||''} ${m.Frequency||''} ${m.Duration||''}`.trim();
                    doc.text(line);
                });
            }
            doc.moveDown(0.5);
            if (doc.y > 760) doc.addPage();
        });

        doc.end();
    } catch (error) {
        console.error('Error exporting patient history PDF', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Failed to export PDF' });
        }
    }
});