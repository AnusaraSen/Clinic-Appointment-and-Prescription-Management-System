const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const Prescription = require('../modules/clinical-workflow/models/Prescription');

// Sample prescription data
const samplePrescriptions = [
  {
    patient_ID: "PAT001",
    patient_name: "John Smith",
    doctor_Name: "Dr. Alex Mitchell",
    Diagnosis: "Hypertension",
    Symptoms: "High blood pressure, headaches",
    Medicines: [
      {
        Medicine_Name: "Lisinopril",
        Dosage: "10mg",
        Frequency: "Once daily",
        Duration: "30 days"
      }
    ],
    Instructions: "Take with food. Monitor blood pressure daily."
  },
  {
    patient_ID: "PAT002",
    patient_name: "Sarah Johnson",
    doctor_Name: "Dr. Alex Mitchell",
    Diagnosis: "Type 2 Diabetes",
    Symptoms: "Elevated blood sugar, fatigue",
    Medicines: [
      {
        Medicine_Name: "Metformin",
        Dosage: "500mg",
        Frequency: "Twice daily",
        Duration: "90 days"
      },
      {
        Medicine_Name: "Glipizide",
        Dosage: "5mg",
        Frequency: "Once daily",
        Duration: "90 days"
      }
    ],
    Instructions: "Take with meals. Monitor blood glucose regularly."
  },
  {
    patient_ID: "PAT003",
    patient_name: "Michael Brown",
    doctor_Name: "Dr. Alex Mitchell",
    Diagnosis: "Pneumonia",
    Symptoms: "Cough, fever, difficulty breathing",
    Medicines: [
      {
        Medicine_Name: "Amoxicillin",
        Dosage: "500mg",
        Frequency: "Three times daily",
        Duration: "10 days"
      },
      {
        Medicine_Name: "Ibuprofen",
        Dosage: "400mg",
        Frequency: "As needed",
        Duration: "7 days"
      }
    ],
    Instructions: "Complete full antibiotic course. Rest and stay hydrated."
  },
  {
    patient_ID: "PAT004",
    patient_name: "Emily Davis",
    doctor_Name: "Dr. Alex Mitchell",
    Diagnosis: "Anxiety Disorder",
    Symptoms: "Panic attacks, restlessness",
    Medicines: [
      {
        Medicine_Name: "Sertraline",
        Dosage: "50mg",
        Frequency: "Once daily",
        Duration: "30 days"
      }
    ],
    Instructions: "Take in the morning. May cause drowsiness initially."
  },
  {
    patient_ID: "PAT005",
    patient_name: "Robert Wilson",
    doctor_Name: "Dr. Alex Mitchell",
    Diagnosis: "Arthritis",
    Symptoms: "Joint pain, stiffness",
    Medicines: [
      {
        Medicine_Name: "Naproxen",
        Dosage: "250mg",
        Frequency: "Twice daily",
        Duration: "30 days"
      },
      {
        Medicine_Name: "Calcium Supplement",
        Dosage: "500mg",
        Frequency: "Once daily",
        Duration: "90 days"
      }
    ],
    Instructions: "Take with food to avoid stomach upset."
  },
  {
    patient_ID: "PAT006",
    patient_name: "Lisa Anderson",
    doctor_Name: "Dr. Alex Mitchell",
    Diagnosis: "Migraine",
    Symptoms: "Severe headaches, nausea",
    Medicines: [
      {
        Medicine_Name: "Sumatriptan",
        Dosage: "50mg",
        Frequency: "As needed",
        Duration: "30 days"
      }
    ],
    Instructions: "Take at onset of headache. Do not exceed 2 doses per day."
  },
  {
    patient_ID: "PAT007",
    patient_name: "David Thompson",
    doctor_Name: "Dr. Alex Mitchell",
    Diagnosis: "Gastritis",
    Symptoms: "Stomach pain, indigestion",
    Medicines: [
      {
        Medicine_Name: "Omeprazole",
        Dosage: "20mg",
        Frequency: "Once daily",
        Duration: "14 days"
      }
    ],
    Instructions: "Take before breakfast. Avoid spicy foods."
  },
  {
    patient_ID: "PAT008",
    patient_name: "Jennifer Martinez",
    doctor_Name: "Dr. Alex Mitchell",
    Diagnosis: "Allergic Rhinitis",
    Symptoms: "Sneezing, runny nose, watery eyes",
    Medicines: [
      {
        Medicine_Name: "Cetirizine",
        Dosage: "10mg",
        Frequency: "Once daily",
        Duration: "30 days"
      }
    ],
    Instructions: "May cause drowsiness. Take in the evening."
  },
  {
    patient_ID: "PAT009",
    patient_name: "Christopher Lee",
    doctor_Name: "Dr. Alex Mitchell",
    Diagnosis: "Bronchitis",
    Symptoms: "Persistent cough, mucus production",
    Medicines: [
      {
        Medicine_Name: "Dextromethorphan",
        Dosage: "15mg",
        Frequency: "Every 4 hours",
        Duration: "7 days"
      },
      {
        Medicine_Name: "Guaifenesin",
        Dosage: "400mg",
        Frequency: "Twice daily",
        Duration: "7 days"
      }
    ],
    Instructions: "Drink plenty of fluids. Use humidifier."
  },
  {
    patient_ID: "PAT010",
    patient_name: "Amanda White",
    doctor_Name: "Dr. Alex Mitchell",
    Diagnosis: "Insomnia",
    Symptoms: "Difficulty sleeping, fatigue",
    Medicines: [
      {
        Medicine_Name: "Zolpidem",
        Dosage: "5mg",
        Frequency: "Once at bedtime",
        Duration: "14 days"
      }
    ],
    Instructions: "Take only when ready for sleep. Avoid alcohol."
  },
  {
    patient_ID: "PAT011",
    patient_name: "Kevin Garcia",
    doctor_Name: "Dr. Alex Mitchell",
    Diagnosis: "High Cholesterol",
    Symptoms: "Elevated cholesterol levels",
    Medicines: [
      {
        Medicine_Name: "Atorvastatin",
        Dosage: "20mg",
        Frequency: "Once daily",
        Duration: "90 days"
      }
    ],
    Instructions: "Take in the evening. Follow low-fat diet."
  },
  {
    patient_ID: "PAT012",
    patient_name: "Rachel Rodriguez",
    doctor_Name: "Dr. Alex Mitchell",
    Diagnosis: "Eczema",
    Symptoms: "Itchy, inflamed skin",
    Medicines: [
      {
        Medicine_Name: "Hydrocortisone Cream",
        Dosage: "1%",
        Frequency: "Twice daily",
        Duration: "14 days"
      }
    ],
    Instructions: "Apply thin layer to affected areas. Avoid face."
  }
];

async function addSamplePrescriptions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');

    // Check if prescriptions already exist
    const existingCount = await Prescription.countDocuments();
    console.log(`Existing prescriptions: ${existingCount}`);

    if (existingCount < 15) {
      // Add more sample prescriptions to reach a realistic count
      const prescriptionsToAdd = samplePrescriptions.slice(0, 15 - existingCount);
      await Prescription.insertMany(prescriptionsToAdd);
      console.log(`✅ Added ${prescriptionsToAdd.length} sample prescriptions`);
    } else {
      console.log('📝 Sufficient prescriptions already exist in the database');
    }

    // Show final count
    const finalCount = await Prescription.countDocuments();
    console.log(`📊 Total prescriptions in system: ${finalCount}`);

  } catch (error) {
    console.error('Error adding sample prescriptions:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addSamplePrescriptions();