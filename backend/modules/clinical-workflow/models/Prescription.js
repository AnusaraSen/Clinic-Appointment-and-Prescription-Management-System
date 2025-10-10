const mongoose = require('mongoose');

const schema = mongoose.Schema;

const prescriptionSchema = new schema({
  patient_ID: { 
    type: String,
    required: true 
},

  patient_name: {
     type: String, 
     required: true 
    },

  doctor_Name: { 
    type: String, 
    required: true 
},

  

  Date: { 
    type: Date, 
    default: Date.now 
},

  Diagnosis: { 
    type: String, 
    required: true 
},

  Symptoms: { type: String },

  Medicines: [
    {
      Medicine_Name: { type: String, required: true },
      Dosage: { type: String, required: true },
      Frequency: { type: String, required: true },
      Duration: { type: String, required: true },
    }
  ],
  
  Instructions: { type: String },
  // Optional linkage back to an appointment. Not required for legacy prescriptions.
  appointment_id: { type: String, index: true }
});


const prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = prescription;