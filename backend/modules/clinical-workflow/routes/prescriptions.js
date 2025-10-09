const router = require('express').Router();
const Prescription = require('../models/Prescription');
const PDFDocument = require('pdfkit');
const { validatePrescription } = require('../../patient-interaction/routes/validation');
// Added: endpoint to fetch prescriptions by patient_ID for patient history feature

// Create a new prescription

router.route('/add').post(validatePrescription, (req,res) => {

    const {
      patient_ID,
      patient_name,
      doctor_Name,
      Date,
      Diagnosis,
      Symptoms,
      Medicines,
      Instructions,
      appointment_id
    } = req.body;




    const newPrescription = new Prescription({
      patient_ID,
      patient_name,
      doctor_Name,
      Date: Date || Date.now(), // fallback to current date if not provided
      Diagnosis,
      Symptoms,
      Medicines, // ✅ This is the important part
      Instructions,
      appointment_id: appointment_id || undefined
    });

    newPrescription.save()
    .then(() => {
        res.json('Prescription added successfully');
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json('Error: ' + err);
    });
    
});


// Get all prescriptions

router.route('/get').get((req, res) => {

    Prescription.find()
    .then((prescriptions) => {
        res.json(prescriptions);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json('Error: ' + err);
    });
});


// Get a prescription by ID
router.route('/get/:id').get(async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id);
        res.status(200).send({ status: "User fetched successfully", Prescription: prescription });
    } catch (err) {
        console.error(err);
        res.status(500).json('Error: ' + err);
    }
});


//update a prescription by ID

router.route('/update/:id').put(validatePrescription, async (req, res) => {
  const prescriptionId = req.params.id;
  
  const {
    patient_ID,
    patient_name,
    doctor_Name,
    Date,
    Diagnosis,
    Symptoms,
    Medicines,
    Instructions,
    appointment_id
  } = req.body;

  const updatedPrescription = {
    patient_ID,
    patient_name,
    doctor_Name,
    Date,
    Diagnosis,
    Symptoms,
    Medicines, // ✅ This is the important part
    Instructions,
    appointment_id: appointment_id || undefined
  };

  try {
    const updated = await Prescription.findByIdAndUpdate(prescriptionId, updatedPrescription, { new: true });
    if (!updated) return res.status(404).json({ error: "Prescription not found" });
    res.status(200).json({ status: "Prescription updated successfully", prescription: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json('Error: ' + err);
  }
});

//delete a prescription by ID
router.route('/delete/:id').delete(async (req, res) => {

    let prescriptionId = req.params.id;
    try {
        await Prescription.findByIdAndDelete(prescriptionId);
        res.status(200).send({ status: "User deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json('Error: ' + err);
    }
});



module.exports = router;

// New endpoint: get prescriptions by patient_ID (NIC/code)
router.get('/by-patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!patientId) return res.status(400).json({ message: 'patientId is required' });
    const prescriptions = await Prescription.find({ patient_ID: patientId }).sort({ Date: -1 });
    return res.json({ items: prescriptions, count: prescriptions.length });
  } catch (err) {
    console.error('Error fetching prescriptions by patient:', err);
    return res.status(500).json({ message: 'Failed to fetch prescriptions' });
  }
});

// New endpoint: get prescriptions by appointment_id
router.get('/by-appointment/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    if (!appointmentId) return res.status(400).json({ message: 'appointmentId is required' });

    // Primary: prescriptions explicitly linked to this appointment
    let linked = await Prescription.find({ appointment_id: appointmentId }).sort({ Date: -1 });
    if (linked.length) {
      return res.json({ items: linked, count: linked.length, inferred: false });
    }

    // Fallback: attempt to infer legacy prescriptions (those without appointment_id) that belong to this appointment.
    // Strategy:
    // 1. Load the appointment to obtain patient identifiers & date.
    // 2. Fetch prescriptions for the same patient_ID (patient NIC is stored as patient_ID in prescription) where appointment_id is null/absent.
    // 3. Optionally filter by date proximity (same calendar day) to reduce false positives.
    //    We'll implement a +-1 day window around the appointment_date to be tolerant of timezone drift or late entry.
    const Appointment = require('../../patient-interaction/models/Appointments');
    const appt = await Appointment.findById(appointmentId);
    if (!appt) {
      return res.json({ items: [], count: 0, inferred: false, message: 'Appointment not found' });
    }

    const patientIdCandidate = (appt.patient_nic || appt.patient_id || '').trim();
    if (!patientIdCandidate) {
      return res.json({ items: [], count: 0, inferred: false, message: 'Appointment missing patient identifier' });
    }

    // Build date window if appointment_date present
    let dateFilter = {};
    if (appt.appointment_date) {
      const apptDate = new Date(appt.appointment_date);
      const start = new Date(apptDate); start.setHours(0,0,0,0);
      const end = new Date(apptDate); end.setHours(23,59,59,999);
      // Extend by 1 day on both sides to be safe
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() + 1);
      dateFilter = { Date: { $gte: start, $lte: end } };
    }

    const legacyQuery = {
      patient_ID: patientIdCandidate,
      $or: [ { appointment_id: { $exists: false } }, { appointment_id: null }, { appointment_id: '' } ],
      ...dateFilter
    };
    const inferred = await Prescription.find(legacyQuery).sort({ Date: -1 });

    return res.json({
      items: inferred,
      count: inferred.length,
      inferred: true,
      patientMatch: patientIdCandidate,
      legacyFallbackApplied: true
    });
  } catch (err) {
    console.error('Error fetching prescriptions by appointment (with fallback):', err);
    return res.status(500).json({ message: 'Failed to fetch prescriptions' });
  }
});

