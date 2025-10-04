const express = require("express");
const router = express.Router();
const {
  createLabTest,
  getAllLabTests,
  getLabTestById,
  updateLabTest,
  deleteLabTest,
  updateLabTestStatus,
  getLabTestsByPatient,
  getLabTestsByDoctor,
  assignStaffToLabTest,
  getAvailableStaff,
  createSampleData
} = require("../Controllers/labTestController");

// ================= LAB TEST ROUTES =================

// Create new lab test
router.post("/", createLabTest);

// Get all lab tests with filtering and pagination
router.get("/", getAllLabTests);

// Get lab test by ID
router.get("/:id", getLabTestById);

// Update lab test
router.put("/:id", updateLabTest);

// Delete lab test
router.delete("/:id", deleteLabTest);

// Update lab test status
router.patch("/:id/status", updateLabTestStatus);

// Get lab tests by patient
router.get("/patient/:patientId", getLabTestsByPatient);

// Get lab tests by doctor
router.get("/doctor/:doctorId", getLabTestsByDoctor);

// Assign staff to lab test
router.patch("/:id/assign", assignStaffToLabTest);

// Get available staff
router.get("/staff/available", getAvailableStaff);

// Create sample data for testing
router.post("/sample-data", createSampleData);

// Create missing doctor records
router.post("/create-doctors", async (req, res) => {
  try {
    const Doctor = require("../../workforce-facility/models/Doctor"); // Use existing Doctor model
    const mongoose = require("mongoose");
    
    const doctorsData = [
      {
        _id: new mongoose.Types.ObjectId('68b2e51e8ec1571a1d749e4c'),
        doctor_id: 'DOC-001',
        name: 'Dr. Emily Watson',
        email: 'emily.watson@clinic.com',
        specialization: 'Internal Medicine',
        specialty: 'Internal Medicine',
        experience: 8,
        qualifications: ['MD', 'MBBS', 'Internal Medicine Specialist']
      },
      {
        _id: new mongoose.Types.ObjectId('68b2e51e8ec1571a1d749e4d'),
        doctor_id: 'DOC-002',
        name: 'Dr. Michael Chen',
        email: 'michael.chen@clinic.com',
        specialization: 'Urology',
        specialty: 'Urology',
        experience: 12,
        qualifications: ['MD', 'Urology Specialist', 'Board Certified']
      },
      {
        _id: new mongoose.Types.ObjectId('68b2e51e8ec1571a1d749e4b'),
        doctor_id: 'DOC-003',
        name: 'Dr. Sarah Davis',
        email: 'sarah.davis@clinic.com',
        specialization: 'Endocrinology',
        specialty: 'Endocrinology',
        experience: 10,
        qualifications: ['MD', 'PhD', 'Endocrinology Specialist']
      }
    ];

    const createdDoctors = [];
    
    for (const doctorData of doctorsData) {
      const existingDoctor = await Doctor.findById(doctorData._id);
      
      if (!existingDoctor) {
        const doctor = new Doctor(doctorData);
        await doctor.save();
        createdDoctors.push(doctor);
      }
    }

    res.status(200).json({
      success: true,
      message: `${createdDoctors.length} doctors created successfully`,
      data: { doctors: createdDoctors }
    });

  } catch (error) {
    console.error("Error creating doctors:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create doctors",
      error: error.message
    });
  }
});

// Insert comprehensive lab test data
router.post("/insert-test-data", async (req, res) => {
  try {
    const LabTest = require("../Model/LabTest");
    const mongoose = require("mongoose");
    
    const labTestsData = [
      {
        labtest_id: 'LT-10004',
        patient: new mongoose.Types.ObjectId('68cbc3b520d57431cbc097ba'),
        doctor: new mongoose.Types.ObjectId('68b2e51e8ec1571a1d749e4c'),
        type: 'Lipid Profile',
        status: 'Pending',
        priorityLevel: 'High',
        equipments: [
          {
            name: 'Chemistry Analyzer',
            quantity: 1,
            status: 'Reserved'
          }
        ],
        requestedBy: 'Dr. Emily Watson',
        notes: 'Lipid profile for cardiovascular risk assessment. Patient should be fasting.',
        estimatedCompletionTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
        specialInstructions: 'Patient must fast for 12 hours before sample collection',
      },
      {
        labtest_id: 'LT-10005',
        patient: new mongoose.Types.ObjectId('68cbc3b520d57431cbc097bb'),
        doctor: new mongoose.Types.ObjectId('68b2e51e8ec1571a1d749e4b'),
        type: 'Thyroid Function Test',
        labAssistant: new mongoose.Types.ObjectId('68cbc3b620d57431cbc097c2'),
        status: 'In Progress',
        collectedDate: new Date('2025-09-18T09:15:30.000Z'),
        priorityLevel: 'Medium',
        equipments: [
          {
            name: 'Immunoassay Analyzer',
            quantity: 1,
            status: 'In Use'
          }
        ],
        requestedBy: 'Dr. Sarah Davis',
        notes: 'TSH, T3, T4 levels for thyroid function evaluation',
        estimatedCompletionTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
      },
      {
        labtest_id: 'LT-10006',
        patient: new mongoose.Types.ObjectId('68cbc3b520d57431cbc097bc'),
        doctor: new mongoose.Types.ObjectId('68b2e51e8ec1571a1d749e4c'),
        type: 'Liver Function Test',
        status: 'Pending',
        priorityLevel: 'Urgent',
        equipments: [
          {
            name: 'Chemistry Analyzer',
            quantity: 1,
            status: 'Available'
          }
        ],
        requestedBy: 'Dr. Emily Watson',
        notes: 'Comprehensive liver function panel including ALT, AST, Bilirubin',
        estimatedCompletionTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
        urgentReason: 'Patient presenting with abdominal pain and jaundice',
      }
    ];

    const insertedTests = [];
    for (const testData of labTestsData) {
      const existingTest = await LabTest.findOne({ labtest_id: testData.labtest_id });
      
      if (!existingTest) {
        const labTest = new LabTest(testData);
        const savedTest = await labTest.save();
        insertedTests.push(savedTest);
      }
    }

    res.status(200).json({
      success: true,
      message: `${insertedTests.length} lab tests created successfully`,
      data: { 
        insertedTests: insertedTests,
        totalTestsCreated: insertedTests.length
      }
    });

  } catch (error) {
    console.error("Error inserting lab test data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to insert lab test data",
      error: error.message
    });
  }
});

module.exports = router;