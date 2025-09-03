const router = require('express').Router();
const Prescription = require('../models/Prescription');

// Create a new prescription

router.route('/add').post((req,res) => {

    const {
    patient_ID,
    patient_name,
    doctor_Name,
    Date,
    Diagnosis,
    Symptoms,
    Medicines,
    Instructions
  } = req.body;




    const newPrescription = new Prescription({
    patient_ID,
    patient_name,
    doctor_Name,
    Date: Date || Date.now(), // fallback to current date if not provided
    Diagnosis,
    Symptoms,
    Medicines, // ✅ This is the important part
    Instructions
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

router.route('/update/:id').put(async (req, res) => {
  const prescriptionId = req.params.id;
  
  const {
    patient_ID,
    patient_name,
    doctor_Name,
    Date,
    Diagnosis,
    Symptoms,
    Medicines,
    Instructions
  } = req.body;

  const updatedPrescription = {
    patient_ID,
    patient_name,
    doctor_Name,
    Date,
    Diagnosis,
    Symptoms,
    Medicines, // ✅ This is the important part
    Instructions
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