// Export a single prescription as PDF
router.get('/:id/export/pdf', async (req, res) => {
  try {
    const { id } = req.params;
    const p = await Prescription.findById(id);
    if (!p) return res.status(404).json({ message: 'Prescription not found' });
    const filename = `prescription_${id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);
    doc.fontSize(18).text('Prescription', { align: 'center' });
    doc.moveDown();
    doc.fontSize(11).text(`Date: ${p.Date ? new Date(p.Date).toLocaleDateString() : '-'}`);
    doc.text(`Patient: ${p.patient_name || '-'} (${p.patient_ID || '-'})`);
    if (p.appointment_id) doc.text(`Appointment: ${p.appointment_id}`);
    doc.text(`Doctor: ${p.doctor_Name || '-'}`);
    doc.moveDown(0.5);
    doc.fontSize(12).text('Diagnosis', { underline: true });
    doc.fontSize(11).text(p.Diagnosis || '-');
    if (p.Symptoms) { doc.moveDown(0.5); doc.fontSize(12).text('Symptoms', { underline: true }); doc.fontSize(11).text(p.Symptoms); }
    if (Array.isArray(p.Medicines) && p.Medicines.length) {
      doc.moveDown(0.5); doc.fontSize(12).text('Medicines', { underline: true });
      p.Medicines.forEach((m,i) => {
        const line = `${i+1}. ${m.Medicine_Name}  |  Dosage: ${m.Dosage}  |  Freq: ${m.Frequency}  |  Dur: ${m.Duration}`;
        doc.fontSize(10).text(line);
      });
    }
    if (p.Instructions) { doc.moveDown(0.5); doc.fontSize(12).text('Instructions', { underline: true }); doc.fontSize(11).text(p.Instructions); }
    doc.end();
  } catch (err) {
    console.error('Error exporting prescription PDF', err);
    if (!res.headersSent) res.status(500).json({ message: 'Failed to export PDF' });
  }
});

// Export all prescriptions for an appointment as a single PDF
router.get('/by-appointment/:appointmentId/export/pdf', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    if (!appointmentId) return res.status(400).json({ message: 'appointmentId is required' });
    let prescriptions = await Prescription.find({ appointment_id: appointmentId }).sort({ Date: 1 });
    let inferredFallback = false;
    let patientMatch = null;
    if (!prescriptions.length) {
      // Attempt fallback identical to JSON route
      const Appointment = require('../../patient-interaction/models/Appointments');
      const appt = await Appointment.findById(appointmentId);
      if (appt) {
        patientMatch = (appt.patient_nic || appt.patient_id || '').trim();
        if (patientMatch) {
          let dateFilter = {};
          if (appt.appointment_date) {
            const apptDate = new Date(appt.appointment_date);
            const start = new Date(apptDate); start.setHours(0,0,0,0); start.setDate(start.getDate() - 1);
            const end = new Date(apptDate); end.setHours(23,59,59,999); end.setDate(end.getDate() + 1);
            dateFilter = { Date: { $gte: start, $lte: end } };
          }
          const legacyQuery = {
            patient_ID: patientMatch,
            $or: [ { appointment_id: { $exists: false } }, { appointment_id: null }, { appointment_id: '' } ],
            ...dateFilter
          };
            prescriptions = await Prescription.find(legacyQuery).sort({ Date: 1 });
            inferredFallback = true;
        }
      }
    }
    if (!prescriptions.length) return res.status(404).json({ message: 'No prescriptions for appointment' });
    const filename = `appointment_${appointmentId}_prescriptions.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    const doc = new PDFDocument({ margin: 36, size: 'A4' });
    doc.pipe(res);
    doc.fontSize(18).text('Appointment Prescriptions', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#555').text(`Generated: ${new Date().toLocaleString()}`);
    if (inferredFallback) {
      doc.moveDown(0.2).fillColor('#aa0000').fontSize(10).text('Legacy fallback applied: prescriptions inferred by patient ID and date window');
      if (patientMatch) doc.fillColor('#555').text(`Patient match: ${patientMatch}`);
    }
    doc.moveDown();
    prescriptions.forEach((p, idx) => {
      doc.fillColor('#000').fontSize(13).text(`Prescription ${idx+1}`, { underline: true });
      doc.fontSize(10).text(`Date: ${p.Date ? new Date(p.Date).toLocaleDateString() : '-'}`);
      doc.text(`Patient: ${p.patient_name || '-'} (${p.patient_ID || '-'})`);
      if (p.appointment_id) doc.text(`Appointment: ${p.appointment_id}`); else if (inferredFallback) doc.text('(Legacy prescription not originally linked to appointment)');
      doc.text(`Doctor: ${p.doctor_Name || '-'}`);
      doc.moveDown(0.3);
      if (p.Diagnosis) doc.fontSize(11).text(`Diagnosis: ${p.Diagnosis}`);
      if (p.Symptoms) doc.fontSize(10).text(`Symptoms: ${p.Symptoms}`);
      if (Array.isArray(p.Medicines) && p.Medicines.length) {
        doc.moveDown(0.2).fontSize(11).text('Medicines:');
        p.Medicines.forEach(m => doc.fontSize(9).text(` - ${m.Medicine_Name} | ${m.Dosage} | ${m.Frequency} | ${m.Duration}`));
      }
      if (p.Instructions) doc.moveDown(0.2).fontSize(10).text(`Instructions: ${p.Instructions}`);
      doc.moveDown();
      if (doc.y > 750) doc.addPage();
    });
    doc.end();
  } catch (err) {
    console.error('Error exporting appointment prescriptions PDF', err);
    if (!res.headersSent) res.status(500).json({ message: 'Failed to export PDF' });
  }
});